import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User identity is required"],
            index: true,
        },
        tag: {
            type: String,
            enum: {
                values: ["Home", "Work", "Other"],
                message: "{VALUE} is not a supported address tag",
            },
            default: "Home",
            trim: true,
        },
        house_details: {
            type: String,
            required: [true, "Flat/House number/Floor details are required"],
            trim: true,
        },
        apartment_name: {
            type: String,
            trim: true,
        },
        street: {
            type: String,
            required: [true, "Street or area description is required"],
            trim: true,
        },
        landmark: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
        },
        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true,
            match: [/^[0-9]{6}$/, "Please provide a valid 6-digit pincode"],
        },
        // GeoJSON Point for specialized location-based features (e.g., nearest Dark Store)
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
                required: true,
            },
            coordinates: {
                type: [Number], // [Longitude, Latitude]
                required: [true, "Geo-coordinates are mandatory for service verification"],
                validate: {
                validator: function (v) {
                    return (
                    Array.isArray(v) &&
                    v.length === 2 &&
                    v[0] >= -180 && v[0] <= 180 && // Longitude range
                    v[1] >= -90 && v[1] <= 90     // Latitude range
                    );
                },
                message: "Invalid coordinates. Format must be [Longitude, Latitude] within valid ranges.",
                },
            },
        },
        is_default: {
            type: Boolean,
            default: false,
        },
    },
    { 
        timestamps: true 
    }
);

addressSchema.index({ location: "2dsphere" });

export const Address = mongoose.model("Address", addressSchema);