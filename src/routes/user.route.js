const express = require("express");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const Group = require("../models/Group");

const userController = require("../controllers/user.controller");

const router = express.Router();

router.put("/update-userProfile", async (req, res) => {
    try {
        const { userId, image } = req.body;

        const oldUser = await User.findById(userId);
        if (!oldUser) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

        const defaultProfilePath = `/uploads/users/default-userProfile.png`;
        let dbPath = oldUser.userProfile;

        if (image === "DELETE") {
            if (oldUser.userProfile && oldUser.userProfile !== defaultProfilePath) {
                const oldFilePath = path.join(__dirname, "..", oldUser.userProfile);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlink(oldFilePath, (error) => {
                        if (error) console.error("기존 파일 삭제 실패:", error);
                        else console.log("기존 파일 삭제 성공 (초기화)");
                    });
                }
            }

            dbPath = defaultProfilePath;
        } else if (req.files && req.files.image) {
            const userProfile = req.files.image;
            const extension = path.extname(userProfile.name);
            const fileName = `${userId.toString()}${extension}`;
            const newUploadPath = path.join(__dirname, "../uploads/users", fileName);

            if (
                oldUser.userProfile &&
                oldUser.userProfile !== `/uploads/users/default-userProfile.png`
            ) {
                const oldFilePath = path.join(__dirname, "..", oldUser.userProfile);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlink(oldFilePath, (error) => {
                        if (error) console.error("기존 파일 삭제 실패:", error);
                    });
                }
            }

            await userProfile.mv(newUploadPath);
            dbPath = `/uploads/users/${fileName}`;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { userProfile: dbPath },
            { new: true }
        );

        const groups = await Group.find({ _id: { $in: updatedUser.group } });

        const responseUser = {
            userId: updatedUser._id,
            studentId: updatedUser.studentId,
            name: updatedUser.name,
            major: updatedUser.major,
            phoneNumber: updatedUser.phoneNumber,
            online: updatedUser.online,
            userProfile: updatedUser.userProfile,
            group: groups,
        };

        res.status(200).json({
            user: responseUser,
            message: "프로필 이미지가 변경되었습니다.",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, phoneNumber } = req.body;

        const formattedPhoneNumber = await userController.formatPhoneNumber(phoneNumber);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, phoneNumber: formattedPhoneNumber },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });

        const groups = await Group.find({ _id: { $in: updatedUser.group } });

        const responseUser = {
            userId: updatedUser._id,
            studentId: updatedUser.studentId,
            name: updatedUser.name,
            major: updatedUser.major,
            phoneNumber: updatedUser.phoneNumber,
            online: updatedUser.online,
            userProfile: updatedUser.userProfile,
            group: groups,
        };

        res.status(200).json({
            user: responseUser,
            message: "회원 정보가 수정되었습니다.",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
