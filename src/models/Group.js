const mongoose = require("mongoose");
const Hangul = require("hangul-js");

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
        groupImage: {
            type: String,
            default: "/uploads/study-groups/default-groupImage.png",
        },
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
        searchMeta: {
            type: String,
            select: false,
        },
    },
    { timestamps: true }
);

groupSchema.pre("save", function (next) {
    // 제목과 태그를 합쳐서 검색용 문자열을 만듦
    const rawString = `${this.title} ${this.tags.join(" ")}`;

    // 한글을 자모로 분해해서 searchMeta에 저장
    // 예: "JavaScript 스터디" -> "JavaScript ㅅㅡㅌㅓㄷㅣ"
    this.searchMeta = Hangul.disassembleToString(rawString);

    next();
});

module.exports = mongoose.model("Group", groupSchema);
