const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        // 프론트엔드에서 보내주는 타입과 맞춰야 합니다 (text, radio 등)
        enum: ["text", "textarea", "select", "radio", "checkbox"],
        required: true,
    },
    question: { type: String, required: true }, // 예: "지원 동기가 뭔가요?"
    description: { type: String }, // 예: "300자 내외로 써주세요"
    required: { type: Boolean, default: true }, // 필수 답변 여부
    options: [String], // 객관식일 때 선택지들 (주관식이면 빈 배열)
});

const groupSchema = new mongoose.Schema(
    {
        group: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        groupImage: { type: String, default: "/uploads/users/default-userProfile.png" },
        groupLeader: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        groupMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        maxMembers: {
            type: Number,
            required: true,
        },

        questions: [questionSchema],

        schedule: {
            weeks: [String],
            time: {
                type: String,
                required: true,
            },
        },
        location: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            required: true,
        },

        tags: [String],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
