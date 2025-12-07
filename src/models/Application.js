const mongoose = require("mongoose");
const { Schema } = mongoose;

const applicationSchema = new Schema(
    {
        // 어느 스터디에 지원했는지
        group: {
            type: Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },

        // 누가 지원했는지
        applicant: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // 답변 목록 (Array 구조 추천)
        answers: [
            {
                questionId: { type: Schema.Types.ObjectId, required: true }, // 질문의 _id
                answer: { type: String, required: true }, // 사용자의 답변
            },
        ],

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"], // 대기, 승인, 거절
            default: "pending",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
