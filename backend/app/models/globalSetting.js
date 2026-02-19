import mongoose from "mongoose";

const globalSettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        description: String,
    },
    { timestamps: true }
);

export default mongoose.model("GlobalSetting", globalSettingSchema);
