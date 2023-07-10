import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, default: "Spoon" },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const restaurantModel = mongoose.model("Restaurant", restaurantSchema);
