const Comment = require("../models/Comment");

const commentController = {};

commentController.saveComment = async (groupId, userId, content) => {
    const newComment = new Comment({
        group: groupId,
        commenter: userId,
        content: content,
    });

    await newComment.save();

    return newComment;
};

module.exports = commentController;
