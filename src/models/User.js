const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
        default: false,
    },
    // 코드 만료 시간 (예: 3분)
    emailVerificationCodeExpiress: {
        type: Date,
        required: false,
    },

    // 6. 비밀번호 재설정 관련 필드
    passwordResetToken: String,
    passwordResetExpiress: Date,

    // 7. 웹소켓 관련
    // 웹소켓 토큰 (socket.id)
    token: {
        type: String,
    },
    // 유저 온라인 상태
    online: {
        type: Boolean,
        dafault: false,
    },

    // 계정 생성 날짜 / 계정 업데이트 날짜
    createAt: Date,
    updateAt: Date,
});

module.exports = mongoose.model("User", userSchema);
