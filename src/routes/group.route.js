const express = require("express");
const path = require("path");
const fs = require("fs");

const Group = require("../models/Group");

const groupController = require("../controllers/group.controller");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.post("/upload-groupImage", async (req, res) => {
    try {
        const { groupId } = req.body;

        let dbPath = `/uploads/study-groups/default-groupImage.png`;

        if (req.files && req.files.image) {
            const groupImage = req.files.image;
            const extension = path.extname(groupImage.name);
            const fileName = `${groupId.toString()}${extension}`;
            const uploadPath = path.join(__dirname, "../uploads/study-groups", fileName);

            await groupImage.mv(uploadPath);

            dbPath = `/uploads/study-groups/${fileName}`;
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { groupImage: dbPath },
            { new: true }
        );

        res.status(200).json({
            filePath: dbPath,
            group: updatedGroup,
            message: "업로드 및 DB 저장 완료",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/update-groupImage", async (req, res) => {
    try {
        const { groupId, groupImage } = req.body;

        let dbPath = groupImage;

        if (req.files && req.files.image) {
            const groupImage = req.files.image;
            const extension = path.extname(groupImage.name);
            const fileName = `${groupId.toString()}${extension}`;
            const uploadPath = path.join(__dirname, "../uploads/study-groups", fileName);

            if (uploadPath !== `${__dirname}/../uploads/study-groups/default-groupImage.png`)
                fs.unlink(uploadPath, (error) => {
                    if (error) {
                        console.error("파일 삭제 오류:", error);
                        return;
                    }
                    console.log("파일 삭제 성공!");
                });

            await groupImage.mv(uploadPath);

            dbPath = `/uploads/study-groups/${fileName}`;
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            groupId,
            { groupImage: dbPath },
            { new: true }
        );

        res.status(200).json({
            filePath: dbPath,
            group: updatedGroup,
            message: "업로드 및 DB 저장 완료",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/", async (req, res) => {
    try {
        const groups = await groupController.getAllGroups();

        res.status(200).json(groups);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;

        const groupData = await groupController.getGroup(groupId);

        res.status(200).json(groupData);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { groupName, description, groupImage, userId } = req.body;

        if (!userId) return res.status(401).json({ message: "로그인이 필요합니다." });

        const groupList = await groupController.getAllGroups();
        const isDuplicatedGroupName = await groupController.checkDuplicatedGroupName(
            groupList,
            groupName
        );

        if (isDuplicatedGroupName)
            return res.status(409).json({ message: "이미 존재하는 스터디그룹 이름입니다." });

        const group = await groupController.saveGroup(groupName, description, groupImage, userId);
        await userController.addUserToGroup(userId, group);

        res.status(201).json(group);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;
        const { groupName, description, groupImage, userId } = req.body;

        if (!userId) return res.status(401).json({ message: "로그인이 필요합니다." });

        const groupList = await groupController.getAllGroups();
        const isDuplicatedGroupName = await groupController.checkDuplicatedGroupName(
            groupList,
            groupName,
            groupId
        );

        if (isDuplicatedGroupName)
            return res.status(409).json({ message: "이미 존재하는 스터디그룹 이름입니다." });

        const updatedGroup = await groupController.updateGroup(
            groupId,
            groupName,
            description,
            groupImage
        );

        res.status(200).json({ updatedGroup, message: "스터디그룹 정보가 수정되었습니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.delete("/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;

        res.status(200).json({ message: "스터디 그룹이 삭제되었습니다." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
