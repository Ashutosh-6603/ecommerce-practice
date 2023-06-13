import { userModel } from "../models/userModel.js";
import sendToken from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// Register a User
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    //   const hashedPassword = await bcrypt.hash(password);

    const user = await userModel.create({
      name,
      email,
      // password: hashedPassword,
      password,
      avatar: {
        public_id: "This is a sample id",
        url: "ProfilepicURL",
      },
    });

    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login User
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // checking if user has given password and email both
    if (!email || !password) {
      res.status(400);
      return next(new Error("Please Email & Password"));
    }

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      res.status(401);
      return next(new Error("User not found"));
    }

    const isPasswordMatched = user.comparePassword(password);

    if (!isPasswordMatched) {
      res.status(401);
      return next(new Error("Invalid Email or Password"));
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    next(error);
  }
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      res.status(404);
      return next(new Error("User not found"));
    }

    // Get Reset Password Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n  ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password recovery.`,
        message,
      });
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully.`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(500);
      return next(new Error(error.message));
    }
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    // creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .toString("hex");

    const user = await userModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(404);
      return next(
        new Error("Reset Password Token is invalid or has been expired")
      );
    }
    if (req.body.password !== req.body.confirmPassword) {
      res.status(400);
      return next(new Error("Password does not match."));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Get User Details
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update User password
export const updatePassword = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id).select("+password");

    const isPasswordMatched = user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      res.status(400);
      return next(new Error("Old Password is incorrect"));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      res.status(400);
      return next(new Error("Password does not match"));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Update User Profile
export const updateProfile = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };

    // We will add cloudinary later

    const user = await userModel.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Get all Users details (for admin)
export const getAllUser = async (req, res, next) => {
  try {
    const users = await userModel.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get single user details (for admin)
export const getSingleUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      res.status(404);
      return next(new Error(`User does not exist with id: ${req.params.id}`));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update User Role (for Admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    // We will add cloudinary later

    const user = await userModel.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
    });
    if (user) {
      res.status(200).json({
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Delete User (for Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(500);
      return next(new Error("User not found"));
    }

    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};
