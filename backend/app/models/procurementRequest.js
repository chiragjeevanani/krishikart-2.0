import mongoose from "mongoose";

const procurementRequestSchema = new mongoose.Schema({
    franchiseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Franchise",
        required: true,
    },
    items: [
        {
            productId: {
                type: String, // Or ObjectId if you have a Product model and want strict linking
                required: true,
            },
            name: String,
            quantity: Number,
            unit: String,
            price: Number, // Estimated price
        },
    ],
    totalEstimatedAmount: Number,
    status: {
        type: String,
        enum: ["pending_assignment", "assigned", "completed", "rejected"],
        default: "pending_assignment",
    },
    assignedVendorId: {
        type: String, // keeping simple for now, can be ObjectId ref to Vendor model
        default: null,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assuming MasterAdmin is a User
        default: null,
    },
}, { timestamps: true });

const ProcurementRequest = mongoose.model("ProcurementRequest", procurementRequestSchema);

export default ProcurementRequest;
