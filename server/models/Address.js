import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User identity is required"],
            index: true,
            validate: {
                validator: function(v) {
                    return mongoose.Types.ObjectId.isValid(v);
                },
                message: "Invalid user ID format"
            }
        },
        tag: {
            type: String,
            enum: {
                values: ["home", "work", "other"],
                message: "Address tag must be one of: Home, Work, or Other",
            },
            default: "home",
            trim: true,
            lowercase: true,
        },
        house_details: {
            type: String,
            required: [true, "Flat/House number/Floor details are required"],
            trim: true,
            minlength: [3, "House details must be at least 3 characters"],
            maxlength: [100, "House details cannot exceed 100 characters"],
        },
        apartment_name: {
            type: String,
            trim: true,
            maxlength: [80, "Apartment name cannot exceed 80 characters"],
            default: null,
        },
        street: {
            type: String,
            required: [true, "Street or area description is required"],
            trim: true,
            minlength: [3, "Street must be at least 3 characters"],
            maxlength: [120, "Street cannot exceed 120 characters"],
        },
        landmark: {
            type: String,
            trim: true,
            maxlength: [100, "Landmark cannot exceed 100 characters"],
            default: null,
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
            lowercase: true,
            minlength: [2, "City must be at least 2 characters"],
            maxlength: [50, "City cannot exceed 50 characters"],
            match: [/^[a-z\s-]+$/i, "City can only contain letters, spaces, and hyphens"],
        },
        state: {
            type: String,
            required: [true, "State is required"],
            trim: true,
            lowercase: true,
            minlength: [2, "State must be at least 2 characters"],
            maxlength: [50, "State cannot exceed 50 characters"],
            match: [/^[a-z\s-]+$/i, "State can only contain letters, spaces, and hyphens"],
        },
        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true,
            match: [/^[0-9]{6}$/, "Pincode must be exactly 6 digits"],
            index: true,
        },
        // GeoJSON Point for geospatial location-based features
        location: {
            type: {
                type: String,
                enum: {
                    values: ["Point"],
                    message: "Location type must be a Point",
                },
                default: "Point",
                required: [true, "Location type is required"],
            },
            coordinates: {
                type: [Number], // [Longitude, Latitude]
                required: [true, "Geo-coordinates are required for delivery verification"],
                validate: {
                    validator: function (v) {
                        return (
                            Array.isArray(v) &&
                            v.length === 2 &&
                            typeof v[0] === "number" &&
                            typeof v[1] === "number" &&
                            v[0] >= -180 && v[0] <= 180 && // Longitude range
                            v[1] >= -90 && v[1] <= 90     // Latitude range
                        );
                    },
                    message: "Coordinates must be [longitude, latitude] with valid ranges",
                },
            },
        },
        is_default: {
            type: Boolean,
            default: false,
            index: true,
        },
        is_verified: {
            type: Boolean,
            default: false,
            description: "Flag to indicate if address has been verified by user"
        },
        delivery_instructions: {
            type: String,
            trim: true,
            maxlength: [200, "Delivery instructions cannot exceed 200 characters"],
            default: null,
            description: "Special instructions for delivery (e.g., Gate code, building access)"
        },
    },
    { 
        timestamps: true 
    }
);

// Geospatial indexes
addressSchema.index({ location: "2dsphere" });
addressSchema.index({ user_id: 1, is_default: 1 });
addressSchema.index({ pincode: 1, city: 1 });

// Pre-save middleware to ensure data consistency
addressSchema.pre("save", async function() {
    // Normalize city and state to lowercase
    if (this.city) {
        this.city = this.city.toLowerCase().trim();
    }
    if (this.state) {
        this.state = this.state.toLowerCase().trim();
    }
    // Ensure tag is lowercase
    if (this.tag) {
        this.tag = this.tag.toLowerCase();
    }
});

export const Address = mongoose.model("Address", addressSchema);