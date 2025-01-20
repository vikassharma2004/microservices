import cloudinary from "cloudinary"

import logger from "../utils/logger.js";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
})


export const uploadMediaToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            logger.error("Error while uploading media to cloudinary", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
  
      uploadStream.end(file.buffer);
    });
  };
  
 export  const deleteMediaFromCloudinary = async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      logger.info("Media deleted successfuly from cloud stroage", publicId);
      return result;
    } catch (error) {
      logger.error("Error deleting media from cludinary", error);
      throw error;
    }
  };
  
export default cloudinary;