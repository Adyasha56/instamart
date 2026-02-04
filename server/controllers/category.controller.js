import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Responses } from "../utils/response.js";

/**
 * Creates a new category
 * @param {import("express").Request} req - The request object containing category details in the body
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the result of the operation
 */
export const createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.length < 2) {
      return Responses.failResponse(res, "Missing or Invalid name field", 400);
    }

    // Validate image
    if (!image || typeof image !== "string" || image.length < 2) {
      return Responses.failResponse(res, "Missing or Invalid image url field", 400);
    }

    // Create category
    const categoryResult = await Category.create({
      name: name,
      image: image,
    });

    if (!categoryResult) {
      return Responses.errorResponse(res, "Category Creation failed");
    }

    return Responses.successResponse(res, "Successfully created category", 201, categoryResult);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!", 500);
  }
};

/**
 * Fetches all active categories
 * @param {import("express").Request} _req - The request object (not used in this method)
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the list of categories
 */
export const getCategories = async (_req, res) => {
  try {
    const allCategories = await Category.find({ isActive: true }).select("name image");

    if (!allCategories || !(allCategories instanceof Array) || allCategories.length === 0) {
      return Responses.failResponse(res, "Failed to fetch all categories", 404);
    }

    return Responses.successResponse(res, "Successfully fetched categories", 200, allCategories);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!", 500);
  }
};

/**
 * Fetches a category by ID
 * @param {import("express").Request} req - The request object containing the category ID in the URL params
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the category details
 */
export const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Validate categoryId
    if (!categoryId || typeof categoryId !== "string" || categoryId.length < 2) {
      return Responses.failResponse(res, "Missing or Invalid categoryId url field", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return Responses.failResponse(res, "Invalid Object Id", 400);
    }

    // Fetch category
    const category = await Category.findById(categoryId);

    if (!category || !category.isActive) {
      return Responses.failResponse(res, "Category not found", 404);
    }

    return Responses.successResponse(res, "Successfully fetched category", 200, category);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!", 500);
  }
};

/**
 * Updates a category by ID
 * @param {import("express").Request} req - The request object containing the category ID in the URL params and update data in the body
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the updated category
 */
export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, image, isActive } = req.body;

    // Validate categoryId
    if (!categoryId || typeof categoryId !== "string" || categoryId.length < 2) {
      return Responses.failResponse(res, "Missing or Invalid categoryId url field", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return Responses.failResponse(res, "Invalid Object Id", 400);
    }

    // Validate at least one field is provided
    if (!name && !image && isActive === undefined) {
      return Responses.failResponse(res, "At least one field (name, image, or isActive) is required", 400);
    }

    // Validate name if provided
    if (name && (typeof name !== "string" || name.length < 2)) {
      return Responses.failResponse(res, "Invalid name field", 400);
    }

    // Validate image if provided
    if (image && (typeof image !== "string" || image.length < 2)) {
      return Responses.failResponse(res, "Invalid image url field", 400);
    }

    // Check if category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return Responses.failResponse(res, "Category not found", 404);
    }

    // Check if new name already exists (if name is being updated)
    if (name && name !== categoryExists.name) {
      const nameExists = await Category.findOne({ name });
      if (nameExists) {
        return Responses.failResponse(res, "Category name already exists", 409);
      }
    }

    // Update category
    const updateData = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, { new: true, runValidators: true });

    return Responses.successResponse(res, "Successfully updated category", 200, updatedCategory);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!", 500);
  }
};

/**
 * Deletes a category by marking it as inactive
 * @param {import("express").Request} req - The request object containing the category ID in the URL params
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the result of the operation
 */
export const deleteCategories = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Validate categoryId
    if (!categoryId || typeof categoryId !== "string" || categoryId.length < 2) {
      return Responses.failResponse(res, "Missing or Invalid categoryId url field", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return Responses.failResponse(res, "Invalid Object Id", 400);
    }

    // Mark category as inactive
    const updateResult = await Category.findByIdAndUpdate(categoryId, { isActive: false });

    if (!updateResult) {
      return Responses.failResponse(res, "Category not found or already inactive", 404);
    }

    return Responses.successResponse(res, "Successfully removed", 200);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!", 500);
  }
};