import config from "../config.js";
import bcrypt from "bcrypt";
import { mailer } from "../helperFunctions/mailer.js";
import jwt from "jsonwebtoken";
import { adminModel } from "../models/adminModel.js";
import * as fs from "fs/promises";
import {
  addressChecker,
  emailFormatChecker,
  nameChecker,
  phoneNumberFormatChecker,
} from "../helperFunctions/checker.js";
import { restaurantModel } from "../models/restaurantModel.js";
import { categoryModel } from "../models/categoryModel.js";
import { itemModel } from "../models/itemModel.js";

//add a new backend user from admin dashboard
export const addNewUser = async (request, response, next) => {
  try {
    if (!nameChecker(request.body.name)) {
      response.status(530);
      return next(new Error("Invalid user name."));
    }
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email address."));
    }
    const existingUser = await adminModel.findOne({
      email: request.body.email,
    });
    if (existingUser !== null) {
      response.status(401);
      return next(new Error("User already registered."));
    }
    const userId = await adminModel.findOne({ _id: request.body.id });
    if (userId?.isBackendUser) {
      response.status(401);
      return next(new Error("Only admin can add a new user."));
    }
    const hashedPassword = await bcrypt.hash("default", config.saltValue);
    const newBackendUser = new adminModel({
      userName: request.body.name,
      email: request.body.email,
      password: hashedPassword,
      isAdmin: false,
      isBackendUser: true, 
    });
    const registeredBackendUser = await newBackendUser.save();
    if (registeredBackendUser?._id) {
      const secret = config.jwtSecret + hashedPassword;
      const payload = {
        email: request.body.email,
        id: registeredBackendUser._id,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "5m" });
      const link = `http://localhost:3000/admin/reset-password/${registeredBackendUser._id}/${token}`;
      mailer(request.body.email, link);
      return response.status(200).json({
        data: null,
        message: `Backend user added and reset password email send to ${request.body.email}`,
        success: true,
      });
    } else {
      next(new Error("Failed to add user"));
    }
  } catch (error) {
    next(error);
  }
};

// edit backend user details from admin dashboard
export const setUserDetails = async (request, response, next) => {
  try {
    if (!nameChecker(request.body.name)) {
      response.status(530);
      return next(new Error("Invalid user name."));
    }
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email address."));
    }
    const backendUser = await adminModel.findOne({ _id: request.body.adminId });
    if (backendUser === null) {
      response.status(400);
      return next(new Error("User not found.."));
    }
    if (backendUser?.isBackendUser) {
      response.status(401);
      return next(new Error("Cannot edit being a backend user."));
    }
    const user = await adminModel.findOne({ _id: request.body.id });
    const oldEmail = user.email;
    const hashedPassword = await bcrypt.hash("default", config.saltValue);
    const responseAfterUpdate = await adminModel.findOneAndUpdate(
      {
        _id: request.body.id,
      },
      {
        $set: {
          userName: request.body.name,
          email: request.body.email,
          phoneNumber: request.body.phoneNumber,
          password: hashedPassword,
        },
      },
      {
        new: true,
      }
    );
    if (!responseAfterUpdate?._id) {
      response.status(401);
      return next(new Error("Failed to update"));
    }
    if (oldEmail === request.body.email) {
      return response.status(200).json({
        data: null,
        message: "User details updated successfully.",
        success: true,
      });
    }
    const secret = config.jwtSecret + hashedPassword;
    const payload = {
      email: request.body.email,
      id: request.body.id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "5m" });
    const link = `http://localhost:3000/admin/reset-password/${request.body.id}/${token}`;
    mailer(request.body.email, link);
    return response.status(200).json({
      data: null,
      message: `Backend user added and reset password email send to ${request.body.email}`,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// delete backend user from admin dashboard
export const deleteUser = async (request, response, next) => {
  try {
    const { id, adminId } = request.params;
    const user = await adminModel.findOne({
      _id: id,
    });
    if (user === null) {
      response.status(400);
      return next(new Error("User not found."));
    }
    const admin = await adminModel.findOne({ _id: adminId });
    if (admin?.isBackendUser) {
      response.status(401);
      return next(new Error("Only admin can delete an user."));
    }
    const responseAfterUserDelete = await adminModel.findOneAndDelete({
      _id: id,
    });
    if (responseAfterUserDelete?._id) {
      return response.status(200).json({
        data: null,
        message: "User deleted successfully.",
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

//update admin details from admin dashboard
export const updateAdminDetails = async (request, response, next) => {
  try {
    if (!nameChecker(request.body.name)) {
      response.status(530);
      return next(new Error("Invalid user name.."));
    }
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email name.."));
    }
    if (!phoneNumberFormatChecker(request.body.phoneNumber)) {
      response.status(530);
      return next(new Error("Invalid phone number."));
    }
    if (!addressChecker(request.body.address)) {
      response.status(530);
      return next(new Error("Invalid address."));
    }
    const admin = await adminModel.findOne({
      _id: request.body.id,
    });
    if (admin === null) {
      response.status(401);
      return next(new Error("Admin not found."));
    }
    if (request.body.imageName) {
      if (admin.imageName) {
        await fs.unlink(`./upload/ProfilePictures/${admin.imageName}`);
      }
      const responseAfterUpdate = await adminModel.findOneAndUpdate(
        {
          _id: admin._id,
        },
        {
          $set: {
            email: request.body.email,
            phoneNumber: request.body.phoneNumber,
            address: request.body.address,
            userName: request.body.name,
            imageURL: `http://localhost:4000/ProfilePictures/${request.file.filename}`,
            imageName: request.file.filename,
          },
        },
        { new: true }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: null,
          message: "Admin details updated successfully",
          success: true,
        });
      }
      response.status(400);
      return next(new Error("Failed to update details."));
    } else {
      const responseAfterUpdate = await adminModel.findOneAndUpdate(
        {
          _id: admin._id,
        },
        {
          $set: {
            email: request.body.email,
            phoneNumber: request.body.phoneNumber,
            address: request.body.address,
            userName: request.body.name,
          },
        },
        { new: true }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: null,
          message: "Admin details updated successfully",
          success: true,
        });
      }
      response.status(400);
      return next(new Error("Failed to update details."));
    }
  } catch (error) {
    next(error);
  }
};

// change password of admin from admin dashboard
export const changePassword = async (request, response, next) => {
  try {
    const admin = await adminModel.findOne({
      _id: request.body.id,
    });
    if (await bcrypt.compare(request.body.oldPassword, admin.password)) {
      const hashedNewPassword = await bcrypt.hash(
        request.body.newPassword,
        config.saltValue
      );
      const responseAfterUpdate = await adminModel.findOneAndUpdate(
        {
          _id: admin._id,
        },
        {
          $set: {
            password: hashedNewPassword,
          },
        },
        { new: true }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: responseAfterUpdate,
          message: "Password reset succesfully",
          success: true,
        });
      }
    } else {
      return response.status(401).json({
        data: null,
        message: "old password doesn't match",
        success: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

// validate admin password in admin dashboard
export const validatePassword = async (request, response, next) => {
  try {
    const admin = await adminModel.findOne({
      _id: request.body.id,
    });
    if (await bcrypt.compare(request.body.password, admin.password)) {
      return response.status(200).json({
        data: null,
        message: "Valid admin.",
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// get all backend users from admin dashboard
export const getAllUsers = async (request, response, next) => {
  try {
    const users = await adminModel.find();
    return response.status(200).json({
      data: users,
      message: "All users",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// set order take in
export const setAdminFoodStatus = async (request, response, next) => {
  try {
    const { id, canOrderStatus } = request.params;
    const admin = await adminModel.findOne({ _id: id });
    if (!admin.isAdmin) {
      response.status(401);
      return next(new Error("Only admin can change current status."));
    }
    const orderDeliveryStatusUpdate = await restaurantModel.findOneAndUpdate(
      {
        restaurantName: "Spoon",
      },
      {
        $set: {
          isOpen: canOrderStatus,
        },
      },
      { new: true }
    );
    if (!orderDeliveryStatusUpdate?._id) {
      response.status(401);
      return next(new Error("Failed to update status."));
    }
    const allCategoriesAvailability = await categoryModel.find();
    allCategoriesAvailability.forEach(async (each) => {
      await categoryModel.findOneAndUpdate(
        {
          _id: each._id,
        },
        {
          $set: {
            availability: canOrderStatus,
          },
        },
        { new: true }
      );
    });
    const allFoodItemAvailability = await itemModel.find();
    allFoodItemAvailability.forEach(async (each) => {
      await itemModel.findOneAndUpdate(
        {
          _id: each._id,
        },
        {
          $set: {
            availability: canOrderStatus,
          },
        },
        { new: true }
      );
    });
    return response.status(200).json({
      data: null,
      message: "Status updated successfully.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const createRestaurant = async (request, response, next) => {
  try {
    const newRes = new restaurantModel();
    const response = await newRes.save();
    if (response?._id) {
      return response.status(200).json({
        data: null,
        message: "Success",
        success: true,
      });
    }
    response.status(400);
    next(new Error("Failed"));
  } catch (error) {
    next(error);
  }
};

export const getRestaurantOpenStatus = async (request, response, next) => {
  try {
    const openDetails = await restaurantModel.findOne({
      restaurantName: "Spoon",
    });
    if (openDetails?._id) {
      return response.status(200).json({
        data: openDetails,
        message: "Restaurant open status.",
        success: true,
      });
    }
    response.status(400);
    return next(new Error("Failed to get data."));
  } catch (error) {
    next(error);
  }
};
