import { categoryModel } from "../models/categoryModel.js";
import { itemModel } from "../models/itemModel.js";
import * as fs from "fs/promises";
import { nameChecker } from "../helperFunctions/checker.js";

// add a new category
export const addNewCategory = async (request, response, next) => {
  try {
    if (!nameChecker(request.body.categoryName)) {
      response.status(530);
      return next(new Error("Invalid category name."));
    }
    const allPresentCategories = await categoryModel.find();
    if (
      allPresentCategories.find(
        (each) =>
          each.categoryName.toLowerCase() ===
          request.body.categoryName.toLowerCase()
      )
    ) {
      response.status(400);
      return next(new Error("Category already present."));
    }
    if (request.body.imageName) {
      const saveCategory = new categoryModel({
        imageURL: `http://localhost:4000/CategoryImages/${request.file.filename}`,
        imageName: request.file.filename,
        categoryName: request.body.categoryName,
      });
      const responseAfterCategorySave = await saveCategory.save();
      if (responseAfterCategorySave?._id) {
        return response.status(200).json({
          data: responseAfterCategorySave,
          message: "Category saved successfully.",
          success: true,
        });
      }
    } else {
      const saveCategory = new categoryModel({
        categoryName: request.body.categoryName,
      });
      const responseAfterCategorySave = await saveCategory.save();
      if (responseAfterCategorySave?._id) {
        return response.status(200).json({
          data: responseAfterCategorySave,
          message: "Category saved successfully.",
          success: true,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// update category
export const editCategory = async (request, response, next) => {
  try {
    const { id } = request.params;
    if (!nameChecker(request.body.categoryName)) {
      response.status(530);
      return next(new Error("Invalid category name."));
    }
    const allPresentCategories = await categoryModel.find();
    if (
      allPresentCategories.find(
        (each) =>
          each.categoryName.toLowerCase() ===
          request.body.categoryName.toLowerCase()
      )
    ) {
      response.status(400);
      return next(new Error("Category already present."));
    }
    const category = await categoryModel.findOne({
      _id: id,
    });
    if (request.body.imageName) {
      if (category.imageName) {
        await fs.unlink(`./upload/CategoryImages/${category.imageName}`);
      }
      const responseAfterUpdate = await categoryModel.findOneAndUpdate(
        {
          _id: category._id,
        },
        {
          $set: {
            categoryName: request.body.categoryName,
            imageURL: `http://localhost:4000/CategoryImages/${request.file.filename}`,
            imageName: request.file.filename,
          },
        },
        { new: true }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: responseAfterUpdate,
          message: "Category updated successfully.",
          success: true,
        });
      }
    } else {
      const responseAfterUpdate = await categoryModel.findOneAndUpdate(
        {
          _id: category._id,
        },
        {
          $set: {
            imageURL: category.imageURL,
            imageName: category.imageName,
            categoryName: request.body.categoryName,
          },
        },
        { new: true }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: responseAfterUpdate,
          message: "Category updated successfully.",
          success: true,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

//delete a category
export const deleteCategory = async (request, response, next) => {
  try {
    const { id } = request.params;
    const category = await categoryModel.findOne({ _id: id });
    if (category.imageName) {
      await fs.unlink(`./upload/CategoryImages/${category.imageName}`);
    }
    const responseAfterCategoryDeletion = await categoryModel.findOneAndDelete({
      _id: id,
    });
    if (responseAfterCategoryDeletion?._id) {
      return response.status(200).json({
        data: null,
        message: "Category updated successfully.",
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// add item in a particular category
export const addNewItem = async (request, response, next) => {
  try {
    if (!nameChecker(request.body.category)) {
      response.status(530);
      return next(new Error("Invalid category name."));
    }
    if (!nameChecker(request.body.itemName)) {
      response.status(530);
      return next(new Error("Invalid item name."));
    }
    if (!nameChecker(request.body.price)) {
      response.status(530);
      return next(new Error("Invalid price."));
    }
    if (!nameChecker(request.body.description)) {
      response.status(530);
      return next(new Error("Invalid description"));
    }
    if (!nameChecker(request.body.limit)) {
      response.status(530);
      return next(new Error("Invalid limit"));
    }
    const category = await categoryModel.findOne({
      categoryName: request.body.category,
    });
    if (category === null) {
      response.status(401);
      return next(new Error("Category does not exists."));
    }
    const allItems = await itemModel.find();
    if (
      allItems.find(
        (each) =>
          each.item.itemName.toLowerCase() ===
          request.body.itemName.toLowerCase()
      )
    ) {
      response.status(401);
      return next(new Error("Item already present."));
    }
    if (request.body.imageName) {
      const saveItem = new itemModel({
        item: {
          imageURL: `http://localhost:4000/ItemImages/${request.file.filename}`,
          imageName: request.file.filename,
          itemName: request.body.itemName,
          price: request.body.price,
          description: request.body.description,
          limit: request.body.limit,
          category: request.body.category,
        },
      });
      const responseAfterItemSave = await saveItem.save();
      if (responseAfterItemSave?._id) {
        return response.status(200).json({
          data: responseAfterItemSave,
          message: "Item saved successfully.",
          success: true,
        });
      }
    } else {
      const saveItem = new itemModel({
        item: {
          itemName: request.body.itemName,
          price: request.body.price,
          description: request.body.description,
          limit: request.body.limit,
          category: request.body.category,
        },
      });
      const responseAfterItemSave = await saveItem.save();
      if (responseAfterItemSave?._id) {
        return response.status(200).json({
          data: responseAfterItemSave,
          message: "Item saved successfully.",
          success: true,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

//update an item in a category
export const editItem = async (request, response, next) => {
  try {
    const { id } = request.params;
    if (!nameChecker(request.body.category)) {
      response.status(530);
      return next(new Error("Invalid category name"));
    }
    if (!nameChecker(request.body.itemName)) {
      response.status(530);
      return next(new Error("Invalid item name"));
    }
    if (!nameChecker(request.body.price)) {
      response.status(530);
      return next(new Error("Invalid price"));
    }
    if (!nameChecker(request.body.description)) {
      response.status(530);
      return next(new Error("Invalid description."));
    }
    if (!nameChecker(request.body.limit)) {
      response.status(530);
      return next(new Error("Invalid limit"));
    }
    const category = await categoryModel.findOne({
      categoryName: request.body.category,
    });
    if (category === null) {
      response.status(401);
      return next(new Error("Category does not exists."));
    }
    const item = await itemModel.findOne({
      _id: id,
    });
    if (item === null) {
      response.status(401);
      next(new Error("Item does not exists."));
    }
    const allItems = await itemModel.find();
    const duplicateItem = allItems.find(
      (each) =>
        each.item.itemName.toLowerCase() === request.body.itemName.toLowerCase()
    );
    if (
      allItems.find(
        (each) =>
          each.item.itemName.toLowerCase() ===
          request.body.itemName.toLowerCase() && each._id.toString()!==id
      )
    ) {
      response.status(401);
      return next(new Error("Item already present."));
    }
    if (request.body.imageName) {
      if (item.item.imageName) {
        await fs.unlink(`./upload/ItemImages/${item.item.imageName}`);
      }
      const responseAfterUpdate = await itemModel.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            item: {
              imageURL: `http://localhost:4000/ItemImages/${request.file.filename}`,
              imageName: request.file.filename,
              itemName: request.body.itemName,
              price: request.body.price,
              description: request.body.description,
              limit: request.body.limit,
              category: request.body.category,
            },
          },
        },
        { new: true }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: responseAfterUpdate,
          message: "Item updated successfully.",
          success: true,
        });
      }
    } else {
      const responseAfterUpdate = await itemModel.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $set: {
            item: {
              imageURL: item.item.imageURL,
              imageName: item.item.imageName,
              itemName: request.body.itemName,
              price: request.body.price,
              description: request.body.description,
              limit: request.body.limit,
              category: request.body.category,
            },
          },
        },
        { new: true }
      );
      if (responseAfterUpdate?._id) {
        return response.status(200).json({
          data: responseAfterUpdate,
          message: "Item updated successfully.",
          success: true,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

// delete an item
export const deleteItem = async (request, response, next) => {
  try {
    const { id } = request.params;
    const item = await itemModel.findOne({ _id: id });
    if (item.item.imageName) {
      await fs.unlink(`./upload/ItemImages/${item.item.imageName}`);
    }
    const responseAfterItemDeletion = await itemModel.findOneAndDelete({
      _id: id,
    });
    if (responseAfterItemDeletion?._id) {
      return response.status(200).json({
        data: responseAfterItemDeletion,
        message: "Item deleted successfully.",
        success: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// set category availability
export const setCategoryAvailability = async (request, response, next) => {
  try {
    const { id, availability } = request.params;
    const category = await categoryModel.findOne({
      _id: id,
    });
    if (category === null) {
      response.status(401);
      return next(new Error("Category not found."));
    }
    const responseAfterUpdate = await categoryModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          availability: availability,
        },
      },
      { new: true }
    );
    if (responseAfterUpdate?._id) {
      const items = await itemModel.find({
        "item.category": category.categoryName,
      });
      items.forEach(async (each) => {
        await itemModel.findOneAndUpdate(
          {
            _id: each._id,
          },
          {
            $set: {
              availability: availability,
            },
          },
          {
            new: true,
          }
        );
      });
      return response.status(200).json({
        data: responseAfterUpdate,
        message: "Category updated successfully.",
        success: true,
      });
    } else {
      response.status(401);
      return next(new Error("Category update failed."));
    }
  } catch (error) {
    next(error);
  }
};

// set item availability
export const setItemAvailability = async (request, response, next) => {
  try {
    const { id, availability } = request.params;
    const responseAfterUpdate = await itemModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          availability: availability,
        },
      },
      { new: true }
    );
    if (responseAfterUpdate?._id) {
      return response.status(200).json({
        data: responseAfterUpdate,
        message: "Item updated successfully.",
        success: true,
      });
    } else {
      response.status(401);
      return next(new Error("Item update failed."));
    }
  } catch (error) {
    next(error);
  }
};

// get all categories
export const getAllCategories = async (request, response, next) => {
  try {
    const categories = await categoryModel.find();
    if (categories === null) {
      response.status(400);
      return next(new Error("No category found."));
    }
    return response.status(200).json({
      data: categories,
      message: "All categories.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// get category by Name
export const getCategoriesByName = async (request, response, next) => {
  try {
    const { category } = request.params;
    const categories = await categoryModel.findOne({ categoryName: category });
    if (!categories) {
      response.status(400);
      return next(new Error("Category not found."));
    }
    return response.status(200).json({
      data: categories,
      message: "about category.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// get an item by id
export const getItem = async (request, response, next) => {
  try {
    const { id } = request.params;
    const item = await itemModel.findOne({ _id: id });
    return response.status(200).json({
      data: item,
      message: "Item details.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// get all items by category
export const getAllItems = async (request, response, next) => {
  try {
    const { category } = request.params;
    const categories = await categoryModel.find({ categoryName: category });
    if (!categories) {
      response.status(400);
      return next(new Error("No such category found."));
    }
    const items = await itemModel.find();
    let filterItems = items.filter((data) => data.item.category === category);
    if (items === null) {
      response.status(400);
      return next(new Error("No item found."));
    }
    return response.status(200).json({
      data: filterItems,
      message: "All items.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// search function for items by category
export const itemSearchResult = async (request, response, next) => {
  try {
    const query = request.body.query;
    const category = request.body.category;

    const allItems = await itemModel.find();
    let filterItemsByCategory = allItems.filter(
      (data) => data.item.category === category
    );

    let searchResults = [];
    for (let i = 0; i < filterItemsByCategory.length; i++) {
      if (
        filterItemsByCategory[i].item.itemName
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        searchResults.push(filterItemsByCategory[i]);
      }
    }
    response.status(200).json({
      data: searchResults,
      message: "Search result.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//toggle popularity of category
export const togglePopularity = async (request, response, next) => {
  try {
    const { id, status } = request.params;
    const setPopularity = await categoryModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          popularity: status,
        },
      }
    );
    if (setPopularity?._id) {
      return response.status(200).json({
        data: null,
        message: "Popularity set successfully.",
        success: true,
      });
    }
    response.status(400);
    return next(new Error("Failed to update popularity."));
  } catch (error) {
    next(error);
  }
};

//get popularity of fooditem
export const getPopularFoodItems = async (request, response, next) => {
  try {
    const allCategory = await categoryModel.find();
    const allFoodItems = await itemModel.find();
    const popularCategoryArr = [];
    const popularItemsArr = [];
    const popularCategory = allCategory.filter(
      (data) => data.popularity === true
    );
    popularCategory.forEach((each) => {
      popularCategoryArr.push(each.categoryName);
    });
    for (let i = 0; i < popularCategoryArr.length; i++) {
      for (let j = 0; j < allFoodItems.length; j++) {
        if (allFoodItems[j].item.category === popularCategoryArr[i]) {
          popularItemsArr.push(allFoodItems[j]);
        }
      }
    }
    return response.status(200).json({
      data: popularItemsArr,
      message: "Popular items.",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
