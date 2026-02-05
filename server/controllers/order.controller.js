import { Order } from "../models/Order.js";
import { Address } from "../models/Address.js";
import { Responses } from "../utils/response.js";

/**
 * Create a new order from cart
 */
export const createOrder = async (req, res) => {
  try {
    const { store_id, items_purchased, total_amount, address_id } = req.body;

    // Basic checks
    if (!store_id || !items_purchased || !total_amount || !address_id) {
      return Responses.failResponse(res, "Missing required fields", 400);
    }

    if (!Array.isArray(items_purchased) || items_purchased.length === 0) {
      return Responses.failResponse(res, "Items purchased cannot be empty", 400);
    }

    if (total_amount <= 0) {
      return Responses.failResponse(res, "Total amount must be greater than 0", 400);
    }

    // Get delivery address
    const address = await Address.findById(address_id);
    if (!address) {
      return Responses.failResponse(res, "Delivery address not found", 404);
    }

    // Check if address belongs to user
    if (address.user_id.toString() !== req.user._id.toString()) {
      return Responses.failResponse(res, "This address does not belong to you", 403);
    }

    // Create order with address snapshot
    const order = await Order.create({
      user_id: req.user._id,
      store_id,
      items_purchased,
      total_amount,
      delivery_address: {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        house_details: address.house_details,
        apartment_name: address.apartment_name,
        landmark: address.landmark,
        coordinates: address.location.coordinates
      },
      payment_status: "PENDING",
      order_status: "PLACED"
    });

    return Responses.successResponse(res, "Order created successfully", 201, order);
  } catch (error) {
    console.log("Create order error:", error.message);
    return Responses.errorResponse(res, "Failed to create order", 500);
  }
};

/**
 * Get all orders of the logged-in user
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return Responses.successResponse(res, "Orders fetched successfully", 200, {
      count: orders.length,
      orders
    });
  } catch (error) {
    console.log("Get my orders error:", error.message);
    return Responses.errorResponse(res, "Failed to fetch orders", 500);
  }
};

/**
 * Get specific order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return Responses.failResponse(res, "Order not found", 404);
    }

    // Check if order belongs to user or user is admin
    if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return Responses.failResponse(res, "You are not authorized to view this order", 403);
    }

    return Responses.successResponse(res, "Order fetched successfully", 200, order);
  } catch (error) {
    console.log("Get order by ID error:", error.message);
    return Responses.errorResponse(res, "Failed to fetch order", 500);
  }
};

/**
 * Cancel an order (only if not dispatched)
 */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return Responses.failResponse(res, "Order not found", 404);
    }

    // Check ownership
    if (order.user_id.toString() !== req.user._id.toString()) {
      return Responses.failResponse(res, "You are not authorized to cancel this order", 403);
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["PLACED", "PACKING"];
    if (!cancellableStatuses.includes(order.order_status)) {
      return Responses.failResponse(
        res,
        `Cannot cancel order with status: ${order.order_status}`,
        400
      );
    }

    order.order_status = "CANCELLED";
    await order.save();

    return Responses.successResponse(res, "Order cancelled successfully", 200, order);
  } catch (error) {
    console.log("Cancel order error:", error.message);
    return Responses.errorResponse(res, "Failed to cancel order", 500);
  }
};

/**
 * Track order status (real-time)
 */
export const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).select("order_status payment_status createdAt updatedAt user_id");

    if (!order) {
      return Responses.failResponse(res, "Order not found", 404);
    }

    // Check ownership
    if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return Responses.failResponse(res, "You are not authorized to track this order", 403);
    }

    return Responses.successResponse(res, "Order status fetched successfully", 200, order);
  } catch (error) {
    console.log("Track order error:", error.message);
    return Responses.errorResponse(res, "Failed to track order", 500);
  }
};

/**
 * Update order status (Admin/Delivery partner only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order_status, payment_status } = req.body;

    // Check if user is admin or delivery partner
    if (req.user.role !== "admin" && req.user.role !== "delivery") {
      return Responses.failResponse(res, "Only admin or delivery partner can update status", 403);
    }

    if (!order_status && !payment_status) {
      return Responses.failResponse(res, "Provide at least one status to update", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return Responses.failResponse(res, "Order not found", 404);
    }

    // Validate order status
    const validOrderStatuses = ["PLACED", "PACKING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
    if (order_status && !validOrderStatuses.includes(order_status)) {
      return Responses.failResponse(res, "Invalid order status", 400);
    }

    // Validate payment status
    const validPaymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];
    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      return Responses.failResponse(res, "Invalid payment status", 400);
    }

    if (order_status) {
      order.order_status = order_status;
    }
    if (payment_status) {
      order.payment_status = payment_status;
    }

    await order.save();

    return Responses.successResponse(res, "Order status updated successfully", 200, order);
  } catch (error) {
    console.log("Update order status error:", error.message);
    return Responses.errorResponse(res, "Failed to update order status", 500);
  }
};