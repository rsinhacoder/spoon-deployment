import { adminModel } from "../models/adminModel.js";
import bcrypt from "bcrypt";
import config from "../config.js";
import { mailer } from "../helperFunctions/mailer.js";
import jwt from "jsonwebtoken";
import { emailFormatChecker } from "../helperFunctions/checker.js";

//Admin Registration
export const adminRegister = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      response.status(400);
      return next(new Error("Please provide email and password"));
    }
    if (!emailFormatChecker(email)) {
      response.status(530);
      return next(new Error("Invalid email address")); 
    }
    const existingUser = await adminModel.findOne({
      email,
    });
    if (existingUser !== null) {
      response.status(409);
      return next(new Error("Email already registered."));
    }
    const hashedPassword = await bcrypt.hash(password, config.saltValue);
    const newAdmin = new adminModel({
      email,
      password: hashedPassword,
      isAdmin: true,
    });
    const registeredAdmin = await newAdmin.save();
    if (registeredAdmin?._id) {
      response.status(201).json({
        title: "Created",
        message: "Admin added successfully",
        success: true,
      });
    } else {
      response.status(500);
      next(new Error("Failed to add admin"));
    }
  } catch (error) {
    next(error);
  }
};

//admin login
export const adminLogin = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!emailFormatChecker(email)) {
      response.status(530);
      return next(new Error("Invalid email address."));
    }
    const admin = await adminModel.findOne({
      email,
    });
    if (admin === null) {
      response.status(401);
      return next(new Error("Admin/Backend user not found."));
    } else {
      if (await bcrypt.compare(password, admin.password)) {
        const responseAfterUpdate = await adminModel.findOneAndUpdate(
          {
            _id: admin._id,
          },
          {
            $set: {
              lastLogin: new Date().toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              }),
            },
          },
          { new: true }
        );
        if (!responseAfterUpdate?._id) {
          response.status(401);
          return next(new Error("Failed to login."));
        }
        const payload = {
          id: responseAfterUpdate._id,
          userName: responseAfterUpdate.userName,
          password: responseAfterUpdate.password,
        };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
        return response.status(200).json({
          data: { adminDetails: responseAfterUpdate, token: token },
          message: "valid Admin",
          success: true,
        });
      }
      response.status(400);
      next(new Error("Wrong password."));
    }
  } catch (error) {
    next(error);
  }
};

//get admin data
export const adminData = async (request, response, next) => {
  try {
    const payload = jwt.verify(request.body.token, config.jwtSecret);
    let admin = await adminModel.findOne({
      _id: payload.id,
    });
    if (admin.password !== payload.password) {
      response.status(401);
      return next(new Error("Invalid token"));
    }
    return response.status(200).json({
      data: admin,
      message: "Admin details.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//send reset password mail
export const setAdminPassword = async (request, response, next) => {
  try {
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email address"));
    }
    let admin = await adminModel.findOne({
      email: request.body.email,
    });
    if (admin === null) {
      response.status(401);
      return next(new Error("Admin/Backend user not found."));
    }
    const secret = config.jwtSecret + admin.password;
    const payload = {
      email: request.body.email,
      id: admin._id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "5m" });
    const link = `http://localhost:3000/admin/reset-password/${admin._id}/${token}`;
    mailer(request.body.email, link);
    response.status(200);
    return response.json({
      data: null,
      message: `Email send to ${request.body.email}.`,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//reset link validation
export const resetAdminPasswordVerification = async (
  request,
  response,
  next
) => {
  const { id, token } = request.params;
  try {
    let admin = await adminModel.findOne({
      _id: id,
    });
    if (admin === null) {
      response.status(401);
      return next(new Error("Admin  not found."));
    }
    const secret = config.jwtSecret + admin.password;
    try {
      jwt.verify(token, secret);
      return response.status(200).json({
        email: admin.email,
        message: "Admin verified for reset password.",
        success: true,
      });
    } catch (error) {
      response.status(403);
      return next(
        new Error("Not authenticated to reset password. Please try again.")
      );
    }
  } catch (error) {
    next(error);
  }
};

//reset admin password
export const resetAdminPassword = async (request, response, next) => {
  try {
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email address"));
    }
    let admin = await adminModel.findOne({
      email: request.body.email,
    });
    if (await bcrypt.compare(request.body.newPassword, admin.password)){
      response.status(401)
      return next (new Error("Old password can not be your new password!"))
    }
    const secret = config.jwtSecret + admin.password;
    try {
      const payload = jwt.verify(request.body.token, secret);
      const responseAfterUpdate = await adminModel.findOneAndUpdate(
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
