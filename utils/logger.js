import Activity from "../models/activity.js";

export const logActivity = async (adminId, actionType, description, metadata = {}) => {
    try {
        const activity = new Activity({
            adminId,
            actionType,
            description,
            metadata
        });
        await activity.save();
        console.log(`[Activity Logged] ${actionType} by Admin ${adminId}`);
    } catch (e) {
        console.error("[Activity Logging Error]", e);
    }
};
