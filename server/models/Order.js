import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product id must be mentioned"]
        },
        name: {
            type: String,
            required: [true, "Name must be required"]
        },
        image: {
            type: String
        },
        quantity: {
            type: Number
        },
        price_at_purchase: {
            type: Number
        },
        total_item_price: {
            type: Number
        }
    },
    {
        _id: false
    }
)

const orderSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        store_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true
        },
        items_purchased: [
            orderItemSchema
        ],
        total_amount: {
            type: Number,
            min: [0, "You can not owe from us"]
        },
        payment_status: {
            type: String,
            enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
            default: 'PENDING'
        },
        order_status: {
            type: String,
            enum: [
                'PLACED',
                'PACKING',
                'OUT_FOR_DELIVERY',
                'DELIVERED',         
                'CANCELLED'
            ],
            default: 'PLACED'
        },
        delivery_address: {
            type: Object, // Snapshot of the address at the time of order
            required: [true, "Delivery address is required"]
        }
    },
    {
        timestamps: true
    }
);

// Index for tracking status for dashboard/admin
orderSchema.index({ order_status: 1 });

export const Order = mongoose.model("Order", orderSchema);
export default Order;