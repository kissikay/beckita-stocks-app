import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    actionType: {
        type: String,
        required: true,
        enum: ["SALE", "PRODUCT_CREATE", "PRODUCT_RESTOCK", "PRODUCT_UPDATE", "PRODUCT_DELETE"]
    },
    description: {
        type: String,
        required: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed, // For storing IDs, product names, or order totals
        default: {}
    }
}, {
    timestamps: true
});

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
