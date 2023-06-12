import { userModel } from "../models/userModel.js";
import sendToken from "../utils/jwtToken.js";

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

    // const token = user.getJWTToken();

    // res.status(201).json({
    //   status: true,
    //   token,
    // });
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

    // const token = user.getJWTToken();

    // res.status(200).json({
    //   status: true,
    //   token,
    // });
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
