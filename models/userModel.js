import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: { type: String },
    email: { type: String, required: true },
    phoneNumber: { type: Number },
    address: { type: String },
    password: { type: String, required: true },
    isActive: {
      type: Boolean,
      default: false,
    },
    imageURL: { type: String },
    imageName: { type: String },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("User", userSchema);
