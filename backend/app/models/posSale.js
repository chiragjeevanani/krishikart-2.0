import mongoose from "mongoose";

const posSaleItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: String,
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },
    unit: String
});

const posSaleSchema = new mongoose.Schema({
    franchiseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Franchise",
        required: true
    },
    items: [posSaleItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["Cash", "QR Scan"],
        required: true
    },
    saleId: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

const POSSale = mongoose.model("POSSale", posSaleSchema);
export default POSSale;
