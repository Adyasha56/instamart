import express from "express";
import { 
  createAddress, 
  getMyAddresses, 
  getAddressById, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} from "../controllers/address.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * All address routes require authentication
 */
router.use(authMiddleware);

/**
 * @route   POST /api/address
 * @desc    Create a new address
 * @access  Private
 * 
 * @route   GET /api/address
 * @desc    Get all addresses for logged-in user
 * @access  Private
 */
router.route("/")
  .post(createAddress)
  .get(getMyAddresses);

/**
 * @route   GET /api/address/:addressId
 * @desc    Get address by ID
 * @access  Private
 * 
 * @route   PATCH /api/address/:addressId
 * @desc    Update address
 * @access  Private
 * 
 * @route   DELETE /api/address/:addressId
 * @desc    Delete address and promote new default if needed
 * @access  Private
 */
router.route("/:addressId")
  .get(getAddressById)
  .patch(updateAddress)
  .delete(deleteAddress);

/**
 * @route   PATCH /api/address/:addressId/set-default
 * @desc    Set an address as default (unsets others)
 * @access  Private
 */
router.patch("/:addressId/set-default", setDefaultAddress);

export default router;
