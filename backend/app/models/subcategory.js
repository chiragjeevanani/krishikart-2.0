import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        image: {
            type: String,
            default: "",
        },
        isVisible: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Ensure name is unique within the same category
subcategorySchema.index({ name: 1, category: 1 }, { unique: true });

export default mongoose.model("Subcategory", subcategorySchema);
