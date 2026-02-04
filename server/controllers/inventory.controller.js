import mongoose from "mongoose";
import { Responses } from "../utils/response.js";
import { Inventory } from "../models/Inventory.js";
import { Product } from "../models/Product.js";
import { Store } from "../models/Store.js";

/**
 * Creates or updates inventory record for a product in a store
 * Uses upsert to handle both creation and stock updates
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const upsertInventory = async (req, res) => {
  try {
    const { store_id, product_id, stock, selling_price, discount_percentage = 0 } = req.body;

    // Validation
    if (!store_id || !mongoose.Types.ObjectId.isValid(store_id)) {
      return Responses.failResponse(res, "Invalid or missing store ID", 400);
    }

    if (!product_id || !mongoose.Types.ObjectId.isValid(product_id)) {
      return Responses.failResponse(res, "Invalid or missing product ID", 400);
    }

    if (typeof stock !== "number" || stock < 0) {
      return Responses.failResponse(res, "Stock must be a non-negative number", 400);
    }

    if (typeof selling_price !== "number" || selling_price <= 0) {
      return Responses.failResponse(res, "Selling price must be greater than 0", 400);
    }

    if (discount_percentage < 0 || discount_percentage > 100) {
      return Responses.failResponse(res, "Discount must be between 0 and 100", 400);
    }

    // Verify product exists
    const productExists = await Product.findById(product_id);
    if (!productExists) {
      return Responses.failResponse(res, "Product not found", 404);
    }

    // Verify store exists
    const storeExists = await Store.findById(store_id);
    if (!storeExists) {
      return Responses.failResponse(res, "Store not found", 404);
    }

    // Upsert inventory (create if doesn't exist, update if exists)
    const inventory = await Inventory.findOneAndUpdate(
      { store_id, product_id },
      { 
        stock, 
        selling_price, 
        discount_percentage 
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    ).populate("product_id", "name brand images category");

    return Responses.successResponse(
      res, 
      "Inventory updated successfully", 
      200, 
      inventory
    );
  } catch (error) {
    return Responses.errorResponse(
      res, 
      error instanceof Error ? error.message : "Something went wrong!"
    );
  }
};

/**
 * Bulk upsert inventory for multiple products in a store
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const bulkUpsertInventory = async (req, res) => {
  try {
    const { store_id, items } = req.body;
    
    // items format: [{ product_id, stock, selling_price, discount_percentage }]

    if (!store_id || !mongoose.Types.ObjectId.isValid(store_id)) {
      return Responses.failResponse(res, "Invalid or missing store ID", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Responses.failResponse(res, "Items array is required and must not be empty", 400);
    }

    // Validation for each item in the items array
    for (const [index, item] of items.entries()) {
      if (!item.product_id || !mongoose.Types.ObjectId.isValid(item.product_id)) {
        return Responses.failResponse(res, `Invalid or missing product_id at index ${index}. Each item must have: { product_id, stock, selling_price, [discount_percentage] }`, 400);
      }
      if (typeof item.stock !== "number" || item.stock < 0) {
        return Responses.failResponse(res, `Invalid stock for product ${item.product_id} at index ${index}. Stock must be a non-negative number.`, 400);
      }
      if (typeof item.selling_price !== "number" || item.selling_price <= 0) {
        return Responses.failResponse(res, `Invalid selling_price for product ${item.product_id} at index ${index}. Selling price must be greater than 0.`, 400);
      }
      if (item.discount_percentage !== undefined && (typeof item.discount_percentage !== "number" || item.discount_percentage < 0 || item.discount_percentage > 100)) {
        return Responses.failResponse(res, `Invalid discount_percentage for product ${item.product_id} at index ${index}. Discount must be between 0 and 100.`, 400);
      }
    }

    // Verify store exists
    const storeExists = await Store.findById(store_id);
    if (!storeExists) {
      return Responses.failResponse(res, "Store not found", 404);
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { store_id, product_id: item.product_id },
        update: {
          $set: {
            stock: item.stock,
            selling_price: item.selling_price,
            discount_percentage: item.discount_percentage || 0
          }
        },
        upsert: true
      }
    }));

    const result = await Inventory.bulkWrite(bulkOps);

    return Responses.successResponse(
      res,
      "Bulk inventory update completed",
      200,
      {
        inserted: result.upsertedCount,
        updated: result.modifiedCount,
        total: result.upsertedCount + result.modifiedCount
      }
    );
  } catch (error) {
    return Responses.errorResponse(
      res,
      error instanceof Error ? error.message : "Something went wrong!"
    );
  }
};

/**
 * Update stock quantity for a specific inventory item
 * Supports both increment/decrement operations
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const updateStock = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const { quantity, operation = "set" } = req.body; 
    // operation: 'set' | 'increment' | 'decrement'

    if (!inventoryId || !mongoose.Types.ObjectId.isValid(inventoryId)) {
      return Responses.failResponse(res, "Invalid inventory ID", 400);
    }

    if (typeof quantity !== "number" || quantity < 0) {
      return Responses.failResponse(res, "Quantity must be a non-negative number", 400);
    }

    let updateOperation;
    
    switch (operation) {
      case "increment":
        updateOperation = { $inc: { stock: quantity } };
        break;
      case "decrement":
        updateOperation = { $inc: { stock: -quantity } };
        break;
      case "set":
      default:
        updateOperation = { $set: { stock: quantity } };
        break;
    }

    const updatedInventory = await Inventory.findByIdAndUpdate(
      inventoryId,
      updateOperation,
      { new: true, runValidators: true }
    ).populate("product_id", "name brand");

    if (!updatedInventory) {
      return Responses.failResponse(res, "Inventory record not found", 404);
    }

    // Ensure stock doesn't go negative
    if (updatedInventory.stock < 0) {
      updatedInventory.stock = 0;
      await updatedInventory.save();
    }

    return Responses.successResponse(
      res,
      "Stock updated successfully",
      200,
      updatedInventory
    );
  } catch (error) {
    return Responses.errorResponse(
      res,
      error instanceof Error ? error.message : "Something went wrong!"
    );
  }
};

/**
 * Deduct stock when order is placed
 * Uses atomic operations to prevent overselling
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const deductStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { store_id, items } = req.body;
    // items format: [{ product_id, quantity }]

    if (!store_id || !mongoose.Types.ObjectId.isValid(store_id)) {
      await session.abortTransaction();
      return Responses.failResponse(res, "Invalid store ID", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      return Responses.failResponse(res, "Items array is required and must not be empty", 400);
    }

    // Validation for each item in the items array
    for (const [index, item] of items.entries()) {
      if (!item.product_id || !mongoose.Types.ObjectId.isValid(item.product_id)) {
        await session.abortTransaction();
        return Responses.failResponse(res, `Invalid or missing product_id at index ${index}. Each item must have: { product_id, quantity }`, 400);
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        await session.abortTransaction();
        return Responses.failResponse(res, `Invalid quantity for product ${item.product_id} at index ${index}. Quantity must be a positive number.`, 400);
      }
    }

    const results = [];
    const failures = [];

    for (const item of items) {
      const inventory = await Inventory.findOneAndUpdate(
        {
          store_id,
          product_id: item.product_id,
          stock: { $gte: item.quantity } // Ensure sufficient stock
        },
        {
          $inc: { stock: -item.quantity }
        },
        { new: true, session }
      );

      if (!inventory) {
        failures.push({
          product_id: item.product_id,
          requested: item.quantity,
          reason: "Insufficient stock or product not found"
        });
      } else {
        results.push(inventory);
      }
    }

    if (failures.length > 0) {
      await session.abortTransaction();
      return Responses.failResponse(
        res,
        "Stock deduction failed for some items",
        400,
        { failures }
      );
    }

    await session.commitTransaction();
    return Responses.successResponse(
      res,
      "Stock deducted successfully",
      200,
      results
    );
  } catch (error) {
    await session.abortTransaction();
    return Responses.errorResponse(
      res,
      error instanceof Error ? error.message : "Stock deduction failed"
    );
  } finally {
    session.endSession();
  }
};

/**
 * Get inventory for a specific store with filters
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getStoreInventory = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { 
      category, 
      inStockOnly = false, 
      lowStock = false,
      lowStockThreshold = 10,
      page = 1,
      limit = 50 
    } = req.query;

    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return Responses.failResponse(res, "Invalid store ID", 400);
    }

    const query = { store_id: storeId };

    // Filter by category if provided
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      const productsInCategory = await Product.find({ category }).select("_id");
      const productIds = productsInCategory.map(p => p._id);
      query.product_id = { $in: productIds };
    }

    // Filter by stock availability
    if (inStockOnly === "true") {
      query.stock = { $gt: 0 };
    }

    // Filter for low stock items
    if (lowStock === "true") {
      query.stock = { $lte: parseInt(lowStockThreshold) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const inventory = await Inventory.find(query)
      .populate({
        path: "product_id",
        select: "name brand description price images category tags isAvailable",
        populate: {
          path: "category",
          select: "name image"
        }
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Inventory.countDocuments(query);

    // Calculate final price with discount
    const enrichedInventory = inventory.map(item => ({
      ...item,
      final_price: item.selling_price - (item.selling_price * item.discount_percentage / 100),
      is_in_stock: item.stock > 0,
      is_low_stock: item.stock <= 10 && item.stock > 0
    }));

    return Responses.successResponse(
      res,
      "Store inventory fetched successfully",
      200,
      {
        inventory: enrichedInventory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    );
  } catch (error) {
    return Responses.errorResponse(
      res,
      error instanceof Error ? error.message : "Something went wrong!"
    );
  }
};

/**
 * Get product availability across stores
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getProductAvailability = async (req, res) => {
  try {
    const { productId } = req.params;
    const { storeId } = req.query;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return Responses.failResponse(res, "Invalid product ID", 400);
    }

    const query = { product_id: productId };

    if (storeId) {
      if (!mongoose.Types.ObjectId.isValid(storeId)) {
        return Responses.failResponse(res, "Invalid store ID", 400);
      }
      query.store_id = storeId;
    }

    const availability = await Inventory.find(query)
      .populate("store_id", "name location is_active")
      .lean();

    if (!availability || availability.length === 0) {
      return Responses.failResponse(
        res,
        "Product not available in any store",
        404
      );
    }

    const enrichedData = availability.map(item => ({
      store: item.store_id,
      stock: item.stock,
      selling_price: item.selling_price,
      discount_percentage: item.discount_percentage,
      final_price: item.selling_price - (item.selling_price * item.discount_percentage / 100),
      is_in_stock: item.stock > 0
    }));

    return Responses.successResponse(
      res,
      "Product availability fetched successfully",
      200,
      enrichedData
    );
  } catch (error) {
    return Responses.errorResponse(
      res,
      error instanceof Error ? error.message : "Something went wrong!"
    );
  }
};

/**
 * Get store menu grouped by categories (for frontend display)
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getStoreMenu = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { inStockOnly = true } = req.query;

    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return Responses.failResponse(res, "Invalid store ID", 400);
    }

    const query = { store_id: storeId };
    
    if (inStockOnly === "true") {
      query.stock = { $gt: 0 };
    }

    const inventory = await Inventory.find(query)
      .populate({
        path: "product_id",
        match: { isAvailable: true }, // Only show available products
        select: "name brand description images tags",
        populate: {
          path: "category",
          select: "name image isActive"
        }
      })
      .lean();

    // Filter out items where product was not populated (isAvailable: false)
    const validInventory = inventory.filter(item => item.product_id);

    // Group by category
    const menu = validInventory.reduce((acc, item) => {
      const category = item.product_id.category;
      
      if (!category || !category.isActive) {
        return acc;
      }

      const categoryId = category._id.toString();
      
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category_id: category._id,
          category_name: category.name,
          category_image: category.image,
          products: []
        };
      }

      acc[categoryId].products.push({
        product_id: item.product_id._id,
        name: item.product_id.name,
        brand: item.product_id.brand,
        description: item.product_id.description,
        images: item.product_id.images,
        tags: item.product_id.tags,
        selling_price: item.selling_price,
        discount_percentage: item.discount_percentage,
        final_price: item.selling_price - (item.selling_price * item.discount_percentage / 100),
        stock: item.stock,
        is_in_stock: item.stock > 0
      });

      return acc;
    }, {});

    const menuArray = Object.values(menu);

    return Responses.successResponse(
      res,
      "Store menu fetched successfully",
      200,
      {
        store_id: storeId,
        categories: menuArray,
        total_categories: menuArray.length,
        total_products: validInventory.length
      }
    );
  } catch (error) {
    return Responses.errorResponse(
      res,
      error instanceof Error ? error.message : "Something went wrong!"
    );
  }
};

/**
 * Get low stock items for a store (for admin alerts)
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getLowStockItems = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { threshold = 10 } = req.query;

    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return Responses.failResponse(res, "Invalid store ID", 400);
    }

    const lowStockItems = await Inventory.find({
      store_id: storeId,
      stock: { $lte: parseInt(threshold), $gt: 0 }
    })
      .populate("product_id", "name brand category")
      .sort({ stock: 1 }) // Lowest stock first
      .lean();

    return Responses.successResponse(
      res,
      "Low stock items fetched successfully",
      200,
      {
        items: lowStockItems,
        count: lowStockItems.length,
        threshold: parseInt(threshold)
      }
    );
  } catch (error) {
    return Responses.errorResponse(
      res,
      error instanceof Error ? error.message : "Something went wrong!"
    );
  }
};

/**
 * Check stock availability for multiple products (used during checkout)
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const checkStockAvailability = async (req, res) => {
  try {
    const { store_id, items } = req.body;
    // items format: [{ product_id, quantity }]

    if (!store_id || !mongoose.Types.ObjectId.isValid(store_id)) {
      return Responses.failResponse(res, "Invalid store ID", 400);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Responses.failResponse(res, "Items array is required", 400);
    }

    const productIds = items.map(item => item.product_id);

    const inventory = await Inventory.find({
      store_id,
      product_id: { $in: productIds }
    }).lean();

    const results = items.map(item => {
      const inventoryItem = inventory.find(
        inv => inv.product_id.toString() === item.product_id.toString()
      );

      const available = inventoryItem ? inventoryItem.stock >= item.quantity : false;

      return {
        product_id: item.product_id,
        requested_quantity: item.quantity,
        available_stock: inventoryItem ? inventoryItem.stock : 0,
        is_available: available,
        selling_price: inventoryItem ? inventoryItem.selling_price : null,
        discount_percentage: inventoryItem ? inventoryItem.discount_percentage : 0
      };
    });

    const allAvailable = results.every(r => r.is_available);

    return Responses.successResponse(
      res,
      allAvailable ? "All items available" : "Some items unavailable",
      200,
      {
        all_available: allAvailable,
        items: results
      }
    );
  } catch (error) {
    return Responses.errorResponse(
      res,
      error instanceof Error ? error.message : "Something went wrong!"
    );
  }
};

/**
 * Delete inventory record
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const deleteInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;

    if (!inventoryId || !mongoose.Types.ObjectId.isValid(inventoryId)) {
      return Responses.failResponse(res, "Invalid inventory ID", 400);
    }

    const deletedInventory = await Inventory.findByIdAndDelete(inventoryId);

    if (!deletedInventory) {
      return Responses.failResponse(res, "Inventory record not found", 404);
    }

    return Responses.successResponse(
      res,
      "Inventory record deleted successfully",
      200,
      deletedInventory
    );
  } catch (error) {
    return Responses.errorResponse(
      res,
      error instanceof Error ? error.message : "Something went wrong!"
    );
  }
};