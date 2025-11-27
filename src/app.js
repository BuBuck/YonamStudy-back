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

module.exports = app;
