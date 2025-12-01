const User = require("../models/User.js");

const userController = {};

userController.addUserToGroup = async (userId, group) => {
    const user = await User.findById(userId);

    user.group = [...user.group, group];

    await user.save();

    return user;
};

userController.uploadImage = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "업로드된 파일이 없습니다." });
        }

        const profileImage = req.files.image;
        const { userId } = req.body;

        const fileName = userId.toString();

        const uploadPath = path.join(__dirname, "../uploads", fileName);

        await profileImage.mv(uploadPath);

        const dbPath = `/uploads/users/${fileName}`;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profileImage: dbPath },
            { new: true }
        );

        res.stauts(200).json({
            filePath: dbPath,
            user: updatedUser,
            message: "업로드 및 DB 저장 완료",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = userController;
