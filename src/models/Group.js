const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
    {
        group: {
            type: String,
            required: true,
            unique: true,
        },
        groupLeader: {
            type: mongoose.Schema.Types.ObjectId,
            unique: true,
            ref: "User",
        },
        groupMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                unique: true,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
