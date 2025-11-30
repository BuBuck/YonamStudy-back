const express = require("express");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.post("/upload-userImage", userController.uploadImage);

module.exports = router;
