const User = require("../models/User.js");

const userController = {};

userController.addUserToGroup = async (userId, group) => {
    const user = await User.findById(userId);

    user.group.push(group);

    await user.save();

    return user;
};

userController.formatPhoneNumber = async (phoneNumber) => {
    if (!phoneNumber.match(/^\d{3}-\d{4}-\d{4}$/)) {
        return (formattedPhoneNumber = phoneNumber.replace(
            /^(\d{3})[-\s]?(\d{4})[-\s]?(\d{4})$/,
            "$1-$2-$3"
        ));
    }
};

module.exports = userController;
