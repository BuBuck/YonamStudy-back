# 교내 스터디 그룹 매칭 시스템 - Backend

# 📌 프로젝트 개요

-   **프로젝트명**: 교내 스터디 그룹 매칭 시스템
-   **버전**: v1.0
-   **기술 스택**:
    -   Frontend: React
    -   Backend: Node.js
    -   Database: MongoDB (Mongoose)

- 파일 구조(Backend)
YonamStudy-back/ # .gitignore 파일에 등록되어있음
├── node_modules/
├── src/
│   ├── assets/
│   │   ├── mail/
│   │   │   ├── reset-password-mail.ejs
│   │   │   └── verification-code-mail.ejs
│   │   │
│   │   ├── default-groupImage.png
│   │   └── default-userProfile.png
│   │
│   ├── config/
│   │   ├── database.js
│   │   ├── mailer.js
│   │   └── swagger.js
│   │
│   ├── controllers/
│   │   ├── comment.controller.js
│   │   ├── group.controller.js
│   │   ├── message.controller.js
│   │   └── user.controller.js
│   │
│   ├── models/
│   │   ├── Application.js
│   │   ├── Comment.js
│   │   ├── EmailVerification.js
│   │   ├── Group.js
│   │   ├── Message.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── auth.route.js
│   │   ├── comment.route.js
│   │   ├── group.route.js
│   │   ├── message.route.js
│   │   └── user.route.js
│   │
│   ├── uploads/ # .gitignore 파일에 등록되어있음
│   │   ├── study-groups/
│   │   │   └── default-groupImage.png  # 기본 스터디 그룹 이미지
│   │   │
│   │   └── users/
│   │       └── default-userProfile.png # 기본 유저 프로필
│   │
│   ├── app.js
│   ├── server.js
│   └── socket.js
│
├── .env
├── .gitignore
├── package.json
└── package-lock.json
