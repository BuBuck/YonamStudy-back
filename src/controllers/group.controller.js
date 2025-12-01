const Group = require("../models/Group");

const groupController = {};

groupController.getAllGroups = async () => {
    const groupList = await Group.find({});

    return groupList;
};

groupController.getGroup = async (groupId) => {
    const groupData = await Group.findById(groupId);

    return groupData;
};

groupController.checkMember = async (groupData, userId) => {
    let isCollected = false;

    if (groupData.groupLeader._id.toString() === userId) return (isCollected = true);

    groupData.groupMembers.map((groupMember) => {
        if (groupMember._id.toString() === userId) return (isCollected = true);
    });

    return isCollected;
};

groupController.saveGroup = async (groupName, description, groupImageUrl, userId) => {
    const newGroup = new Group({
        group: groupName,
        description: description,
        groupImage: groupImageUrl,
        groupLeader: userId,
        groupMembers: [],
    });

    await newGroup.save();

    return newGroup;
};

groupController.checkDuplicatedGroupName = async (groupList, groupName) => {
    let isDuplicate = false;

    groupList.map((group) => {
        if (group.group.toString() === groupName.toString()) {
            return (isDuplicate = true);
        }
    });

    return isDuplicate;
};

module.exports = groupController;
