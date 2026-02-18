import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
    franchiseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Franchise",
        required: true,
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            currentStock: {
                type: Number,
                default: 0,
            },
            mbq: {
                type: Number, // Minimum Base Quantity
                default: 5,
            },
            lastUpdated: {
                type: Date,
                default: Date.now,
            }
        }
    ]
}, { timestamps: true });

// Ensure one inventory record per franchise
inventorySchema.index({ franchiseId: 1 }, { unique: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
