import mongoose from "mongoose";

const storeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Store name is required"],
            trim: true
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
                default: "Point"
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: [true, "Location coordinates are required"],
                validate: {
                    validator: function (val) {
                        return val.length === 2;
                    },
                    message: "Coordinates must be [Longitude, Latitude]"
                }
            }
        },
        service_area: {
            type: {
                type: String,
                enum: ["Polygon"],
                required: true
            },
            coordinates: {
                type: [[[Number]]], // [[[lng, lat], [lng, lat], ...]]
                required: [true, "Service area boundary is required"]
            }
        },
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

storeSchema.index({ location: "2dsphere" });
storeSchema.index({ service_area: "2dsphere" });

const Store = mongoose.model("Store", storeSchema);
export default Store;