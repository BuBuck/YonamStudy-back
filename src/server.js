require("dotenv").config();
require("./config/database");
const { createServer } = require("http");

const app = require("./app");

const httpServer = createServer(app);

httpServer.listen(process.env.PORT, () => {
    console.log(`${process.env.PORT}포트에서 서버가 실행되었습니다.`);
});
