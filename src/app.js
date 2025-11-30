const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const initStorage = require("./utils/initStorage");

app.use(cors());

app.use(
    fileUpload({
        createParentPath: true,
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const specs = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const userRoute = require("./routes/user.route");
app.use("/api/user", userRoute);

const authRoute = require("./routes/auth.route");
app.use("/api/auth", authRoute);

const messageRoute = require("./routes/message.route");
app.use("/api/study-groups", messageRoute);

const commentRoute = require("./routes/comment.route");
app.use("/api/study-groups", commentRoute);

const groupRoute = require("./routes/group.route");
app.use("/api/study-groups", groupRoute);

initStorage();

module.exports = app;
