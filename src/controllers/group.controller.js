const Group = require("../models/Group");

const groupController = {};

groupController.getAllGroups = async () => {
    const groupList = await Group.find({});

    return groupList;
};

module.exports = groupController;
