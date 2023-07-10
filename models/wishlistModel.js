import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  customerID: { type: String, required: true },
  items: { type: Array },
});

export const wishlistModel = mongoose.model("Wishlist", wishlistSchema);
