import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    userName: { type: String },
    email: { type: String, required: true },
    phoneNumber: { type: Number },
    address: { type: String },
    password: { type: String, required: true },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBackendUser: {
      type: Boolean,
      default: false,
    },
    imageURL: { type: String },
    imageName: { type: String },
    lastLogin: { type: String },
  },
  { timestamps: true }
);

export const adminModel = mongoose.model("Admin", adminSchema);
