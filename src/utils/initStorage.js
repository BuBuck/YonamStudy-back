const fs = require("fs");
const path = require("path");

const initStorage = () => {
    const folders = [
        path.join(__dirname, "../uploads"),
        path.join(__dirname, "../uploads/users"),
        path.join(__dirname, "../uploads/study-groups"),
    ];

    folders.forEach((folder) => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
            console.log(`📂 폴더 생성 완료: ${folder}`);
        }
    });

    const defaults = [
        {
            src: path.join(__dirname, "../assets/default-userImage.png"),
            dest: path.join(__dirname, "../uploads/users/default-userImage.png"),
        },
        {
            src: path.join(__dirname, "../assets/default-groupImage.png"),
            dest: path.join(__dirname, "../uploads/study-groups/default-groupImage.png"),
        },
    ];

    defaults.forEach((file) => {
        if (fs.existsSync(file.src) && !fs.existsSync(file.dest)) {
            fs.copyFileSync(file.src, file.dest);
            console.log(`🖼️ 기본 이미지 복사 완료: ${path.basename(file.dest)}`);
        }
    });
};

module.exports = initStorage;
