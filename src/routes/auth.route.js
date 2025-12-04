const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const ejs = require("ejs");

const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");

const transporter = require("../config/mailer");
const Group = require("../models/Group");

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/sign-up:
 *   post:
 *     summary: 회원가입 API
 *     description: 코드 전송 / 검증이 완료된 후, 인증된 이메일과 나머지 사용자 정보(이름, 학과, 비밀번호 등)를 받아 최종적으로 사용자를 생성(회원가입)합니다.
 *     tags: [Auth]
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 회원가입에 필요한 전체 사용자 정보
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - name
 *             - major
 *             - phoneNumber
 *             - birthdate
 *             - email
 *             - password
 *           properties:
 *             name:
 *               type: string
 *               description: 사용자 이름
 *               example: 김연암
 *             major:
 *               type: string
 *               description: 학과 (User 스키마의 enum 값 중 하나)
 *               example: 스마트소프트웨어학과
 *             phoneNumber:
 *               type: string
 *               description: 휴대폰 번호
 *               example: 010-1234-5678
 *             birthdate:
 *               type: string
 *               format: date
 *               description: 생년월일
 *               example: 2006-01-01
 *             email:
 *               type: string
 *               format: email
 *               description: 인증 완료된 학교 이메일
 *               example: 22560001@st.yc.ac.kr
 *             password:
 *               type: string
 *               format: password
 *               description: 비밀번호 (8자 이상)
 *               example: password123!
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: 22560001@st.yc.ac.kr
 *             message:
 *               type: string
 *               example: 회원가입이 성공적으로 완료되었습니다. 로그인해주세요.
 *       400:
 *         description: 유효성 검사 실패
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 이미 가입된 이메일 또는 학번입니다.
 *       500:
 *         description: 서버 내부 오류
 */
router.post("/sign-up", async (req, res) => {
    try {
        const { name, major, phoneNumber, birthdate, email, password } = req.body;

        // 이메일 형식 및 학번 추출
        const emailRegex = /^([0-9]{8})@st\.yc\.ac\.kr$/;
        const match = email.match(emailRegex);

        if (!match) {
            return res.status(400).json({
                message: "유효한 학교 이메일(@st.yc.ac.kr) 형식이 아닙니다.",
            });
        }

        const studentId = match[1]; // 정규식 1번 그룹 (학번)

        // 이메일 또는 학번 중복 확인
        let user = await User.findOne({ $or: [{ email }, { studentId }] });
        if (user) {
            return res.status(400).json({ message: "이미 가입된 이메일 또는 학번입니다." });
        }

        // 비밀번호 길이 확인
        if (password.length < 8) {
            return res.status(400).json({ message: "비밀번호는 최소 8자 이상이어야 합니다." });
        }

        // 최종 가입 전, 이메일 인증이 되었는지 확인
        const verificationRecord = await EmailVerification.findOne({ email });

        if (!verificationRecord) {
            return res.status(400).json({ message: "이메일 인증이 필요합니다." });
        }
        if (!verificationRecord.isVerified) {
            return res.status(400).json({
                message: "이메일 인증이 완료되지 않았습니다. 코드를 확인해주세요.",
            });
        }

        // 비밀번호 해싱
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 6자리 영어 대문자 + 숫자 인증 코드 생성
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let verificationCode = "";
        for (let i = 0; i < 6; i++) {
            verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        let formattedPhoneNumber = phoneNumber;
        // 전화번호에 하이픈이 없는 경우 하이픈 추가
        if (!phoneNumber.match(/^\d{3}-\d{4}-\d{4}$/)) {
            formattedPhoneNumber = phoneNumber.replace(
                /^(\d{3})[-\s]?(\d{4})[-\s]?(\d{4})$/,
                "$1-$2-$3"
            );
        }

        // 새로운 사용자 생성 (모든 필드 포함)
        user = new User({
            name,
            major,
            phoneNumber: formattedPhoneNumber,
            birthdate,
            email,
            studentId,
            password: hashedPassword,
            isVerified: true,
            online: false,
            userProfile: user.userProfile,
            group: [],
        });

        await user.save();

        // 임시 인증 데이터 삭제
        await EmailVerification.deleteOne({ email });

        res.status(201).json({
            email: user.email,
            message: "회원가입이 성공적으로 완료되었습니다. 로그인해주세요.",
        });
    } catch (error) {
        // Mongoose Validation Error (모델 정의에 맞지 않을 때)
        if (error.name == "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @swagger
 * /api/v1/auth/verify-code:
 *   post:
 *     summary: 이메일 인증 코드 검증 API
 *     description: 사용자가 입력한 6자리 인증 코드가 이메일로 발송된 코드와 일치하는지 확인합니다.
 *     tags: [Auth]
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 이메일과 인증 코드
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - code
 *           properties:
 *             email:
 *               type: string
 *               description: 학교 이메일
 *               example: 22560001@st.yc.ac.kr
 *             code:
 *               type: string
 *               description: 이메일로 받은 6자리 인증 코드
 *               example: A7C9FD
 *     responses:
 *       200:
 *         description: 인증 성공
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 이메일 인증이 성공적으로 완료되었습니다. 나머지 정보를 입력해주세요.
 *             isVerified:
 *               type: boolean
 *               example: true
 *       400:
 *         description: 인증 실패 (코드 불일치, 만료됨, 정보 없음 등)
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 인증 코드가 올바르지 않습니다.
 *       500:
 *         description: 서버 에러
 */
router.post("/verify-code", async (req, res) => {
    try {
        // 프론트에서 '이메일'과 '인증 코드'를 받음
        const { email, code } = req.body;

        // 사용자 찾기
        const verification = await EmailVerification.findOne({ email });
        if (!verification) {
            return res.status(400).json({ message: "존재하지 않는 이메일입니다." });
        }

        // 이미 인증되어있는지 확인
        if (verification.isVerified) {
            return res.status(400).json({ message: "이미 인증된 사용자입니다." });
        }

        // 인증 코드 일치 여부 확인
        if (verification.code !== code) {
            return res.status(400).json({ message: "인증 코드가 올바르지 않습니다." });
        }

        // 인증 성공 처리
        verification.isVerified = true;

        await verification.save();

        res.json({
            message: "이메일 인증이 성공적으로 완료되었습니다. 나머지 정보를 입력해주세요.",
            isVerified: true,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @swagger
 * /api/v1/auth/resend-code:
 *   post:
 *     summary: 인증 코드 전송 API
 *     description: 회원가입을 위해 학교 이메일로 6자리 인증 코드를 전송합니다. 이미 가입된 이메일이나 학번인 경우 전송되지 않습니다.
 *     tags: [Auth]
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 인증 코드를 받을 학교 이메일
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: 학교 이메일 (@st.yc.ac.kr)
 *               example: 22560001@st.yc.ac.kr
 *     responses:
 *       200:
 *         description: 코드 전송 성공
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 인증 코드를 발송했습니다. 이메일을 확인해주세요.
 *       400:
 *         description: 실패 (이메일 형식 오류 또는 이미 가입된 사용자)
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 이미 가입된 이메일 또는 학번입니다.
 *       500:
 *         description: 서버 내부 오류 (메일 발송 실패 등)
 */
router.post("/send-verification", async (req, res) => {
    try {
        const { email } = req.body;

        const emailRegex = /^([0-9]{8})@st\.yc\.ac\.kr$/;
        const match = email.match(emailRegex);
        if (!match) {
            return res.status(400).json({
                message: "유효한 학교 이메일(@st.yc.ac.kr) 형식이 아닙니다.",
            });
        }
        const studentId = match[1];

        const user = await User.findOne({ $or: [{ email }, { studentId }] });

        if (user) {
            return res.status(400).json({ message: "이미 가입된 이메일 또는 학번입니다." });
        }

        // 새 코드 생성
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let verificationCode = "";
        for (let i = 0; i < 6; i++) {
            verificationCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        await EmailVerification.findOneAndUpdate(
            { email },
            {
                email,
                code: verificationCode,
                isVerified: false,
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        const emailTemplate = await ejs.renderFile(
            path.join(__dirname, "../assets/mail/verification-code-mail.ejs"),
            {
                verificationCode: verificationCode,
            }
        );

        await transporter.sendMail({
            to: email,
            subject: "스터디 그룹 매칭 시스템 인증 코드",
            html: emailTemplate,
        });

        res.json({ message: "인증 코드를 재발송했습니다. 이메일을 확인해주세요." });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: 로그인 API
 *     description: 학번과 비밀번호를 이용해 로그인하고, JWT 토큰과 사용자 정보를 반환합니다. (이메일 인증이 완료된 상태여야 합니다.)
 *     tags: [Auth]
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 로그인 요청 정보
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - studentId
 *             - password
 *           properties:
 *             studentId:
 *               type: string
 *               description: 학번 (로그인 ID)
 *               example: 22560001
 *             password:
 *               type: string
 *               description: 비밀번호
 *               example: password123!
 *     responses:
 *       200:
 *         description: 로그인 성공 (토큰 발급)
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT 인증 토큰
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             user:
 *               type: object
 *               description: 로그인한 사용자 정보
 *               properties:
 *                 studentId:
 *                   type: string
 *                   example: 22560001
 *                 name:
 *                   type: string
 *                   example: 김연암
 *                 major:
 *                   type: string
 *                   example: 스마트소프트웨어학과
 *       400:
 *         description: 로그인 실패 (학번 없음 또는 비밀번호 불일치)
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 비밀번호가 일치하지 않습니다.
 *       401:
 *         description: 이메일 미인증 사용자
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 이메일 인증이 필요합니다.
 *       500:
 *         description: 서버 내부 오류
 */
router.post("/login", async (req, res) => {
    try {
        // 이메일 대신 '학번' 과 '비밀번호'를 받음
        const { studentId, password } = req.body;

        // 학번으로 사용자 검색
        const user = await User.findOne({ studentId });
        if (!user) {
            return res.status(400).json({ message: "존재하지 않는 학번입니다." });
        }

        // 비밀번호 확인
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
        }

        // 이메일 인증 여부 확인
        if (!user.isVerified) {
            return res.status(401).json({ message: "이메일 인증이 필요합니다." });
        }

        const groups = await Group.find({ _id: user.group.map((g) => g) });

        // JWT 생성
        const payload = {
            user: {
                id: user.id,
                studentId: user.studentId,
                name: user.name,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
            if (err) throw err;

            const expiresInMs = 60 * 60 * 1000;
            const expirationTime = new Date().getTime() + expiresInMs;

            res.json({
                expiresToken: token,
                expiresAt: expirationTime,
                user: {
                    userId: user._id,
                    studentId: user.studentId,
                    name: user.name,
                    major: user.major,
                    phoneNumber: user.phoneNumber,
                    online: user.online,
                    userProfile: user.userProfile,
                    group: groups,
                },
            });
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

/**
 * @swagger
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: 비밀번호 재설정 요청 API
 *     description: 가입한 학교 이메일을 입력하면, 비밀번호를 재설정할 수 있는 링크(토큰 포함)를 이메일로 전송합니다.
 *     tags: [Auth]
 *     parameters:
 *       - in: body
 *         name: body
 *         description: 비밀번호를 찾을 계정의 이메일
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               description: 학교 이메일
 *               example: 22560001@st.yc.ac.kr
 *     responses:
 *       200:
 *         description: 이메일 전송 성공 (보안을 위해 가입되지 않은 이메일이라도 성공 메시지를 반환합니다)
 *         schema:
 *           type: object
 *         properties:
 *           message:
 *             type: string
 *             example: 비밀번호 재설정 이메일을 발송했습니다.
 *       500:
 *         description: 서버 내부 오류
 */
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "등록된 이메일을 찾을 수 없습니다." });
        }

        // 재설정 토큰 생성 (10분)
        const resetToken = crypto.randomBytes(20).toString("hex");
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 600000;
        await user.save();

        // 재성정 링크 (프론트 라이트)
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

        const emailTemplate = await ejs.renderFile(
            path.join(__dirname, "../assets/mail/reset-password-mail.ejs"),
            {
                resetUrl: resetUrl,
            }
        );

        await transporter.sendMail({
            to: user.email,
            subject: "비밀번호 재설정 요청",
            html: emailTemplate,
        });

        res.status(200).json({ message: "비밀번호 재설정 이메일을 발송했습니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

router.get("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "유효하지 않거나 만료된 토큰입니다." });
        }

        res.status(200).json({ success: true, message: "유효한 토큰입니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: 비밀번호 재설정 API
 *     description: 이메일 링크를 통해 전달받은 토큰과 새로운 비밀번호를 사용하여 비밀번호를 변경합니다.
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *           required: true
 *           description: 이메일 링크에 포함된 비밀번호 재설정 토큰
 *           example: 8f4b2... (토큰 문자열)
 *       - in: body
 *         name: body
 *         description: 변경할 새로운 비밀번호
 *         required: true
 *         schema:
 *           type: object
 *           required:
 *             - newPassword
 *           properties:
 *             newPassword:
 *               type: string
 *               format: password
 *               description: 새 비밀번호 (8자 이상)
 *               example: newPassword123!
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 비밀번호가 성공적으로 재설정되었습니다.
 *       400:
 *         description: 토큰 검증 실패 (만료되었거나 유효하지 않음)
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 유효하지 않거나 만료된 토큰입니다.
 *       500:
 *         description: 서버 내부 오류
 */
router.post("/reset-password", async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.status(200).json({ message: "비밀번호가 변경되었습니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
