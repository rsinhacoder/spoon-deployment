import express from "express";
import {
  adminRegister,
  adminLogin,
  setAdminPassword,
  resetAdminPasswordVerification,
  resetAdminPassword,
  adminData,
} from "./controllers/adminAuth.js";
import {
  addNewUser,
  changePassword,
  createRestaurant,
  deleteUser,
  getAllUsers,
  getRestaurantOpenStatus,
  setAdminFoodStatus,
  setUserDetails,
  updateAdminDetails,
  validatePassword,
} from "./controllers/adminFunctions.js";
import {
  addNewCategory,
  addNewItem,
  deleteCategory,
  deleteItem,
  editCategory,
  editItem,
  getAllCategories,
  getAllItems,
  getItem,
  itemSearchResult,
  setCategoryAvailability,
  setItemAvailability,
  togglePopularity,
  getPopularFoodItems,
  getCategoriesByName,
} from "./controllers/menuEditor.js";
import {
  userRegister,
  userLogin,
  setPassword,
  resetPasswordVerification,
  resetPassword,
  userData,
  forgetPassword,
} from "./controllers/userAuth.js";
import {
  uploadProfilePictures,
  uploadCategoryImages,
  uploadItemImages,
} from "./helperFunctions/imageUploader.js";
import {
  addNewOrder,
  allPastOrdersOfAUser,
  currentOrderDetails,
  getAllOrders,
  getAllOrderHistory,
  getAllOrdersByStatus,
  setOrderStatus,
  getAllFoodItems,
  getOrdersByOrderId,
  incompleteOrder,
  deleteIncompleteOrders,
  getIncompleteOrders,
} from "./controllers/orders.js";
import {
  updateUserDetails,
  wishlistFood,
  removeFromWishlist,
  allWishlistItem,
} from "./controllers/userFunctions.js";

export const app = express();

// image routes
app.use("/ProfilePictures", express.static("upload/ProfilePictures"));
app.use("/CategoryImages", express.static("upload/CategoryImages"));
app.use("/ItemImages", express.static("upload/ItemImages"));

// user routes
app.post("/user/add-wishlist-food-items", wishlistFood);
app.get("/user/all-wishlist-items/:customerId", allWishlistItem);
app.post("/user/register", userRegister);
app.post("/user/login", userLogin);
app.post("/user/set-password", setPassword);
app.get("/user/reset-password/:id/:token", resetPasswordVerification);
app.post("/user/reset-password", resetPassword);
app.post("/user/user-data", userData);
app.post(
  "/user/update-user-details/:id",
  uploadProfilePictures.single("profileImage"),
  updateUserDetails
);
app.delete(
  "/user/delete-wishlisted-food/:customerId",
  removeFromWishlist
);
app.post("/user/forget-password", forgetPassword)

// admin routes
app.post("/admin/register", adminRegister);
app.post("/admin/login", adminLogin);
app.post("/admin/set-password", setAdminPassword);
app.get("/admin/reset-password/:id/:token", resetAdminPasswordVerification);
app.post("/admin/reset-password", resetAdminPassword);
app.post("/admin/admin-data", adminData);
app.post("/admin/add-new-user", addNewUser);
app.post(
  "/admin/update-details",
  uploadProfilePictures.single("profileImage"),
  updateAdminDetails
);
app.post("/admin/change-password", changePassword);
app.get("/admin/get-all-users", getAllUsers);
app.delete("/admin/delete-user/:id/:adminId", deleteUser);
app.post("/admin/validate-admin-password", validatePassword);
app.post("/admin/edit-user-details", setUserDetails);

// menu-editor routes
app.get("/admin/menu-editor/toggle-popularity/:id/:status", togglePopularity);
app.post(
  "/admin/menu-editor/add-new-category",
  uploadCategoryImages.single("categoryImage"),
  addNewCategory
);
app.post(
  "/admin/menu-editor/edit-category/:id",
  uploadCategoryImages.single("categoryImage"),
  editCategory
);
app.delete("/admin/menu-editor/delete-category/:id", deleteCategory);
app.post(
  "/admin/menu-editor/add-new-item",
  uploadItemImages.single("itemImage"),
  addNewItem
);
app.post(
  "/admin/menu-editor/edit-item/:id",
  uploadItemImages.single("itemImage"),
  editItem
);
app.delete("/admin/menu-editor/delete-item/:id", deleteItem);
app.get(
  "/admin/menu-editor/update-category-availability/:id/:availability",
  setCategoryAvailability
);
app.get(
  "/admin/menu-editor/update-item-availability/:id/:availability",
  setItemAvailability
);
app.get("/admin/menu-editor/get-all-category", getAllCategories);
app.get("/admin/menu-editor/get-all-items/:category", getAllItems);
app.post("/admin/menu-editor/serach", itemSearchResult);
app.get("/admin/menu-editor/popular-food-item", getPopularFoodItems);

// orders routes
app.post("/order/add-new-order", addNewOrder);
app.get("/all-orders", getAllOrders);
app.get("/all-order-history", getAllOrderHistory);
app.get("/orders/:status", getAllOrdersByStatus);
app.get("/get-all-category", getAllCategories);
app.get("/get-all-items/:category", getAllItems);
app.get("/get-item-details/:id", getItem);
app.get("/order/update-status/:id/:status", setOrderStatus);
app.get("/order/current-order-details/:id", currentOrderDetails);
app.get("/order/all-past-orders/:id", allPastOrdersOfAUser);
app.get("/all-food-items", getAllFoodItems);
app.get("/order/get-single-order/:id", getOrdersByOrderId);
app.get(
  "/admin/menu-editor/set-order-delivery-status/:id/:canOrderStatus",
  setAdminFoodStatus
);
app.get("/create-new-restaurant", createRestaurant);
app.get("/get-restaurant-open-status", getRestaurantOpenStatus);
app.post("/order/incomplete-order",incompleteOrder);
app.delete("/order/delete-incomplete-order/:id",deleteIncompleteOrders);
app.get("/order/incomplete-orders/:id",getIncompleteOrders);
app.get("/get-single-category/:category",getCategoriesByName);