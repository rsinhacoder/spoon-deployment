import mongoose from "mongoose";

const incompleteOrderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  incompleteItems: { type: Array },
});

export const incompleteOrderModel = mongoose.model(
  "Incomplete-Orders",
  incompleteOrderSchema
);
