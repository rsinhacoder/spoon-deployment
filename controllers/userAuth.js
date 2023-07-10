import { userModel } from "../models/userModel.js";
import bcrypt from "bcrypt";
import config from "../config.js";
import { mailer } from "../helperFunctions/mailer.js";
import jwt from "jsonwebtoken";
import {
  emailFormatChecker,
  phoneNumberFormatChecker,
} from "../helperFunctions/checker.js";

//User Registration
export const userRegister = async (request, response, next) => {
  try {
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email address"));
    }
    if (!phoneNumberFormatChecker(request.body.phoneNumber)) {
      response.status(530);
      return next(new Error("Invalid phone number."));
    }
    const userPhoneNumber = await userModel.findOne({
      phoneNumber: request.body.phoneNumber,
    });
    if (userPhoneNumber !== null) {
      response.status(409);
      return next(
        new Error(
          "User already registered with this phone number. Try another phone number."
        )
      );
    }
    const user = await userModel.findOne({
      email: request.body.email,
    });
    if (user !== null) {
      response.status(409);
      return next(new Error("Email already registered."));
    }
    const hashedPassword = await bcrypt.hash(
      request.body.password,
      config.saltValue
    );
    const newUser = new userModel({
      email: request.body.email,
      password: hashedPassword,
      phoneNumber: request.body.phoneNumber,
    });
    const registeredUser = await newUser.save();
    if (registeredUser?._id) {
      return response.status(200).json({
        data: null,
        message: "User has been registered succesfully",
        success: true,
      });
    } else {
      next(new Error("Failed to register user"));
    }
  } catch (error) {
    next(error);
  }
};

//User Login
export const userLogin = async (request, response, next) => {
  try {
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email address"));
    }
    const user = await userModel.findOne({
      email: request.body.email,
    });
    if (user === null) {
      response.status(401);
      return next(new Error("User not found."));
    } else {
      if (await bcrypt.compare(request.body.password, user.password)) {
        const responseAfterUpdate = await userModel.findOneAndUpdate(
          {
            _id: user._id,
          },
          {
            $set: {
              isActive: true,
            },
          },
          { new: true }
        );
        if (!responseAfterUpdate?._id) {
          response.status(400);
          return next(new Error("Failed to login."));
        }
        const payload = {
          id: responseAfterUpdate._id,
          userName: responseAfterUpdate.userName,
          password: responseAfterUpdate.password,
        };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
        return response.status(200).json({
          userDetails: responseAfterUpdate,
          token: token,
          message: "Valid user.",
          success: true,
        });
      } else {
        response.status(401);
        return next(new Error("Wrong Password."));
      }
    }
  } catch (error) {
    next(error);
  }
};

//get user data
export const userData = async (request, response, next) => {
  try {
    const payload = jwt.verify(request.body.token, config.jwtSecret);
    const user = await userModel.findOne({
      _id: payload.id,
    });
    return response.status(200).json({
      data: user,
      message: "User details.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//send-reset-password mail
export const setPassword = async (request, response, next) => {
  try {
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email address"));
    }
    const user = await userModel.findOne({
      email: request.body.email,
    });
    if (user === null) {
      response.status(401);
      return next(new Error("User not found."));
    }
    const secret = config.jwtSecret + user.password;
    const payload = {
      email: request.body.email,
      id: user._id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "5m" });
    const link = `http://localhost:3000/user/reset-password/${user._id}/${token}`;
    mailer(request.body.email, link);
    return response.status(200).json({
      data: null,
      message: `Email send to ${request.body.email}`,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//reset link validation
export const resetPasswordVerification = async (request, response, next) => {
  const { id, token } = request.params;
  try {
    const user = await userModel.findOne({
      _id: id,
    });
    const secret = config.jwtSecret + user.password;
    try {
      jwt.verify(token, secret);
      return response.status(200).json({
        data: { email: user.email },
        message: "User verified for reset password",
        success: true,
      });
    } catch (error) {
      response.status(403);
      return next(
        new Error("Not authenticated to reset password. Please try again")
      );
    }
  } catch (error) {
    next(error);
  }
};

//reset password
export const resetPassword = async (request, response, next) => {
  try {
    const data = await userModel.findOne({ _id: request.body.userId });
    if (await bcrypt.compare(request.body.oldPassword, data.password)) {
      try {
        const responseAfterUpdate = await userModel.findOneAndUpdate(
          {
            _id: data._id,
          },
          {
            $set: {
              password: await bcrypt.hash(
                request.body.newPassword,
                config.saltValue
              ),
            },
          }
        );
        if (responseAfterUpdate?._id) {
          return response.status(200).json({
            data: null,
            message: "Password rest successfully",
            success: true,
          });
        } else {
          response.status(401);
          return next(new Error("Failed to reset password. Please try again."));
        }
      } catch (error) {
        response.status(403);
        return next(new Error("Token validation failed."));
      }
    } else {
      response.status(403);
      return next(new Error("old password is wrong"));
    }
  } catch (error) {
    next(error);
  }
};

// Forget Password
export const forgetPassword = async (request, response, next) => {
  try {
    if (!emailFormatChecker(request.body.email)) {
      return response.send({
        data: null,
        message: "Invalid email address.",
        status: 530,
        success: false,
      });
    }
    let user = await userModel.findOne({
      email: request.body.email,
    });
    if (await bcrypt.compare(request.body.newPassword, user.password)) {
      response.status(400);
      return next(new Error("Old password can not be same as new password!"));
    }
    const secret = config.jwtSecret + user.password;
    try {
      const payload = jwt.verify(request.body.token, secret);
      const responseAfterUpdate = await userModel.findOneAndUpdate(
        {
          _id: payload.id,
        },
        {
          $set: {
            password: await bcrypt.hash(
              request.body.newPassword,
              config.saltValue
            ),
          },
        }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: null,
          message: "Password reset successfully.",
          status: 200,
          success: true,
        });
      } else {
        response.status(401);
        return next(new Error("Failed to reset password. Please try again."));
      }
    } catch (error) {
      response.status(403);
      return next(new Error("Token validation failed."));
    }
  } catch (error) {
    next(error);
  }
};
