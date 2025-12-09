# YonamStudy-back (연암 스터디 백엔드)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

본 프로젝트는 1학년 2학기 JavaScript 기말고사 대체 팀 프로젝트 입니다.
스터디 그룹 매칭 및 관리 플랫폼 '연암 스터디'의 백엔드 서버입니다.
Node.js와 Express 프레임워크를 기반으로 구축되었으며, MongoDB를 데이터베이스로 사용합니다.

## ✨ 주요 기능

*   **사용자 관리**: 회원가입, 로그인, 프로필 관리, 소셜 로그인 (JWT 기반 인증)
*   **스터디 그룹**: 스터디 그룹 생성, 검색, 가입, 관리
*   **실시간 채팅**: `socket.io`를 이용한 스터디 그룹별 실시간 채팅 기능
*   **댓글**: 스터디 그룹에 대한 댓글 작성 및 조회
*   **이메일 인증**: `nodemailer`를 이용한 회원가입 시 이메일 인증 및 비밀번호 재설정
*   **파일 업로드**: 사용자 프로필 이미지 및 스터디 그룹 대표 이미지 업로드
*   **API 문서**: `Swagger`를 이용한 API 명세 자동화

## 🛠️ 기술 스택

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB with Mongoose
*   **Real-time Communication**: Socket.IO
*   **Authentication**: JSON Web Token (JWT)
*   **Email**: Nodemailer, EJS
*   **API Documentation**: Swagger
*   **Others**: bcrypt, cors, dotenv, express-fileupload

## 📖 API 문서

서버 실행 후, 아래 URL을 통해 API 문서를 확인할 수 있습니다.

`http://localhost:5000/api-docs`

## 🚀 시작하기

### 사전 요구 사항

*   Node.js (v18.x 이상 권장)
*   npm
*   MongoDB

### 설치 및 실행

1.  **레포지토리 클론**
    ```bash
    git clone https://github.com/BuBuck/YonamStudy-back.git
    cd YonamStudy-back
    ```

2.  **npm 패키지 설치**
    ```bash
    npm install
    ```

3.  **환경 변수 설정**
    프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 아래 내용을 참고하여 환경 변수를 설정합니다.

    ```env
    # 서버 포트
    PORT=5000

    # MongoDB 연결 URI
    MONGODB_URI=mongodb://localhost:27017

    # JWT 비밀키
    JWT_SECRET=your_jwt_secret

    # Nodemailer 설정 (Gmail 예시)
    EMAIL_SERVICE=gmail
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    ```

4.  **개발 서버 실행**
    ```bash
    npm start
    ```
    서버는 `nodemon`에 의해 실행되며, 코드 변경 시 자동으로 재시작됩니다.

## 📁 프로젝트 구조

```
YonamStudy-back/
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── src/
    ├── app.js                          # Express 애플리케이션 설정 및 미들웨어 정의
    ├── server.js                       # 애플리케이션 서버 시작점 (HTTP 서버)
    ├── socket.js                       # Socket.IO 관련 설정 및 이벤트 핸들링
    ├── assets/                         # 정적 자원 (이메일 템플릿, 기본 이미지 등)
    │   ├── default-groupImage.png
    │   ├── default-userProfile.png
    │   └── mail/
    │       ├── reset-password-mail.ejs # 비밀번호 재설정 이메일 템플릿
    │       └── verification-code-mail.ejs # 이메일 인증 코드 이메일 템플릿
    ├── config/                         # 애플리케이션 설정 파일
    │   ├── database.js                 # MongoDB 연결 및 설정
    │   ├── mailer.js                   # Nodemailer를 이용한 메일 전송 설정
    │   └── swagger.js                  # Swagger API 문서 정의
    ├── controllers/                    # 클라이언트 요청 처리 및 응답 로직
    │   ├── comment.controller.js       # 댓글 관련 비즈니스 로직
    │   ├── group.controller.js         # 스터디 그룹 관련 비즈니스 로직
    │   ├── message.controller.js       # 메시지 관련 비즈니스 로직
    │   └── user.controller.js          # 사용자 관련 비즈니스 로직
    ├── models/                         # MongoDB 데이터 모델 정의 (Mongoose 스키마)
    │   ├── Application.js              # 그룹 가입 신청 모델
    │   ├── Comment.js                  # 댓글 모델
    │   ├── EmailVerification.js        # 이메일 인증 모델
    │   ├── Group.js                    # 스터디 그룹 모델
    │   ├── Message.js                  # 메시지 모델
    │   └── User.js                     # 사용자 모델
    ├── routes/                         # API 엔드포인트 및 라우팅 정의
    │   ├── auth.route.js               # 인증 (회원가입, 로그인 등) 라우트
    │   ├── comment.route.js            # 댓글 관련 라우트
    │   ├── group.route.js              # 스터디 그룹 관련 라우트
    │   ├── message.route.js            # 메시지 관련 라우트
    │   └── user.route.js               # 사용자 관련 라우트
    ├── uploads/                        # 사용자가 업로드한 파일 저장소
    │   ├── study-groups/               # 스터디 그룹 관련 업로드 파일
    │   └── users/                      # 사용자 관련 업로드 파일
    └── utils/                          # 공통 유틸리티 함수
        └── initStorage.js              # 초기 스토리지 디렉토리 생성 유틸리티
```