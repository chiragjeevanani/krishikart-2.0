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

// Never persist negative stock
inventorySchema.pre('save', function (next) {
    if (this.items && Array.isArray(this.items)) {
        this.items.forEach(item => {
            if (typeof item.currentStock === 'number' && item.currentStock < 0) {
                item.currentStock = 0;
            }
        });
    }
    next();
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
