import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";
import { getPaginatedData } from "../utils/pagination.utils.js";
import { Group } from "../models/group.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import crypto from "node:crypto";

const createGroup = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;
  const inviteCode = crypto.randomBytes(6).toString("hex");

  const group = await Group.create({
    name,
    description,
    inviteCode,
    mentor: userId,
  });

  if (!group) {
    throw new ApiError(500, "Failed to create group");
  }

  await GroupMember.create({
    group: group._id,
    user: userId,
    role: "mentor",
  });

  return res.status(201).json(
    new ApiResponse(201, "Group successfully created", {
      groupId: group._id,
      name: group.name,
      inviteCode: group.inviteCode,
    }),
  );
});

const joinGroup = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;
  const userId = req.user._id;

  const group = await Group.findOne({ inviteCode });

  if (!group) {
    throw new ApiError(404, "Invalid or Expired invite code");
  }

  const alreadyMember = await GroupMember.findOne({
    group: group._id,
    user: userId,
  });

  if (alreadyMember) {
    throw new ApiError(409, "You are already a member");
  }

  await GroupMember.create({
    group: group._id,
    user: userId,
    role: "learner",
  });

  return res.status(200).json(
    new ApiResponse(200, "Successfully joined the group", {
      groupId: group._id,
      name: group.name,
      role: "learner",
    }),
  );
});

const viewAllJoinedGroup = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  //Add Pagination
  const total = await GroupMember.countDocuments({ user: userId });

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  if (!total) {
    return res.status(200).json(
      new ApiResponse(200, "No groups joined yet", {
        groups: [],
        pagination,
      }),
    );
  }

  const memberships = await GroupMember.find({ user: userId })
    .skip(skip)
    .limit(limit)
    .populate("group")
    .lean();

  const groupIds = memberships
    .map((membership) => membership.group?._id)
    .filter(Boolean);

  if (groupIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "All groups fetched successfully", {
        groups: [],
        pagination,
      }),
    );
  }

  const [memberCounts, mentorMemberships] = await Promise.all([
    GroupMember.aggregate([
      { $match: { group: { $in: groupIds } } },
      { $group: { _id: "$group", count: { $sum: 1 } } },
    ]),
    GroupMember.find({
      group: { $in: groupIds },
      role: "mentor",
    })
      .select("group user")
      .lean(),
  ]);
  const memberCountMap = new Map(
    memberCounts.map((entry) => [entry._id.toString(), entry.count]),
  );

  const mentorByGroupId = new Map(
    mentorMemberships.map((entry) => [entry.group.toString(), entry.user]),
  );

  const result = memberships.map((m) => ({
    groupId: m.group._id,
    name: m.group.name,
    description: m.group.description,
    mentor: mentorByGroupId.get(m.group._id.toString()) || null,
    membersCount: memberCountMap.get(m.group._id.toString()) || 0,
    role: m.role,
  }));

  return res.status(200).json(
    new ApiResponse(200, "All groups fetched successfully", {
      groups: result,
      pagination,
    }),
  );
});

const getGroupDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { groupId } = req.params;

  const isMember = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!isMember) {
    throw new ApiError(403, "Access Denied");
  }

  const group = await Group.findOne({ _id: groupId });

  if (!group) {
    throw new ApiError(404, "Group does not exist");
  }

  return res.status(200).json(
    new ApiResponse(200, "Group details fetched successfully", {
      groupId: group._id,
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
    }),
  );
});

const updateGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;
  const { newName, newDescription } = req.body;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const member = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!member || member.role !== "mentor") {
    throw new ApiError(403, "User not allowed to make changes");
  }

  if (newName) {
    group.name = newName;
  }
  if (newDescription) {
    group.description = newDescription;
  }

  await group.save();

  return res.status(200).json(
    new ApiResponse(200, "Group updated successfully", {
      name: group.name,
      description: group.description,
    }),
  );
});

const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const member = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!member || member.role !== "mentor") {
    throw new ApiError(403, "Only mentors can delete the group");
  }

  await GroupMember.deleteMany({ group: groupId });

  await Group.findByIdAndDelete(groupId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Group deleted Successfully", { groupId }));
});

const inviteMembers = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const groupId = req.params.groupId;

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Failed to fetch group details");
  }

  const member = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!member || member.role !== "mentor") {
    throw new ApiError(403, "Not authorized to generate invite code");
  }

  return res.status(200).json(
    new ApiResponse(200, "Invite code fetched successfully", {
      inviteCode: group.inviteCode,
    }),
  );
});

const viewGroupMembers = asyncHandler(async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user._id;

  const member = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!member) {
    throw new ApiError(403, "Not authorized to get members data");
  }

  //Add Pagination
  const total = await GroupMember.countDocuments({ group: groupId });

  const { skip, limit, pagination } = getPaginatedData({
    query: req.query,
    total,
  });

  if (!total) {
    return res.status(200).json(
      new ApiResponse(200, "No members in the group yet", {
        members: [],
        pagination,
      }),
    );
  }

  const memberships = await GroupMember.find({ group: groupId })
    .skip(skip)
    .limit(limit)
    .populate("user", "name email")
    .lean();

  const result = memberships.map((m) => ({
    userId: m.user._id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joinedAt: m.createdAt,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Members data fetched successfully", {
        members: result,
        pagination,
      }),
    );
});

const removeGroupMembers = asyncHandler(async (req, res) => {
  const { groupId, userId: targetUserId } = req.params;
  const requesterId = req.user._id;

  const mentorMembership = await GroupMember.findOne({
    group: groupId,
    user: requesterId,
    role: "mentor",
  });

  if (!mentorMembership) {
    throw new ApiError(403, "Only mentors can remove group members");
  }

  if (requesterId.toString() === targetUserId) {
    throw new ApiError(400, "Mentor cannot remove themselves");
  }

  const removedMember = await GroupMember.findOneAndDelete({
    group: groupId,
    user: targetUserId,
  });

  if (!removedMember) {
    throw new ApiError(404, "Group member not found");
  }

  return res.status(200).json(
    new ApiResponse(200, "Member removed successfully", {
      groupId,
      removedUserId: targetUserId,
    }),
  );
});

export {
  createGroup,
  joinGroup,
  viewAllJoinedGroup,
  getGroupDetails,
  updateGroup,
  deleteGroup,
  inviteMembers,
  viewGroupMembers,
  removeGroupMembers,
};
