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
        groupImage: {
            type: String,
            default: "/uploads/study-groups/default-groupImage.png",
        },
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
