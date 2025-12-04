const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        // 1. 개인정보 필드
        // 사용자 이름
        name: {
            type: String,
            required: true,
        },
        // 학과
        major: {
            type: String,
            required: true,
            enum: [
                "전기전자공학과",
                "스마트전기전자공학과",
                "기계공학과학과",
                "스마트기계공학과",
                "스마트소프트웨어학과",
            ],
        },
        // 휴대폰 번호
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            match: [
                /^010-?[0-9]{4}-?[0-9]{4}$/,
                "유효한 휴대폰 번호(예: 010-1234-5678) 형식이 아닙니다.",
            ],
        },
        // 생년월일
        birthdate: {
            type: Date,
            required: true,
        },

        // 2. 이메일 (학교 인증 및, 학번 추출용)
        email: {
            type: String,
            required: true,
            unique: true,
            // 정확히 @st.yc.ac.kr 도메인만 허용
            match: [
                /^[0-9]{8}@st\.yc\.ac\.kr$/,
                "유효한 학교 이메일(@st.yc.ac.kr) 형식이 아닙니다.",
            ],
        },

        // 3. 학번 (로그인 ID)
        studentId: {
            type: String,
            required: true,
            unique: true,
            minlength: 8,
            maxlength: 8,
        },

        // 4. 비밀번호
        password: {
            type: String,
            required: true,
        },

        // 5. 인증 관련 필드
        isVerified: {
            type: Boolean,
            default: false,
        },
        // 6자리 코드 저장
        emailVerificationCode: {
            type: String,
        },

        // 6. 비밀번호 재설정 관련 필드
        passwordResetToken: String,
        passwordResetExpires: Date,

        // 7. 웹소켓 유저 온라인 상태
        online: {
            type: Boolean,
            default: false,
        },

        // 8. 프로필 사진
        userProfile: {
            type: String,
            default: "/uploads/users/default-userProfile.png",
        },

        // 9. 스터디그룹 관련
        group: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Group",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
