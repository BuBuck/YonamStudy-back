require("dotenv").config();
require("./config/database");

const { createServer } = require("http");
const app = require("./app");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const socket = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
    },
});

require("./utils/socket.js")(socket);

httpServer.listen(process.env.PORT, () => {
    console.log(`${process.env.PORT}포트에서 서버가 실행되었습니다.`);
});
