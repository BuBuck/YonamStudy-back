const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
    {
        group: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        groupImage: { type: String, default: "/uploads/users/default-userProfile.png" },
        groupLeader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        groupMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        maxMembers: {
            type: Number,
            required: true,
        },

        schedule: {
            weeks: [String],
            time: {
                type: String,
                required: true,
            },
        },
        location: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            required: true,
        },

        tags: [String],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
