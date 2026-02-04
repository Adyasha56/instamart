import { Cart } from "../models/Cart.js";
import { Responses } from "../utils/response.js";

/**
 * Get user's active cart
 */
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id })
      .populate("items.product_id", "name price image")
      .populate("store_id", "name location");

    if (!cart) {
      return Responses.successResponse(res, "No active cart found", 200, null);
    }

    return Responses.successResponse(res, "Cart fetched successfully", 200, cart);
  } catch (error) {
    console.log("Get cart error:", error.message);
    return Responses.errorResponse(res, "Failed to fetch cart", 500);
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity, store_id } = req.body;

    // Basic validation
    if (!product_id || !quantity || !store_id) {
      return Responses.failResponse(res, "Missing product_id, quantity, or store_id", 400);
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return Responses.failResponse(res, "Quantity must be a positive integer", 400);
    }

    // Check if user already has a cart
    let cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        user_id: req.user._id,
        store_id,
        items: [{ product_id, quantity }]
      });
    } else {
      // Check if cart belongs to same store
      if (cart.store_id.toString() !== store_id) {
        return Responses.failResponse(
          res,
          "Cannot add items from different stores. Clear your cart first.",
          400
        );
      }

      // Check if item already exists
      const existingItem = cart.items.find(
        item => item.product_id.toString() === product_id
      );

      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ product_id, quantity });
      }

      await cart.save();
    }

    const populatedCart = await cart.populate("items.product_id", "name price image");
    return Responses.successResponse(res, "Item added to cart successfully", 201, populatedCart);
  } catch (error) {
    console.log("Add to cart error:", error.message);
    return Responses.errorResponse(res, "Failed to add item to cart", 500);
  }
};

/**
 * Update item quantity in cart
 */
export const updateCartItem = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    // Basic validation
    if (!product_id || quantity === undefined) {
      return Responses.failResponse(res, "Missing product_id or quantity", 400);
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return Responses.failResponse(res, "Quantity must be a positive integer", 400);
    }

    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      return Responses.failResponse(res, "No active cart found", 404);
    }

    const item = cart.items.find(item => item.product_id.toString() === product_id);

    if (!item) {
      return Responses.failResponse(res, "Item not found in cart", 404);
    }

    item.quantity = quantity;
    await cart.save();

    const populatedCart = await cart.populate("items.product_id", "name price image");
    return Responses.successResponse(res, "Cart item updated successfully", 200, populatedCart);
  } catch (error) {
    console.log("Update cart item error:", error.message);
    return Responses.errorResponse(res, "Failed to update cart item", 500);
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return Responses.failResponse(res, "Product ID is required", 400);
    }

    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      return Responses.failResponse(res, "No active cart found", 404);
    }

    const itemIndex = cart.items.findIndex(
      item => item.product_id.toString() === productId
    );

    if (itemIndex === -1) {
      return Responses.failResponse(res, "Item not found in cart", 404);
    }

    // Remove item from array
    cart.items.splice(itemIndex, 1);

    // If no items left, delete the cart
    if (cart.items.length === 0) {
      await Cart.deleteOne({ _id: cart._id });
      return Responses.successResponse(res, "Item removed and cart cleared", 200, null);
    }

    await cart.save();
    const populatedCart = await cart.populate("items.product_id", "name price image");
    return Responses.successResponse(res, "Item removed from cart successfully", 200, populatedCart);
  } catch (error) {
    console.log("Remove from cart error:", error.message);
    return Responses.errorResponse(res, "Failed to remove item from cart", 500);
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user._id });

    if (!cart) {
      return Responses.failResponse(res, "No active cart found", 404);
    }

    await Cart.deleteOne({ _id: cart._id });

    return Responses.successResponse(res, "Cart cleared successfully", 200, null);
  } catch (error) {
    console.log("Clear cart error:", error.message);
    return Responses.errorResponse(res, "Failed to clear cart", 500);
  }
};