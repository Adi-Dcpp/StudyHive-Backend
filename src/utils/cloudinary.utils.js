import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath, mimetype) => {
  try {
    const resourceType =
      mimetype && mimetype.startsWith("image/") ? "image" : "raw";

    if (!localFilePath) {
      throw new ApiError(400, "File path is missing");
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "studyhive",
      resource_type: resourceType,
    });

    fs.unlinkSync(localFilePath);

    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      await fs.promises.unlink(localFilePath);
    }
    throw error;
  }
};

export { uploadToCloudinary };
