const express = require("express");

const Comment = require("../models/Comment");

const commentController = require("../controllers/comment.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: 댓글 관련 API
 */

/**
 * @swagger
 * /api/study-groups/{groupId}/comments:
 *   get:
 *     summary: 특정 스터디 그룹의 모든 댓글 조회
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: 댓글을 조회할 스터디 그룹의 ID
 *     responses:
 *       200:
 *         description: 댓글 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 message:
 *                   type: string
 *       400:
 *         description: 댓글 없음
 *       500:
 *         description: 서버 오류
 */
router.get("/:groupId/comments", async (req, res) => {
    try {
        const { groupId } = req.params;

        const comments = await Comment.find({ group: groupId })
            .populate([
                {
                    path: "commenter",
                    select: "name major userProfile",
                },
                {
                    path: "group",
                    select: "groupLeader",
                },
            ])
            .sort({ createdAt: -1 });

        if (!comments) return res.status(400).json({ message: "댓글 없음" });

        res.status(200).json({ comments, message: "댓글들이 정상적으로 불러와졌습니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @swagger
 * /api/study-groups/{groupId}/comments:
 *   post:
 *     summary: 특정 스터디 그룹에 댓글 작성
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: 댓글을 작성할 스터디 그룹의 ID
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             userId:
 *               type: string
 *         description: 댓글 내용과 작성자 ID
 *     responses:
 *       201:
 *         description: 댓글 작성 성공
 *       401:
 *         description: 로그인이 필요합니다.
 *       500:
 *         description: 서버 오류
 */
router.post("/:groupId/comments", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { content, userId } = req.body;

        if (!userId) return res.status(401).json({ message: "로그인이 필요합니다." });

        const newComment = await commentController.saveComment(groupId, userId, content);

        await newComment.populate([
            {
                path: "commenter",
                select: "name major userProfile",
            },
            {
                path: "group",
                select: "groupLeader",
            },
        ]);

        res.status(201).json({ newComment, message: "댓글이 정상적으로 작성되었습니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @swagger
 * /api/study-groups/{groupId}/comments/{commentId}:
 *   put:
 *     summary: 특정 댓글 수정
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: 스터디 그룹의 ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 수정할 댓글의 ID
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *             userId:
 *               type: string
 *         description: 수정할 댓글 내용과 사용자 ID
 *     responses:
 *       200:
 *         description: 댓글 수정 성공
 *       403:
 *         description: 수정 권한 없음
 *       404:
 *         description: 댓글 또는 그룹 없음
 *       500:
 *         description: 서버 오류
 */
router.put("/:groupId/comments/:commentId", async (req, res) => {
    try {
        const { groupId, commentId } = req.params;
        const { content, userId } = req.body;

        const comment = await Comment.findById(commentId);

        if (comment.group.toString() !== groupId) {
            return res.status(404).json({ message: "존재하지 않은 스터디 그룹입니다." });
        }

        if (!comment) return res.status(404).json({ message: "댓글이 없습니다." });

        if (comment.commenter.toString() !== userId.toString())
            return res.status(403).json({ message: "수정 권한이 없습니다." });

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            {
                content: content,
            },
            { new: true }
        );

        await updatedComment.populate([
            {
                path: "commenter",
                select: "name major userProfile",
            },
            {
                path: "group",
                select: "groupLeader",
            },
        ]);

        res.status(200).json({ updatedComment, message: "댓글이 수정되었습니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @swagger
 * /api/study-groups/{groupId}/comments/{commentId}:
 *   delete:
 *     summary: 특정 댓글 삭제
 *     tags: [Comment]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: 스터디 그룹의 ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 댓글의 ID
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 댓글 삭제 성공
 *       403:
 *         description: 삭제 권한 없음
 *       404:
 *         description: 댓글 또는 그룹 없음
 *       500:
 *         description: 서버 오류
 */
router.delete("/:groupId/comments/:commentId", async (req, res) => {
    try {
        const { groupId, commentId } = req.params;
        const { userId } = req.body;

        const comment = await Comment.findById(commentId).populate("group", "groupLeader");

        if (!comment)
            return res.status(404).json({ message: "이미 삭제되었거나 없는 댓글입니다." });

        if (comment.group._id.toString() !== groupId) {
            return res.status(404).json({ message: "존재하지 않은 스터디 그룹입니다." });
        }

        console.log(comment.group.groupLeader.toString() !== userId);

        if (
            comment.group.groupLeader.toString() !== userId &&
            comment.commenter.toString() !== userId
        ) {
            return res.status(403).json({ message: "삭제 권한이 없습니다." });
        }

        const deletedComment = await Comment.findByIdAndUpdate(
            commentId,
            { isDeleted: true },
            { new: true }
        );

        res.status(200).json({ deletedComment, message: "댓글이 삭제되었습니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
