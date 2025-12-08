const express = require("express");
const mongoose = require("mongoose");

const Group = require("../models/Group");
const Message = require("../models/Message");

const groupController = require("../controllers/group.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Message
 *   description: 메시지 관련 API
 */

/**
 * @swagger
 * /api/study-groups/notification:
 *   get:
 *     summary: 안 읽은 메시지 알림 조회
 *     tags: [Message]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 알림 조회 성공
 *       500:
 *         description: 서버 오류
 */
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

/**
 * @swagger
 * /api/study-groups/read:
 *   put:
 *     summary: 메시지 읽음 처리
 *     tags: [Message]
 *     parameters:
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             groupId:
 *               type: string
 *             userId:
 *               type: string
 *     responses:
 *       200:
 *         description: 읽음 처리 성공
 *       500:
 *         description: 서버 오류
 */
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

/**
 * @swagger
 * /api/study-groups/lastMessages:
 *   get:
 *     summary: 마지막 메시지 목록 조회
 *     tags: [Message]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 마지막 메시지 목록 조회 성공
 *       500:
 *         description: 서버 오류
 */
router.get("/lastMessages", async (req, res) => {
    try {
        const { userId, group } = req.query;

        // [수정] group이 빈 문자열("")이면 빈 객체 반환 (ObjectId 에러 방지)
        if (!group || group.trim() === "") {
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
            // [수정] lastSender가 존재하는지 확인 후 toString() 호출 (Null Check)
            const senderId = stat.lastSender ? stat.lastSender.toString() : null;
            const isMe = senderId === userId;

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

/**
 * @swagger
 * /api/study-groups/{groupId}/messages:
 *   get:
 *     summary: 특정 스터디 그룹의 메시지 목록 조회
 *     tags: [Message]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: userid
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 메시지 목록 조회 성공
 *       403:
 *         description: 그룹 멤버가 아님
 *       404:
 *         description: 그룹을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/:groupId/messages", async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.headers.userid; // headers는 소문자로 옴

        const groupData = await Group.findById(groupId);

        // [수정] 그룹 정보가 없을 경우 처리 (서버 크래시 방지)
        if (!groupData) {
            return res.status(404).json({ message: "그룹을 찾을 수 없습니다." });
        }

        const checkMember = await groupController.checkMember(groupData, userId);

        // checkMember가 false거나, undefined(로직오류)일 경우 모두 차단
        if (!checkMember) {
            return res.status(403).json({ message: `당신이 소속된 스터디 그룹이 아닙니다.` });
        }

        const messages = await Message.find({ group: groupId })
            .populate("sender", "name userProfile")
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
