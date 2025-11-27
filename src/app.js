const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const specs = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const authRoute = require("./routes/auth.route");
app.use("/api/auth", authRoute);

const chatRoute = require("./routes/chat.route");
app.use("/api/chat", chatRoute);

// const Group = require("./models/Group");
// const User = require("./models/User");
// app.get("/pGroup", async (req, res) => {
//     const user = await User.findOne({ name: "선정인" });
//     const myGroup = await Group.findOne({ group: "JavaScript 스터디" });
//     user.group.pop();
//     user.group.push(myGroup);
//     await user.save();
//     console.log(user);
// });

// app.get("/cGroup", async (req, res) => {
//     Group.insertMany([
//         {
//             group: "JavaScript 스터디",
//             groupMembers: [],
//         },
//         {
//             group: "React 스터디",
//             groupMembers: [],
//         },
//         {
//             group: "Node.js 스터디",
//             groupMembers: [],
//         },
//     ])
//         .then(() => res.send("ok"))
//         .catch((error) => res.send(error));
// });

module.exports = app;
