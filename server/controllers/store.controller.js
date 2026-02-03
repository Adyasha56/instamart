import mongoose from "mongoose";
import { Store } from "../models/Store";
import { Responses } from "../utils/response";

/**
 * Creates a new store
 * @param {import("express").Request} req - The request object containing store details in the body
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the result of the operation
 */
export const createStore = async (req, res) => {
  try {
    const { name, location, service_area } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return Responses.failResponse(res, "Missing or Invalid store name", 400);
    }

    // Validate location
    if (!location || location.type !== "Point" || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return Responses.failResponse(res, "Invalid location coordinates", 400);
    }

    // Validate service area
    if (!service_area || service_area.type !== "Polygon" || !Array.isArray(service_area.coordinates) || service_area.coordinates.length === 0) {
      return Responses.failResponse(res, "Invalid service area boundary", 400);
    }

    const store = await Store.create({ name, location, service_area });
    return Responses.successResponse(res, "Store created successfully", 201, store);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Updates a store's isActive status or service area boundary
 * @param {import("express").Request} req - The request object containing store ID in the URL params and updated data in the body
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the updated store details
 */
export const updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { is_active, service_area } = req.body;

    // Validate storeId
    if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
      return Responses.failResponse(res, "Invalid store ID", 400);
    }

    const updateData = {};
    if (typeof is_active === "boolean") {
      updateData.is_active = is_active;
    }
    if (service_area && service_area.type === "Polygon" && Array.isArray(service_area.coordinates)) {
      updateData.service_area = service_area;
    }

    const updatedStore = await Store.findByIdAndUpdate(storeId, updateData, { new: true });

    if (!updatedStore) {
      return Responses.failResponse(res, "Store not found or update failed", 404);
    }

    return Responses.successResponse(res, "Store updated successfully", 200, updatedStore);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Finds the nearest store to a given location
 * @param {import("express").Request} req - The request object containing location coordinates in the query
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response with the nearest store details
 */
export const findNearestStore = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return Responses.failResponse(res, "Missing longitude or latitude", 400);
    }

    const nearestStore = await Store.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: 5000 // 5 km radius
        }
      }
    });

    if (!nearestStore) {
      return Responses.failResponse(res, "No nearby stores found", 404);
    }

    return Responses.successResponse(res, "Nearest store found", 200, nearestStore);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};

/**
 * Checks if a given location is within a store's service area
 * @param {import("express").Request} req - The request object containing location coordinates in the query
 * @param {import("express").Response} res - The response object
 * @returns {Promise<void>} - Sends a response indicating whether the location is within a store's service area
 */
export const checkAvailability = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return Responses.failResponse(res, "Missing longitude or latitude", 400);
    }

    const store = await Store.findOne({
      service_area: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          }
        }
      }
    });

    if (!store) {
      return Responses.failResponse(res, "Location is not within any store's service area", 404);
    }

    return Responses.successResponse(res, "Location is within a store's service area", 200, store);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Something went wrong!");
  }
};