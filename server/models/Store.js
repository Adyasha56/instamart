import mongoose from "mongoose";
import { Store } from "../models/Store.js";
import { Responses } from "../utils/response.js";

/**
 * Create a new store (Admin only)
 */
export const createStore = async (req, res) => {
  try {
    const { name, location, service_area } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return Responses.failResponse(res, "Store name must be at least 2 characters", 400);
    }

    // Validate location
    if (!location || location.type !== "Point" || !Array.isArray(location.coordinates)) {
      return Responses.failResponse(res, "Location must be a Point with coordinates", 400);
    }

    if (location.coordinates.length !== 2) {
      return Responses.failResponse(res, "Coordinates must be [longitude, latitude]", 400);
    }

    const [longitude, latitude] = location.coordinates;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return Responses.failResponse(res, "Invalid coordinate ranges", 400);
    }

    // Validate service area
    if (!service_area || service_area.type !== "Polygon" || !Array.isArray(service_area.coordinates)) {
      return Responses.failResponse(res, "Service area must be a Polygon", 400);
    }

    if (service_area.coordinates.length === 0) {
      return Responses.failResponse(res, "Service area coordinates cannot be empty", 400);
    }

    const store = await Store.create({
      name: name.trim(),
      location,
      service_area
    });

    return Responses.successResponse(res, "Store created successfully", 201, store);
  } catch (error) {
    console.log("Create store error:", error.message);
    return Responses.errorResponse(res, "Failed to create store", 500);
  }
};

/**
 * Get all stores (Admin only)
 */
export const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().lean();

    return Responses.successResponse(res, "Stores fetched successfully", 200, {
      count: stores.length,
      stores
    });
  } catch (error) {
    console.log("Get all stores error:", error.message);
    return Responses.errorResponse(res, "Failed to fetch stores", 500);
  }
};

/**
 * Update a store's details (Admin only)
 */
export const updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name, location, service_area, is_active } = req.body;

    // Validate storeId
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return Responses.failResponse(res, "Invalid store ID", 400);
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return Responses.failResponse(res, "Store not found", 404);
    }

    const updateData = {};

    // Update name if provided
    if (name) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return Responses.failResponse(res, "Store name must be at least 2 characters", 400);
      }
      updateData.name = name.trim();
    }

    // Update location if provided
    if (location) {
      if (location.type !== "Point" || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
        return Responses.failResponse(res, "Location must be a Point with [longitude, latitude]", 400);
      }

      const [longitude, latitude] = location.coordinates;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        return Responses.failResponse(res, "Invalid coordinate ranges", 400);
      }

      updateData.location = location;
    }

    // Update service area if provided
    if (service_area) {
      if (service_area.type !== "Polygon" || !Array.isArray(service_area.coordinates) || service_area.coordinates.length === 0) {
        return Responses.failResponse(res, "Service area must be a valid Polygon", 400);
      }
      updateData.service_area = service_area;
    }

    // Update is_active if provided
    if (typeof is_active === "boolean") {
      updateData.is_active = is_active;
    }

    const updatedStore = await Store.findByIdAndUpdate(storeId, updateData, { new: true });

    return Responses.successResponse(res, "Store updated successfully", 200, updatedStore);
  } catch (error) {
    console.log("Update store error:", error.message);
    return Responses.errorResponse(res, "Failed to update store", 500);
  }
};

/**
 * Delete a store (Admin only)
 */
export const deleteStore = async (req, res) => {
  try {
    const { storeId } = req.params;

    // Validate storeId
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return Responses.failResponse(res, "Invalid store ID", 400);
    }

    const store = await Store.findByIdAndDelete(storeId);

    if (!store) {
      return Responses.failResponse(res, "Store not found", 404);
    }

    return Responses.successResponse(res, "Store deleted successfully", 200, null);
  } catch (error) {
    console.log("Delete store error:", error.message);
    return Responses.errorResponse(res, "Failed to delete store", 500);
  }
};

/**
 * Find the nearest store to a given location (Public - no auth required)
 */
export const getNearestStore = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return Responses.failResponse(res, "Missing longitude or latitude", 400);
    }

    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);

    // Validate coordinates
    if (isNaN(lon) || isNaN(lat)) {
      return Responses.failResponse(res, "Invalid coordinate format", 400);
    }

    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      return Responses.failResponse(res, "Coordinates out of valid range", 400);
    }

    const nearestStore = await Store.findOne({
      is_active: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat]
          },
          $maxDistance: 50000 // 50 km radius
        }
      }
    });

    if (!nearestStore) {
      return Responses.failResponse(res, "No active stores found nearby", 404);
    }

    return Responses.successResponse(res, "Nearest store found", 200, nearestStore);
  } catch (error) {
    console.log("Get nearest store error:", error.message);
    return Responses.errorResponse(res, "Failed to find nearest store", 500);
  }
};

/**
 * Check if a location is serviceable (within a store's service area) - Public
 */
export const checkServiceability = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return Responses.failResponse(res, "Missing longitude or latitude", 400);
    }

    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);

    // Validate coordinates
    if (isNaN(lon) || isNaN(lat)) {
      return Responses.failResponse(res, "Invalid coordinate format", 400);
    }

    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      return Responses.failResponse(res, "Coordinates out of valid range", 400);
    }

    const serviceableStore = await Store.findOne({
      is_active: true,
      service_area: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat]
          }
        }
      }
    });

    if (!serviceableStore) {
      return Responses.failResponse(res, "Location is not serviceable by any store", 404);
    }

    return Responses.successResponse(res, "Location is serviceable", 200, {
      serviceable: true,
      store: serviceableStore
    });
  } catch (error) {
    console.log("Check serviceability error:", error.message);
    return Responses.errorResponse(res, "Failed to check serviceability", 500);
  }
};