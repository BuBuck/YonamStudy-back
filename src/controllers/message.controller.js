const Message = require("../models/Message");

const messageController = {};

messageController.saveMessage = async (receivedMessage, userId, groupId) => {
    const newMessage = new Message({
        group: groupId,
        sender: userId,
        message: receivedMessage,
        readBy: [userId],
    });

    await newMessage.save();

    return newMessage;
};

module.exports = messageController;
