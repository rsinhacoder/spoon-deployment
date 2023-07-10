import { currentOrderModel } from "../models/currentOrderModel.js";
import { itemModel } from "../models/itemModel.js";
import {
  addressChecker,
  emailFormatChecker,
  nameChecker,
  phoneNumberFormatChecker,
} from "../helperFunctions/checker.js";
import { restaurantModel } from "../models/restaurantModel.js";
import { incompleteOrderModel } from "../models/incompleteOrderModel.js";

let months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
let currentDate = `${
  months[new Date().getMonth()]
} ${new Date().getDate()}, ${new Date().getFullYear()}`;

//create new order
export const addNewOrder = async (request, response, next) => {
  const openDetails = await restaurantModel.findOne({
    restaurantName: "Spoon",
  });
  if (!openDetails?.isOpen) {
    response.status(400);
    return next(new Error("Sorry! Restaurant is closed now."));
  }
  try {
    if (!nameChecker(request.body.customerName)) {
      response.status(530);
      return next(new Error("Invalid user name."));
    }
    if (!emailFormatChecker(request.body.email)) {
      response.status(530);
      return next(new Error("Invalid email address."));
    }
    if (!phoneNumberFormatChecker(request.body.phoneNumber)) {
      response.status(530);
      return next(new Error("Invalid phone number."));
    }
    if (!addressChecker(request.body.address)) {
      response.status(530);
      return next(new Error("Invalid address."));
    }
    const items = request.body.items;
    const allItems = await itemModel.find();
    const filterItems = items.filter((item) =>
      allItems.find(
        (data) =>
          data._id.toString() === item.itemId && data.availability === true
      )
    );
    if (filterItems.length !== items.length) {
      response.status(400);
      return next(new Error("Sorry! some items are not available"));
    }
    const currentOrderDetails = new currentOrderModel({
      customerId: request.body.customerId,
      customerName: request.body.customerName,
      phoneNumber: request.body.phoneNumber,
      email: request.body.email,
      address: request.body.address,
      orderItems: request.body.items,
      totalAmount: request.body.totalAmount,
      date: currentDate,
      time: new Date().toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      orderStatus: "Pending",
    });
    const res = await currentOrderDetails.save();
    if (!res?._id) {
      response.status(400);
      return next(new Error("Failed to take order."));
    }
    return response.status(200).json({
      data: null,
      message: "Order placed successfully.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//get all orders by status
export const getAllOrdersByStatus = async (request, response, next) => {
  try {
    const { status } = request.params;
    const orders = await currentOrderModel.find({ orderStatus: status });
    return response.status(200).json({
      data: orders,
      message: `All ${status} orders.`,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//get all orders
export const getAllOrders = async (request, response, next) => {
  try {
    const order = await currentOrderModel.find();
    if (!order) {
      response.status(400);
      return next(new Error("No orders"));
    }
    response.status(200).json({
      data: order,
      message: "All current orders",
      success: "true",
    });
  } catch (error) {
    next(error);
  }
};

//get all order history
export const getAllOrderHistory = async (request, response, next) => {
  try {
    const orders = await currentOrderModel.find({ orderStatus: "Delivered" });
    return response.status(200).json({
      data: orders,
      message: "All order history.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//set order status
export const setOrderStatus = async (request, response, next) => {
  try {
    const { id, status } = request.params;
    const responseAfterUpdate = await currentOrderModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          orderCompleteDate: currentDate,
          orderCompleteTime: new Date().toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }),
          orderStatus: status,
        },
      },
      { new: true }
    );
    if (responseAfterUpdate._id) {
      return response.status(200).json({
        data: null,
        message: "Order status updated successfully.",
        success: true,
      });
    }
    response.status(400).json({
      data: null,
      message: "Failed to updated order status.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// get current order details by customer id
export const currentOrderDetails = async (request, response, next) => {
  try {
    const { id } = request.params;

    const orderDetails = await currentOrderModel.find({
      $and: [{ customerId: id }, { orderStatus: { $ne: "Delivered" } }],
    });

    response.status(200).json({
      data: orderDetails,
      message: "Current orders.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//get all past orders
export const allPastOrdersOfAUser = async (request, response, next) => {
  try {
    const { id } = request.params;

    const orderDetails = await currentOrderModel.find({
      customerId: id,
      orderStatus: "Delivered",
    });

    response.status(200).json({
      data: orderDetails,
      message: "All Past Orders",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// get all food items
export const getAllFoodItems = async (request, response, next) => {
  try {
    const allItems = await itemModel.find();

    return response.status(200).json({
      data: allItems,
      message: "All items.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//get orders by orderId
export const getOrdersByOrderId = async (request, response, next) => {
  try {
    const { id } = request.params;

    const orderDetails = await currentOrderModel.findOne({ _id: id });

    if (!orderDetails) {
      response.status(400);
      return next(new Error("No orders."));
    }

    response.status(200).json({
      data: orderDetails,
      message: "your order status",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//incomplete orders
export const incompleteOrder = async (request, response, next) => {
  try {
    const id = request.body.customerId;

    const findCustomer = await incompleteOrderModel.findOne({ customerId: id });

    if (!findCustomer) {
      addIncompleteOrder(id, request.body.incompleteItems, response, next);
    } else {
      updateIncompleteOrder(id, request.body.incompleteItems, response, next);
    }
  } catch (error) {
    next(error);
  }
};

//add incomplete orders
export const addIncompleteOrder = async (id, items, response, next) => {
  try {
    const incompleteOrders = await new incompleteOrderModel({
      customerId: id,
      incompleteItems: items,
    }).save();

    if (!incompleteOrders?._id) {
      response.status(400);
      return next(new Error("Failed to store items."));
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

//update incomplete items
export const updateIncompleteOrder = async (id, items, response, next) => {
  try {
    const responseIncompleteOrder = await incompleteOrderModel.findOneAndUpdate(
      {
        customerId: id,
      },
      {
        incompleteItems: items,
      },
      { new: true }
    );
    if (!responseIncompleteOrder?._id) {
      response.status(400);
      return next(new Error("Failed to store items."));
    }
    return response.status(200).json({
      data: null,
      message: "data updated successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//delete incomplete orders
export const deleteIncompleteOrders = async (request, response, next) => {
  try {
    const { id } = request.params;
    await incompleteOrderModel.findOneAndDelete(
      { customerId: id },
      { new: true }
    );
    return response.status(200).json({
      data: null,
      message: "items deleted",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//get incomplete orders
export const getIncompleteOrders = async (request, response, next) => {
  try {
    const { id } = request.params;
    const incompleteOrder = await incompleteOrderModel.findOne({
      customerId: id,
    });
    return response.status(200).json({
      data: incompleteOrder,
      message: "incomplete orders",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
