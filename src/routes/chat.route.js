const express = require("express");
const mongoose = require("mongoose");

const Message = require("../models/Message");

const router = express.Router();

router.get("/notification", async (req, res) => {
    try {
        const { userId, group } = req.query;

        if (!userId || !group) {
            return res.status(200).json({ total: 0, groupCounts: {} });
        }

        const rawGroups = group.split(",");

        const groupIds = rawGroups.map((id) => new mongoose.Types.ObjectId(id));

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const unreadStats = await Message.aggregate([
            {
                $match: {
                    group: { $in: groupIds },
                    readBy: { $ne: userObjectId },
                },
            },
            {
                $group: {
                    _id: "$group",
                    count: { $sum: 1 },
                },
            },
        ]);

        const groupCounts = {};
        let total = 0;

        unreadStats.forEach((stat) => {
            const groupId = stat._id.toString();
            groupCounts[groupId] = stat.count;
            total += stat.count;
        });

        res.status(200).json({ total: total, groupCounts: groupCounts });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/read", async (req, res) => {
    try {
        const { groupId, userId } = req.body;

        await Message.updateMany(
            {
                group: groupId,
                readBy: { $ne: userId },
            },
            {
                $addToSet: { readBy: userId },
            }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/lastMessages", async (req, res) => {
    try {
        const { userId, group } = req.query;

        if (!group) {
            return res.status(200).json({});
        }

        const rawGroups = group.split(",");

        const groupIds = rawGroups.map((id) => new mongoose.Types.ObjectId(id));

        const lastMessages = await Message.aggregate([
            { $match: { group: { $in: groupIds } } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$group",
                    lastMessage: { $first: "$message" },
                    lastAt: { $first: "$createdAt" },
                    lastSender: { $first: "$sender" },
                },
            },
        ]);

        const lastMessageMap = {};

        lastMessages.forEach((stat) => {
            const isMe = stat.lastSender.toString() === userId;

            lastMessageMap[stat._id.toString()] = {
                message: stat.lastMessage,
                time: stat.lastAt,
                sender: stat.lastSender,
                isMe: isMe,
            };
        });

        res.status(200).json(lastMessageMap);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/messages/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;

        const messages = await Message.find({ group: groupId })
            .populate("sender", "name")
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
