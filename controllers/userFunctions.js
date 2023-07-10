import { userModel } from "../models/userModel.js";
import * as fs from "fs/promises";
import {
  addressChecker,
  emailFormatChecker,
  nameChecker,
  phoneNumberFormatChecker,
} from "../helperFunctions/checker.js";
import { wishlistModel } from "../models/wishlistModel.js";

// update user details
export const updateUserDetails = async (request, response, next) => {
  try {
    const { id } = request.params;
    if (!nameChecker(request.body.userName)) {
      response.status(530);
      return next(new Error("Invalid user name"));
    }
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email address."));
    }
    if (!phoneNumberFormatChecker(request.body.phoneNumber)) {
      response.status(530);
      next(new Error("Invalid phone number."));
    }
    if (!addressChecker(request.body.address)) {
      response.status(530);
      return next(new Error("Invalid address."));
    }
    const user = await userModel.findOne({
      _id: id,
    });
    if (user === null) {
      response.status(401);
      return next(new Error("User not found."));
    }
    if (request.body.imageName) {
      if (user.imageName) {
        await fs.unlink(`./upload/ProfilePictures/${user.imageName}`);
      }
      const responseAfterUpdate = await userModel.findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          $set: {
            email: request.body.email,
            phoneNumber: request.body.phoneNumber,
            address: request.body.address,
            userName: request.body.userName,
            imageURL: `http://localhost:4000/ProfilePictures/${request.file.filename}`,
            imageName: request.file.filename,
          },
        },
        { new: true }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: null,
          message: "User details updated successfully",
          success: true,
        });
      }
      response.status(400);
      return next(new Error("Failed to update details."));
    } else {
      const responseAfterUpdate = await userModel.findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          $set: {
            email: request.body.email,
            phoneNumber: request.body.phoneNumber,
            address: request.body.address,
            userName: request.body.userName,
          },
        },
        { new: true }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: null,
          message: "User details updated successfully",
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

//all wishlist item by customer id
export const allWishlistItem = async (request, response, next) => {
  try {
    const { customerId } = request.params;
    const allWishlistItems = await wishlistModel.findOne({
      customerID: customerId,
    });
    response.status(200).json({
      data: allWishlistItems,
      message: "Wishlist items added",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//wishlist Api
export const wishlistFood = async (request, response, next) => {
  try {
    const id = request.body.customerID;
    const item = request.body.items;
    const checkCustomer = await wishlistModel.findOne({
      customerID: id,
    });
    if (!checkCustomer) {
      addWishListItems(id, item, response, next);
    } else {
      updateWishListItems(id, item, response, next);
    }
  } catch (error) {
    next(error);
  }
};

// remove from wishlist
export const removeFromWishlist = async (request, response, next) => {
  try {
    const { customerId } = request.params;
    await wishlistModel.findOneAndDelete(
      { customerID: customerId },
      { new: true }
    );
    response.status(200).json({
      data: null,
      message: "Item removed from wishlist",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const addWishListItems = async (customerID, item, response, next) => {
  try {
    const wishlist = await new wishlistModel({
      customerID: customerID,
      items: item,
    }).save();
    if (!wishlist?._id) {
      response.status(400);
      return next(new Error("failed to store items"));
    }
    return response.status(200).json({
      data: null,
      message: "items saved successfully.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

const updateWishListItems = async (customerID, item, response, next) => {
  try {
    const result = await wishlistModel.findOneAndUpdate(
      {
        customerID: customerID,
      },
      {
        items: item,
      },
      {
        new: true,
      }
    );
    if (!result?._id) {
      response.status(400);
      return next(new Error("failed to update items"));
    }
    return response.status(200).json({
      data: null,
      message: "wishlist updated successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
