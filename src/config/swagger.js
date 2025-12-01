require("dotenv").config();
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "교내 스터디 그룹 매칭 시스템 API",
        version: "1.0.0",
        description: "연암공과대학교 스터디 그룹 매칭 플랫폼 API",
    },
    servers: [
        {
            url: process.env.DEPLOY_URL,
            description: "배포 서버",
        },
        {
            url: "http://localhost:5001",
            description: "로컬 서버",
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ["src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
