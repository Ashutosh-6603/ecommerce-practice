import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";

export const isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      res.status(401);
      return next(new Error("Please Login to access this resource"));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await userModel.findById(decodedData.id);
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles) => {
  try {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        res.status(403);
        return next(
          new Error(
            `Role: ${req.user.role} is not allowed to access this resouce `
          )
        );
      }
      next();
    };
  } catch (error) {
    next(error);
  }
};
