import mongoose from "mongoose";
import { Address } from "../models/Address.js";
import { Store } from "../models/Store.js";
import { Responses } from "../utils/response.js";

/**
 * Helper function to check if a location is serviceable by any active store
 * @param {Array<number>} coordinates - [longitude, latitude]
 * @returns {Promise<boolean>}
 */
const checkServiceability = async (coordinates) => {
  const serviceableStore = await Store.findOne({
    is_active: true,
    service_area: {
      $geoWithin: {
        $geometry: {
          type: "Point",
          coordinates: coordinates
        }
      }
    }
  });
  return !!serviceableStore;
};

/**
 * Creates a new address for the authenticated user
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const createAddress = async (req, res) => {
  try {
    const { 
      tag, 
      house_details, 
      apartment_name, 
      street, 
      landmark, 
      city, 
      state, 
      pincode, 
      coordinates 
    } = req.body;

    // 1. Validation of required fields
    if (!house_details || !street || !city || !state || !pincode || !coordinates) {
      return Responses.failResponse(res, "Missing required address fields", 400);
    }

    // 2. Validate pincode format (6 digits)
    if (!/^[0-9]{6}$/.test(pincode)) {
      return Responses.failResponse(res, "Invalid pincode format. Must be 6 digits.", 400);
    }

    // 3. Validate coordinates
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return Responses.failResponse(res, "Coordinates must be an array of [longitude, latitude]", 400);
    }

    const [longitude, latitude] = coordinates;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return Responses.failResponse(res, "Invalid coordinates range", 400);
    }

    // 4. Check serviceability
    const isServiceable = await checkServiceability(coordinates);
    if (!isServiceable) {
      return Responses.failResponse(res, "Sorry, we don't deliver to this location yet", 400);
    }

    // 5. Check if this is the user's first address
    const existingAddressCount = await Address.countDocuments({ user_id: req.user._id });
    const is_default = existingAddressCount === 0;

    // 6. Create address
    const newAddress = await Address.create({
      user_id: req.user._id,
      tag: tag || "Home",
      house_details,
      apartment_name,
      street,
      landmark,
      city,
      state,
      pincode,
      location: {
        type: "Point",
        coordinates: coordinates
      },
      is_default
    });

    return Responses.successResponse(res, "Address created successfully", 201, newAddress);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Internal Server Error");
  }
};

/**
 * Fetches all addresses for the logged-in user
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getMyAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user_id: req.user._id })
      .sort({ is_default: -1, createdAt: -1 })
      .lean();

    return Responses.successResponse(res, "Addresses fetched successfully", 200, addresses);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Internal Server Error");
  }
};

/**
 * Get a specific address by ID
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return Responses.failResponse(res, "Invalid address ID", 400);
    }

    const address = await Address.findById(addressId);

    if (!address) {
      return Responses.failResponse(res, "Address not found", 404);
    }

    // Check ownership
    if (address.user_id.toString() !== req.user._id.toString()) {
      return Responses.failResponse(res, "Forbidden: You do not own this address", 403);
    }

    return Responses.successResponse(res, "Address fetched successfully", 200, address);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Internal Server Error");
  }
};

/**
 * Update an existing address
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return Responses.failResponse(res, "Invalid address ID", 400);
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return Responses.failResponse(res, "Address not found", 404);
    }

    // Ownership check
    if (address.user_id.toString() !== req.user._id.toString()) {
      return Responses.failResponse(res, "Forbidden: You do not own this address", 403);
    }

    // Validation for updates
    if (updateData.pincode && !/^[0-9]{6}$/.test(updateData.pincode)) {
      return Responses.failResponse(res, "Invalid pincode format", 400);
    }

    if (updateData.coordinates) {
      if (!Array.isArray(updateData.coordinates) || updateData.coordinates.length !== 2) {
        return Responses.failResponse(res, "Coordinates must be [longitude, latitude]", 400);
      }
      const [lng, lat] = updateData.coordinates;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return Responses.failResponse(res, "Invalid coordinates range", 400);
      }

      // Re-check serviceability
      const isServiceable = await checkServiceability(updateData.coordinates);
      if (!isServiceable) {
        return Responses.failResponse(res, "Sorry, we don't deliver to this new location yet", 400);
      }
      
      // Map to GeoJSON structure
      updateData.location = {
        type: "Point",
        coordinates: updateData.coordinates
      };
      delete updateData.coordinates;
    }

    // Prevent direct update of user_id or is_default
    delete updateData.user_id;
    delete updateData.is_default;

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return Responses.successResponse(res, "Address updated successfully", 200, updatedAddress);
  } catch (error) {
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Internal Server Error");
  }
};

/**
 * Delete an address and promote another if necessary
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const deleteAddress = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      await session.abortTransaction();
      return Responses.failResponse(res, "Invalid address ID", 400);
    }

    const address = await Address.findById(addressId).session(session);
    if (!address) {
      await session.abortTransaction();
      return Responses.failResponse(res, "Address not found", 404);
    }

    if (address.user_id.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return Responses.failResponse(res, "Forbidden", 403);
    }

    const wasDefault = address.is_default;
    await Address.findByIdAndDelete(addressId).session(session);

    // If we deleted the default address, promote the most recent one
    if (wasDefault) {
      const nextDefault = await Address.findOne({ user_id: req.user._id })
        .sort({ createdAt: -1 })
        .session(session);
        
      if (nextDefault) {
        nextDefault.is_default = true;
        await nextDefault.save({ session });
      }
    }

    await session.commitTransaction();
    return Responses.successResponse(res, "Address deleted successfully", 200);
  } catch (error) {
    await session.abortTransaction();
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Internal Server Error");
  } finally {
    session.endSession();
  }
};

/**
 * Set a specific address as the default for the user
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const setDefaultAddress = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      await session.abortTransaction();
      return Responses.failResponse(res, "Invalid address ID", 400);
    }

    const address = await Address.findById(addressId).session(session);
    if (!address) {
      await session.abortTransaction();
      return Responses.failResponse(res, "Address not found", 404);
    }

    if (address.user_id.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return Responses.failResponse(res, "Forbidden", 403);
    }

    // Reset all default flags for this user
    await Address.updateMany(
      { user_id: req.user._id },
      { $set: { is_default: false } }
    ).session(session);

    // Set this one as default
    address.is_default = true;
    await address.save({ session });

    await session.commitTransaction();
    return Responses.successResponse(res, "Default address updated successfully", 200, address);
  } catch (error) {
    await session.abortTransaction();
    return Responses.errorResponse(res, error instanceof Error ? error.message : "Internal Server Error");
  } finally {
    session.endSession();
  }
};
