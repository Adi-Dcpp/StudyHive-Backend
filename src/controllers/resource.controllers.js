import { ApiError } from "../utils/api-error.utils.js";
import { ApiResponse } from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";
import { Group } from "../models/group.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.utils.js";
import { Resource } from "../models/resource.models.js";
import { v2 as cloudinary } from "cloudinary";

const uploadResource = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { title, description, type, linkUrl } = req.body;
  const { _id: userId } = req.user;

  if (!title || !type || !groupId || !userId) {
    throw new ApiError(400, "All required fields must be present");
  }

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.mentor.equals(userId)) {
    throw new ApiError(403, "User not authorized");
  }

  let fileUrl;
  let cloudinaryPublicId;

  if (type === "file") {
    if (!req.file) {
      throw new ApiError(400, "File is required for file type resource");
    }
    const uploadResult = await uploadToCloudinary(req.file.path);
    fileUrl = uploadResult.secureUrl;
    cloudinaryPublicId = uploadResult.publicId;
  }

  if (type === "link" && !linkUrl) {
    throw new ApiError(400, "linkUrl is required for link type resource");
  }

  if (type === "note" && !description) {
    throw new ApiError(400, "Description is required for note type resource");
  }

  const resource = await Resource.create({
    title,
    description,
    type,
    group: groupId,
    uploadedBy: userId,
    linkUrl,
    fileUrl,
    cloudinaryPublicId,
  });

  return res.status(201).json(
    new ApiResponse(201, "Resource created successfully", {
      resourceId: resource._id,
      title: resource.title,
      type: resource.type,
      uploadedBy: resource.uploadedBy,
      createdAt: resource.createdAt,
    }),
  );
});

const getResourceByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { _id: userId } = req.user;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const isMember = await GroupMember.findOne({
    group: groupId,
    user: userId,
  });

  if (!isMember) {
    throw new ApiError(403, "User not authorized to get resources data");
  }

  const { sortBy = "recent", type } = req.query;

  const filter = { group: groupId };
  if (type) {
    filter.type = type;
  }

  let sortOption = { createdAt: -1 };

  if (sortBy === "oldest") {
    sortOption = { createdAt: 1 };
  } else if (sortBy === "title") {
    sortOption = { title: 1 };
  }

  const resources = await Resource.find(filter)
    .sort(sortOption)
    .populate("uploadedBy", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, "Resources fetched successfully", resources));
});

const deleteResource = asyncHandler(async (req, res) => {
  const { resourceId } = req.params;
  const { _id: userId, role } = req.user;

  const resource = await Resource.findById(resourceId);
  if (!resource) {
    throw new ApiError(404, "Resource not found");
  }

  if (role !== "admin") {
    const isMember = await GroupMember.findOne({
      group: resource.group,
      user: userId,
    });

    if (!isMember) {
      throw new ApiError(403, "User not authorized to delete the resource");
    }
  }

  const isCreator = resource.uploadedBy.equals(userId);
  const isAdmin = role === "admin";

  if (!isAdmin && !isCreator) {
    throw new ApiError(403, "User not authorized to delete the resource");
  }

  if (resource.type === "file" && resource.cloudinaryPublicId) {
    await cloudinary.uploader.destroy(resource.cloudinaryPublicId);
  }

  await resource.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "Resource deleted successfully", {}));
});

export { uploadResource, getResourceByGroup, deleteResource };
