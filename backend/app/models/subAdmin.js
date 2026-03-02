import mongoose from "mongoose";

const subAdminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Invalid email"],
        },

        fullName: {
            type: String,
            required: true,
        },

        mobile: {
            type: String,
        },

        password: {
            type: String,
            required: true,
        },

        permissions: {
            type: [String],
            default: [],
        },

        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active",
        },

        role: {
            type: String,
            default: "subadmin",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MasterAdmin",
        },
    },
    { timestamps: true }
);

export default mongoose.model("SubAdmin", subAdminSchema);
