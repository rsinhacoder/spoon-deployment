import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    item: {
      imageURL: { type: String },
      imageName: { type: String },
      itemName: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      limit: {
        type: Number,
        required: true,
      },
      category: { type: String, required: true },
    },
    availability: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const itemModel = mongoose.model("Food", itemSchema);
