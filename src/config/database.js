require("dotenv").config();
const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGO_URI, {
        dbName: "YonamStudy",
    })
    .then(() => {
        console.log("데이터베이스(MongoDB)가 연결되었습니다.");
    })
    .catch((err) => {
        console.error(err);
    });
