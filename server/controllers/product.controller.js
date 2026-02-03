import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Responses } from "../utils/Responses.js";

/**
 * Creates a new product
 * @param {import("express").Request} req - The request object containing product details in the body
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the result of the operation
 */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      description,
      price,
      uom,
      images,
      categoryId,
      tags,
      barcode
    } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return Responses.failResponse(res, "Missing or Invalid product name", 400);
    }

    // Validate brand
    if (!brand || typeof brand !== "string" || brand.trim().length < 2) {
      return Responses.failResponse(res, "Missing or Invalid brand name", 400);
    }

    // Validate description
    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return Responses.failResponse(res, "Missing or Invalid description", 400);
    }

    // Validate price
    if (typeof price !== "number" || price <= 0) {
      return Responses.failResponse(res, "Missing or Invalid price", 400);
    }

    // Validate UOM
    if (!uom || typeof uom !== "string" || uom.trim().length < 1) {
      return Responses.failResponse(res, "Missing or Invalid Unit of Measure (UOM)", 400);
    }

    // Validate images
    if (!Array.isArray(images) || images.length === 0 || !images.every((img) => typeof img === "string")) {
      return Responses.failResponse(res, "At least one valid product image is required", 400);
    }

    // Validate categoryId
    if (!categoryId || typeof categoryId !== "string" || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return Responses.failResponse(res, "Missing or Invalid categoryId", 400);
    }

    // Validate tags (optional)
    if (tags && (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string"))) {
      return Responses.failResponse(res, "Invalid tags format", 400);
    }

    // Validate barcode (optional)
    if (barcode && typeof barcode !== "string") {
      return Responses.failResponse(res, "Invalid barcode format", 400);
    }

    // Create product
    const product = await Product.create({
      name,
      brand,
      description,
      price,
      uom,
      images,
      tags,
      barcode,
      category: categoryId
    });

    return Responses.successResponse(res, "Product created successfully", 201, product);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Fetches all available products with pagination and groups them by category
 * @param {import("express").Request} req - The request object containing query parameters for pagination
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the paginated list of products grouped by category
 */
export const getProducts = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({ isAvailable: true })
      .select("name brand description price uom images category tags barcode isAvailable")
      .populate("category", "name")
      .skip(skip)
      .limit(parseInt(limit));

    if (!products || products.length === 0) {
      return Responses.failResponse(res, "No products found", 404);
    }

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
      const categoryName = product.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {});

    return Responses.successResponse(res, "Products fetched successfully", 200, groupedProducts);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Fetches products by category ID
 * @param {import("express").Request} req - The request object containing category ID in the URL params
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the list of products in the specified category
 */
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Validate categoryId
    if (!categoryId || typeof categoryId !== "string" || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return Responses.failResponse(res, "Missing or Invalid categoryId", 400);
    }

    const products = await Product.find({ category: categoryId })
      .select("name brand description price uom images category tags barcode isAvailable")
      .populate("category", "name");

    if (!products || products.length === 0) {
      return Responses.failResponse(res, "No products found for the specified category", 404);
    }

    return Responses.successResponse(res, "Products fetched successfully", 200, products);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Fetches detailed information about a specific product by its ID
 * @param {import("express").Request} req - The request object containing product ID in the URL params
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the product details
 */
export const getSpecificProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate productId
    if (!productId || typeof productId !== "string" || !mongoose.Types.ObjectId.isValid(productId)) {
      return Responses.failResponse(res, "Missing or Invalid productId", 400);
    }

    const product = await Product.findById(productId)
      .select("name brand description price uom images tags barcode isAvailable")
      .populate("category", "name");

    if (!product) {
      return Responses.failResponse(res, "Product not found", 404);
    }

    return Responses.successResponse(res, "Product fetched successfully", 200, product);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Updates a product by its ID
 * @param {import("express").Request} req - The request object containing product ID in the URL params and updated data in the body
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the updated product details
 */
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    // Validate productId
    if (!productId || typeof productId !== "string" || !mongoose.Types.ObjectId.isValid(productId)) {
      return Responses.failResponse(res, "Missing or Invalid productId", 400);
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true })
      .select("name brand description price uom images tags barcode isAvailable")
      .populate("category", "name");

    if (!updatedProduct) {
      return Responses.failResponse(res, "Product not found or update failed", 404);
    }

    return Responses.successResponse(res, "Product updated successfully", 200, updatedProduct);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};
