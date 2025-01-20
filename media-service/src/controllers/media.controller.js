import logger from "../utils/logger.js";
import { uploadMediaToCloudinary } from "../utils/cloudinary.js";
import {Media} from "../model/media.model.js";

export const mediaUpload = async (req, res) => {
  try {

    logger.info("Media upload endpoint hit...");

   
    
    if (!req.file) {
      logger.warn("No file found");
      return res
        .status(400)
        .json({ message: "No file found", success: false });
    }

    const { originalname, buffer, mimetype } = req.file;
    const userId = req.user?.userId; // Validate that `req.user` exists

    logger.info(
      `File details: name=${originalname}, mimetype=${mimetype}, userId=${userId}`
    );

    logger.info("Uploading media to Cloudinary...");
    const cloudinaryUploadResult = await uploadMediaToCloudinary(req.file); // Pass buffer directly if supported
    logger.info("Media uploaded successfully:", cloudinaryUploadResult);

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploadResult.secure_url,
      userId,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      mediaId: newlyCreatedMedia._id,
      url: newlyCreatedMedia.url,
      message: "Media upload successfully",
    });
  } catch (error) {
    logger.error("Error while uploading media:", {
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      message: "Error uploading media",
    });
  }
};


export const getallmedia = async (req, res) => {
  try {
    logger.info("Get all media endpoint hit...");
    const media = await Media.find();
    console.log(media);
    
    res.status(200).json(media);
  } catch (error) {
   logger.error("Error fetching media:", error);
    res.status(500).json({ message: "Error fetching media" });
  }
}
