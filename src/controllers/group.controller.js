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

    if (groupData.groupLeader._id.toString() === userId.toString()) return (isCollected = true);

    groupData.groupMembers.map((groupMember) => {
        if (groupMember._id.toString() === userId.toString()) return (isCollected = true);
    });

    return isCollected;
};

groupController.saveGroup = async (groupName, description, groupImage, userId) => {
    const newGroup = new Group({
        group: groupName,
        description: description,
        groupImage: groupImage,
        groupLeader: userId,
        groupMembers: [],
    });

    await newGroup.save();

    return newGroup;
};

groupController.updateGroup = async (groupId, groupName, description, groupImage) => {
    const updatedGroup = await Group.findByIdAndUpdate(
        groupId,
        {
            group: groupName,
            description: description,
            groupImage: groupImage,
        },
        { new: true }
    );

    await updatedGroup.save();

    return updatedGroup;
};

groupController.checkDuplicatedGroupName = async (allGroups, groupName, groupId = null) => {
    let isDuplicate = false;

    allGroups.map((group) => {
        if (group.group === groupName) {
            if (group._id.toString() === groupId) return isDuplicate;
            return (isDuplicate = true);
        }
    });

    return isDuplicate;
};

module.exports = groupController;
