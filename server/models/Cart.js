// models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    }, 
    { 
        _id: false 
    }
);

const cartSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One active cart per user
        },
        store_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true, // Cart is locked to a specific Dark Store location
        },
        items: [cartItemSchema],
        total_price_estimate: { type: Number } // Optional, for UI cache
    },
    { 
        timestamps: true 
    }
);

export default mongoose.model("Cart", cartSchema);