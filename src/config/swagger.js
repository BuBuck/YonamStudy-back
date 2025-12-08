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
    components: {
        schemas: {
            User: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    major: { type: "string" },
                    phoneNumber: { type: "string" },
                    birthdate: { type: "string", format: "date" },
                    email: { type: "string", format: "email" },
                    studentId: { type: "string" },
                    password: { type: "string" },
                    isVerified: { type: "boolean" },
                    online: { type: "boolean" },
                    userProfile: { type: "string" },
                    group: { type: "array", items: { type: "string" } },
                },
            },
            Group: {
                type: "object",
                properties: {
                    groupName: { type: "string" },
                    description: { type: "string" },
                    groupImage: { type: "string" },
                    schedule: { type: "string" },
                    location: { type: "string" },
                    duration: { type: "string" },
                    difficulty: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    maxMembers: { type: "number" },
                    groupLeader: { type: "string" },
                    groupMembers: { type: "array", items: { type: "string" } },
                    questions: { type: "array", items: { type: "string" } },
                },
            },
            Comment: {
                type: "object",
                properties: {
                    content: { type: "string" },
                    commenter: { type: "string" },
                    group: { type: "string" },
                    isDeleted: { type: "boolean" },
                },
            },
            Message: {
                type: "object",
                properties: {
                    sender: { type: "string" },
                    group: { type: "string" },
                    message: { type: "string" },
                    readBy: { type: "array", items: { type: "string" } },
                },
            },
        },
    },
};

const options = {
    swaggerDefinition,
    apis: ["src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
