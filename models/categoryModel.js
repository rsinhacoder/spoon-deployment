import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    imageURL: { type: String },
    imageName: { type: String },
    categoryName: { type: String, required: true, unique: true },
    availability: { type: Boolean, default: false },
    popularity: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const categoryModel = mongoose.model("Category", categorySchema);
