import mongoose from "mongoose";

const currentOrderSchema = new mongoose.Schema(
  {
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    orderItems: { type: Array },
    totalAmount: { type: String, required: true },
    date: { type: String },
    time: { type: String },
    orderCompleteDate: { type: String },
    orderCompleteTime: { type: String },
    orderStatus: { type: String },
  },
  { timestamps: true }
);

export const currentOrderModel = mongoose.model(
  "Current-Order-Details",
  currentOrderSchema
);
