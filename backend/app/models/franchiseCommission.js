import mongoose from "mongoose";

const franchiseCommissionSchema = new mongoose.Schema(
    {
        franchiseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Franchise",
            required: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        commissionPercentage: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true }
);

// Unique index to ensure one commission per franchise per category
franchiseCommissionSchema.index({ franchiseId: 1, categoryId: 1 }, { unique: true });

export default mongoose.model("FranchiseCommission", franchiseCommissionSchema);
