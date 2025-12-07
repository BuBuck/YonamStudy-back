const messageController = require("./controllers/message.controller");
const groupController = require("./controllers/group.controller");

module.exports = function (io) {
    io.on("connection", async (socket) => {
        console.log("client is connected");

        socket.on("groups", async () => {
            socket.emit("groups", await groupController.getAllGroups());
        });

        socket.on("joinGroup", async (groupId, cb) => {
            try {
                socket.join(groupId);

                // 나중에 그룹에 초대되었을 떄 메시지
                // const welcomeMessage = {
                //     chat: `${user.name}님이 ${user.group.toString()}에 가입하셨습니다.`,
                //     user: { id: null, name: "server" },
                // };

                // socket.to(user.group.toString()).emit("message", welcomeMessage);

                if (cb) cb({ ok: true });
            } catch (error) {
                console.error("joinGroup error:", error);
                if (cb) cb({ ok: false, error: error.message });
            }
        });

        socket.on("joinGroups", (groupIds, cb) => {
            try {
                if (Array.isArray(groupIds)) {
                    groupIds.forEach((groupId) => {
                        socket.join(groupId);
                    });
                }

                if (cb) cb({ ok: true });
            } catch (error) {
                console.error("joinGroups error:", error);
                if (cb) cb({ ok: false, error: error.message });
            }
        });

        socket.on("sendMessage", async (receivedMessage, userId, groupId) => {
            try {
                const newMessage = await messageController.saveMessage(
                    receivedMessage,
                    userId,
                    groupId
                );

                await newMessage.populate("sender", "name");

                io.to(groupId).emit("receivedMessage", newMessage);
            } catch (error) {
                console.error(error);
            }
        });

        socket.on("leaveGroup", async (groupId, cb) => {
            socket.leave(groupId);
        });

        socket.on("disconnect", () => {
            console.log("client is disconnected");
        });
    });
};
