import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
    {
        store_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, "Store ID is required"],
            index: true
        },
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"],
            index: true
        },
        stock: {
            type: Number,
            required: [true, "Stock level is required"],
            min: [0, "Stock cannot be negative"],
            default: 0
        },
        selling_price: {
            type: Number,
            required: [true, "Selling price is required"],
            min: [0, "Selling price cannot be negative"]
        },
        discount_percentage: {
            type: Number,
            min: [0, "Discount percentage cannot be less than 0"],
            max: [100, "Discount percentage cannot exceed 100"],
            default: 0
        },
        inventory: {
            type: Number,
            required: [true, "Inventory level is required"],
            min: [0, "Inventory level cannot be negative"],
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Ensuring that a product in a specific store has a unique inventory record
inventorySchema.index({ store_id: 1, product_id: 1 }, { unique: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;