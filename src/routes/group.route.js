const express = require("express");
const path = require("path");

const Group = require("../models/Group");

const groupController = require("../controllers/group.controller");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.post("/upload-groupImage", async (req, res) => {
    try {
        const { groupId, groupName } = req.body;

        let dbPath = `/uploads/study-groups/default-groupImage.png`;

        if (req.files && req.files.image) {
            const groupImage = req.files.image;
            const extension = path.extname(groupImage.name);
            const fileName = `${groupName.toString()}${extension}`;
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

router.get("/:groupId", async (req, res) => {
    try {
        const { groupId } = req.params;

        const groupData = await groupController.getGroup(groupId);

        console.log(groupData);

        res.status(200).json(groupData);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { groupName, description, groupImageUrl, userId } = req.body;

        if (!userId) return res.status(401).json({ message: "로그인이 필요합니다." });

        const groupList = await groupController.getAllGroups();
        const isDuplicatedGroupName = await groupController.checkDuplicatedGroupName(
            groupList,
            groupName
        );

        if (isDuplicatedGroupName)
            return res.status(409).json({ message: "이미 존재하는 스터디그룹 이름입니다." });

        const group = await groupController.saveGroup(
            groupName,
            description,
            groupImageUrl,
            userId
        );
        await userController.addUserToGroup(userId, group);

        res.status(201).json(group);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

router.put("/:groupId", async (req, res) => {});

router.delete("/:groupId", async (req, res) => {});

module.exports = router;
