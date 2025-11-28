const express = require("express");

const Comment = require("../models/Comment");

const commentController = require("../controllers/comment.controller");

const router = express.Router();

router.get("/:groupId/comments", async (req, res) => {
    try {
        const { groupId } = req.params;

        const comments = await Comment.find({ group: groupId, isDeleted: false })
            .populate("commenter", "name major")
            .sort({ createdAt: 1 });

        if (!comments) return res.status(400).json({ message: "댓글 없음" });

        res.status(200).json(comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/:groupId/comment", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content, userId } = req.body;

        if (!userId) return res.status(401).json({ message: "로그인이 필요합니다." });

        const newComment = await commentController.saveComment(groupId, userId, content);

        await newComment.populate("commenter", "name major");

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/:groupId/:commentId", async (req, res) => {
    try {
        const { groupId, commentId } = req.params;
        const { content } = req.body;
        const { userId } = req.query;

        const comment = await Comment.findById(commentId);

        if (!groupId) return res.status(404).json({ message: "존재하지 않은 스터디 그룹입니다." });

        if (!comment) return res.status(404).json({ message: "댓글이 없습니다." });

        if (comment.commenter.toString() !== userId.toString())
            return res.status(403).json({ message: "수정 권한이 없습니다." });

        comment.content = content;
        await comment.save();

        res.status(200).json(comment);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.delete("/:groupId/:commentId", async (req, res) => {
    try {
        const { groupId, commentId } = req.params;
        const { userId } = req.query;

        const comment = await Comment.findById(commentId);

        if (!groupId) return res.status(404).json({ message: "존재하지 않은 스터디 그룹입니다." });

        if (!comment)
            return res.status(404).json({ message: "이미 삭제되었거나 없는 댓글입니다." });

        if (comment.commenter.toString() !== userId.toString())
            return res.status(403).json({ message: "삭제 권한이 없습니다." });

        comment.isDeleted = true;

        await comment.save();

        res.status(200).json({ message: "댓글이 삭제되었습니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
