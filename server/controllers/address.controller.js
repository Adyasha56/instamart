import mongoose from "mongoose";
import { Address } from "../models/Address.js";
import { Store } from "../models/Store.js";
import { Responses } from "../utils/response.js";

/**
 * Validation errors with specific codes and messages
 */
const ValidationErrors = {
  MISSING_FIELDS: { code: "VALIDATION_001", message: "Missing required address fields" },
  INVALID_PINCODE: { code: "VALIDATION_002", message: "Invalid pincode format. Must be exactly 6 digits" },
  INVALID_COORDINATES: { code: "VALIDATION_003", message: "Invalid coordinates format. Expected [longitude, latitude]" },
  INVALID_COORDINATE_RANGE: { code: "VALIDATION_004", message: "Coordinates out of valid range. Longitude: [-180, 180], Latitude: [-90, 90]" },
  NOT_SERVICEABLE: { code: "SERVICE_001", message: "Sorry, we don't deliver to this location yet" },
  INVALID_ADDRESS_ID: { code: "VALIDATION_005", message: "Invalid address ID format" },
  ADDRESS_NOT_FOUND: { code: "NOT_FOUND_001", message: "Address not found" },
  FORBIDDEN: { code: "AUTH_001", message: "You do not have permission to access this address" },
  INVALID_TAG: { code: "VALIDATION_006", message: "Invalid address tag. Must be one of: Home, Work, Other" },
  INVALID_USER_ID: { code: "AUTH_002", message: "Invalid or missing user credentials" },
  STRING_TOO_SHORT: { code: "VALIDATION_007", message: "Field length is below minimum requirement" },
  STRING_TOO_LONG: { code: "VALIDATION_008", message: "Field length exceeds maximum limit" },
  INVALID_FORMAT: { code: "VALIDATION_009", message: "Invalid character format in field" },
};

/**
 * Field constraints for validation
 */
const FieldConstraints = {
  house_details: { min: 3, max: 100 },
  apartment_name: { min: 0, max: 80 },
  street: { min: 3, max: 120 },
  landmark: { min: 0, max: 100 },
  city: { min: 2, max: 50, pattern: /^[a-z\s-]+$/i },
  state: { min: 2, max: 50, pattern: /^[a-z\s-]+$/i },
  pincode: { pattern: /^[0-9]{6}$/ },
  delivery_instructions: { min: 0, max: 200 },
};

const VALID_TAGS = ["home", "work", "other"];

/**
 * Helper: Validate user authentication
 * @returns {Object} { valid: boolean, userId: string|null, error: string|null }
 */
const validateUserAuth = (user) => {
  if (!user || !mongoose.Types.ObjectId.isValid(user._id)) {
    return { valid: false, userId: null, error: ValidationErrors.INVALID_USER_ID.message };
  }
  return { valid: true, userId: user._id, error: null };
};

/**
 * Helper: Validate address ID format
 * @returns {Object} { valid: boolean, error: string|null }
 */
const validateAddressId = (addressId) => {
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    return { valid: false, error: ValidationErrors.INVALID_ADDRESS_ID.message };
  }
  return { valid: true, error: null };
};

/**
 * Helper: Validate string field length
 * @param {string} value - Field value
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {Object} { valid: boolean, error: string|null }
 */
const validateStringLength = (value, min, max) => {
  const trimmedValue = value?.trim() || "";
  const length = trimmedValue.length;
  
  if (length < min) {
    return { valid: false, error: `Length must be at least ${min} characters` };
  }
  if (length > max) {
    return { valid: false, error: `Length cannot exceed ${max} characters` };
  }
  return { valid: true, error: null };
};

/**
 * Helper: Validate string field with pattern
 * @param {string} value - Field value
 * @param {RegExp} pattern - Regex pattern
 * @returns {Object} { valid: boolean, error: string|null }
 */
const validateStringPattern = (value, pattern) => {
  if (!pattern.test(value?.trim() || "")) {
    return { valid: false, error: "Invalid character format" };
  }
  return { valid: true, error: null };
};

/**
 * Helper: Comprehensive field validation
 * @param {string} fieldName - Name of the field being validated
 * @param {*} value - Value to validate
 * @param {Object} constraints - Field constraints
 * @returns {Object} { valid: boolean, error: string|null }
 */
const validateField = (fieldName, value, constraints) => {
  if (!value && constraints.min > 0) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value === "string") {
    const lengthValidation = validateStringLength(value, constraints.min || 0, constraints.max);
    if (!lengthValidation.valid) {
      return { valid: false, error: `${fieldName}: ${lengthValidation.error}` };
    }

    if (constraints.pattern) {
      const patternValidation = validateStringPattern(value, constraints.pattern);
      if (!patternValidation.valid) {
        return { valid: false, error: `${fieldName}: ${patternValidation.error}` };
      }
    }
  }

  return { valid: true, error: null };
};

/**
 * Helper: Validate all required address fields
 * @param {Object} data - Address data
 * @returns {Object} { valid: boolean, errors: string[]|null }
 */
const validateAddressFields = (data) => {
  const errors = [];
  const requiredFields = ["house_details", "street", "city", "state", "pincode"];

  // Check required fields
  for (const field of requiredFields) {
    if (!data[field]?.toString().trim()) {
      errors.push(`${field} is required`);
    }
  }

  // Validate pincode
  if (data.pincode && !FieldConstraints.pincode.pattern.test(data.pincode.toString().trim())) {
    errors.push(ValidationErrors.INVALID_PINCODE.message);
  }

  // Validate tag
  if (data.tag && !VALID_TAGS.includes(data.tag.toLowerCase())) {
    errors.push(ValidationErrors.INVALID_TAG.message);
  }

  // Validate field lengths and patterns
  const fieldsToValidate = ["house_details", "street", "city", "state", "apartment_name", "landmark", "delivery_instructions"];
  for (const field of fieldsToValidate) {
    if (data[field]) {
      const validation = validateField(field, data[field], FieldConstraints[field]);
      if (!validation.valid) {
        errors.push(validation.error);
      }
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, errors: null };
};

/**
 * Helper: Sanitize and validate coordinate input
 * @param {*} coordinates - Raw coordinate input
 * @returns {Object} { valid: boolean, data: array|null, error: string|null }
 */
const validateCoordinates = (coordinates) => {
  if (!coordinates) {
    return { valid: false, data: null, error: ValidationErrors.MISSING_FIELDS.message };
  }

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return { valid: false, data: null, error: ValidationErrors.INVALID_COORDINATES.message };
  }

  const [longitude, latitude] = coordinates;

  // Ensure both are numbers
  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return { valid: false, data: null, error: ValidationErrors.INVALID_COORDINATES.message };
  }

  // Check ranges
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    return { valid: false, data: null, error: ValidationErrors.INVALID_COORDINATE_RANGE.message };
  }

  return { valid: true, data: coordinates, error: null };
};

/**
 * Helper: Check if a location is serviceable by any active store
 * @param {Array<number>} coordinates - [longitude, latitude]
 * @returns {Promise<Object>} { serviceable: boolean, storeId: string|null, error: string|null }
 */
const checkServiceability = async (coordinates) => {
  try {
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
    }).select("_id").lean();
    
    return {
      serviceable: !!serviceableStore,
      storeId: serviceableStore?._id || null,
      error: null
    };
  } catch (error) {
    console.error("Serviceability check error:", error.message);
    return { serviceable: false, storeId: null, error: "Unable to verify service area" };
  }
};

/**
 * Helper: Normalize and trim all string fields in object
 * @param {Object} data - Data object
 * @returns {Object} - Sanitized data
 */
const sanitizeAddressData = (data) => {
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitized[key].trim();
    }
  });
  return sanitized;
};

/**
 * Helper: Check ownership and return address
 * @returns {Promise<Object>} { owned: boolean, address: object|null, error: string|null }
 */
const checkAddressOwnership = async (addressId, userId) => {
  try {
    const address = await Address.findById(addressId);
    if (!address) {
      return { owned: false, address: null, error: ValidationErrors.ADDRESS_NOT_FOUND.message };
    }

    if (address.user_id.toString() !== userId.toString()) {
      return { owned: false, address: null, error: ValidationErrors.FORBIDDEN.message };
    }

    return { owned: true, address, error: null };
  } catch (error) {
    return { owned: false, address: null, error: "Failed to fetch address" };
  }
};

/**
 * Helper: Handle validation errors in catch blocks
 * @param {Error} error - Mongoose or other error
 * @returns {Object} { statusCode: number, message: string }
 */
const handleValidationError = (error) => {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map(e => e.message);
    return { statusCode: 400, message: `Validation error: ${messages.join(", ")}` };
  }
  if (error.name === "CastError") {
    return { statusCode: 400, message: "Invalid data format" };
  }
  return { statusCode: 500, message: "An unexpected error occurred" };
};

/**
 * Creates a new address for the authenticated user
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const createAddress = async (req, res) => {
  try {
    // 1. Validate user authentication
    const userValidation = validateUserAuth(req.user);
    if (!userValidation.valid) {
      return Responses.failResponse(res, userValidation.error, 401);
    }

    const { coordinates, ...addressData } = req.body;

    // 2. Validate required fields and format
    const fieldValidation = validateAddressFields({ ...addressData, coordinates });
    if (!fieldValidation.valid) {
      return Responses.failResponse(res, fieldValidation.errors.join("; "), 400);
    }

    // 3. Validate coordinates
    const coordValidation = validateCoordinates(coordinates);
    if (!coordValidation.valid) {
      return Responses.failResponse(res, coordValidation.error, 400);
    }

    // 4. Check serviceability
    const { serviceable, error: serviceError } = await checkServiceability(coordValidation.data);
    if (!serviceable) {
      const errorMsg = serviceError || ValidationErrors.NOT_SERVICEABLE.message;
      return Responses.failResponse(res, errorMsg, 400);
    }

    // 5. Check if this is the user's first address
    const existingAddressCount = await Address.countDocuments({ user_id: userValidation.userId });
    const is_default = existingAddressCount === 0;

    // 6. Prepare and create address
    const sanitizedData = sanitizeAddressData(addressData);
    const newAddress = await Address.create({
      user_id: userValidation.userId,
      tag: sanitizedData.tag?.toLowerCase() || "home",
      house_details: sanitizedData.house_details,
      apartment_name: sanitizedData.apartment_name || null,
      street: sanitizedData.street,
      landmark: sanitizedData.landmark || null,
      city: sanitizedData.city.toLowerCase(),
      state: sanitizedData.state.toLowerCase(),
      pincode: sanitizedData.pincode,
      delivery_instructions: sanitizedData.delivery_instructions || null,
      location: {
        type: "Point",
        coordinates: coordValidation.data
      },
      is_default,
      is_verified: false
    });

    return Responses.successResponse(res, "Address created successfully", 201, newAddress);
  } catch (error) {
    console.error("Create address error:", error.message);
    const errorInfo = handleValidationError(error);
    return Responses.failResponse(res, errorInfo.message, errorInfo.statusCode);
  }
};

/**
 * Fetches all addresses for the logged-in user
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getMyAddresses = async (req, res) => {
  try {
    // Validate user authentication
    const userValidation = validateUserAuth(req.user);
    if (!userValidation.valid) {
      return Responses.failResponse(res, userValidation.error, 401);
    }

    const addresses = await Address.find({ user_id: userValidation.userId })
      .sort({ is_default: -1, createdAt: -1 })
      .lean();

    return Responses.successResponse(res, "Addresses fetched successfully", 200, {
      count: addresses.length,
      addresses
    });
  } catch (error) {
    console.error("Get addresses error:", error.message);
    return Responses.errorResponse(res, "Failed to fetch addresses");
  }
};

/**
 * Get a specific address by ID
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const getAddressById = async (req, res) => {
  try {
    // 1. Validate user authentication
    const userValidation = validateUserAuth(req.user);
    if (!userValidation.valid) {
      return Responses.failResponse(res, userValidation.error, 401);
    }

    // 2. Validate address ID
    const idValidation = validateAddressId(req.params.addressId);
    if (!idValidation.valid) {
      return Responses.failResponse(res, idValidation.error, 400);
    }

    // 3. Check ownership and fetch
    const { owned, address, error } = await checkAddressOwnership(req.params.addressId, userValidation.userId);
    if (!owned) {
      const statusCode = error === ValidationErrors.ADDRESS_NOT_FOUND.message ? 404 : 403;
      return Responses.failResponse(res, error, statusCode);
    }

    return Responses.successResponse(res, "Address fetched successfully", 200, address);
  } catch (error) {
    console.error("Get address by ID error:", error.message);
    return Responses.errorResponse(res, "Failed to fetch address");
  }
};

/**
 * Update an existing address
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export const updateAddress = async (req, res) => {
  try {
    // 1. Validate user authentication
    const userValidation = validateUserAuth(req.user);
    if (!userValidation.valid) {
      return Responses.failResponse(res, userValidation.error, 401);
    }

    // 2. Validate address ID
    const idValidation = validateAddressId(req.params.addressId);
    if (!idValidation.valid) {
      return Responses.failResponse(res, idValidation.error, 400);
    }

    // 3. Check ownership and fetch
    const { owned, address, error } = await checkAddressOwnership(req.params.addressId, userValidation.userId);
    if (!owned) {
      const statusCode = error === ValidationErrors.ADDRESS_NOT_FOUND.message ? 404 : 403;
      return Responses.failResponse(res, error, statusCode);
    }

    const updateData = { ...req.body };

    // 4. Prevent direct update of system fields
    delete updateData.user_id;
    delete updateData.is_default;
    delete updateData._id;
    delete updateData.createdAt;

    // 5. Validate and process updates
    if (Object.keys(updateData).length === 0) {
      return Responses.failResponse(res, "No valid fields to update", 400);
    }

    // Validate coordinates if being updated
    if (updateData.coordinates) {
      const coordValidation = validateCoordinates(updateData.coordinates);
      if (!coordValidation.valid) {
        return Responses.failResponse(res, coordValidation.error, 400);
      }

      // Re-check serviceability
      const { serviceable } = await checkServiceability(coordValidation.data);
      if (!serviceable) {
        return Responses.failResponse(res, ValidationErrors.NOT_SERVICEABLE.message, 400);
      }

      updateData.location = {
        type: "Point",
        coordinates: coordValidation.data
      };
      delete updateData.coordinates;
    }

    // Validate other fields
    const sanitizedUpdateData = sanitizeAddressData(updateData);
    const fieldValidation = validateAddressFields(sanitizedUpdateData);
    if (!fieldValidation.valid) {
      return Responses.failResponse(res, fieldValidation.errors.join("; "), 400);
    }

    // 6. Update address
    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.addressId,
      { $set: sanitizedUpdateData },
      { new: true, runValidators: true }
    );

    return Responses.successResponse(res, "Address updated successfully", 200, updatedAddress);
  } catch (error) {
    console.error("Update address error:", error.message);
    const errorInfo = handleValidationError(error);
    return Responses.failResponse(res, errorInfo.message, errorInfo.statusCode);
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
    // 1. Validate user authentication
    const userValidation = validateUserAuth(req.user);
    if (!userValidation.valid) {
      await session.abortTransaction();
      return Responses.failResponse(res, userValidation.error, 401);
    }

    // 2. Validate address ID
    const idValidation = validateAddressId(req.params.addressId);
    if (!idValidation.valid) {
      await session.abortTransaction();
      return Responses.failResponse(res, idValidation.error, 400);
    }

    // 3. Check ownership and fetch
    const address = await Address.findById(req.params.addressId).session(session);
    if (!address) {
      await session.abortTransaction();
      return Responses.failResponse(res, ValidationErrors.ADDRESS_NOT_FOUND.message, 404);
    }

    if (address.user_id.toString() !== userValidation.userId.toString()) {
      await session.abortTransaction();
      return Responses.failResponse(res, ValidationErrors.FORBIDDEN.message, 403);
    }

    // 4. Delete address
    const wasDefault = address.is_default;
    await Address.findByIdAndDelete(req.params.addressId).session(session);

    // 5. If we deleted the default address, promote the most recent one
    if (wasDefault) {
      const nextDefault = await Address.findOne({ user_id: userValidation.userId })
        .sort({ createdAt: -1 })
        .session(session);

      if (nextDefault) {
        await Address.findByIdAndUpdate(
          nextDefault._id,
          { $set: { is_default: true } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    return Responses.successResponse(res, "Address deleted successfully", 200);
  } catch (error) {
    await session.abortTransaction();
    console.error("Delete address error:", error.message);
    const errorInfo = handleValidationError(error);
    return Responses.failResponse(res, errorInfo.message, errorInfo.statusCode);
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
    // 1. Validate user authentication
    const userValidation = validateUserAuth(req.user);
    if (!userValidation.valid) {
      await session.abortTransaction();
      return Responses.failResponse(res, userValidation.error, 401);
    }

    // 2. Validate address ID
    const idValidation = validateAddressId(req.params.addressId);
    if (!idValidation.valid) {
      await session.abortTransaction();
      return Responses.failResponse(res, idValidation.error, 400);
    }

    // 3. Check ownership and fetch
    const address = await Address.findById(req.params.addressId).session(session);
    if (!address) {
      await session.abortTransaction();
      return Responses.failResponse(res, ValidationErrors.ADDRESS_NOT_FOUND.message, 404);
    }

    if (address.user_id.toString() !== userValidation.userId.toString()) {
      await session.abortTransaction();
      return Responses.failResponse(res, ValidationErrors.FORBIDDEN.message, 403);
    }

    // 4. Reset all default flags for this user
    await Address.updateMany(
      { user_id: userValidation.userId },
      { $set: { is_default: false } }
    ).session(session);

    // 5. Set this one as default
    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.addressId,
      { $set: { is_default: true } },
      { session, new: true }
    );

    await session.commitTransaction();
    return Responses.successResponse(res, "Default address updated successfully", 200, updatedAddress);
  } catch (error) {
    await session.abortTransaction();
    console.error("Set default address error:", error.message);
    const errorInfo = handleValidationError(error);
    return Responses.failResponse(res, errorInfo.message, errorInfo.statusCode);
  } finally {
    session.endSession();
  }
};