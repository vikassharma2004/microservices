import { Media } from "../model/media.model.js";
// import { deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import logger from "../utils/logger.js";

export const handlepostdeleted = async (event) => {
  console.log(event);

  const { postId, mediaIds } = event;
  try {
    const mediatodelete = await Media.find({ _id: { $in: mediaIds } });
    console.log(mediatodelete);
    

    for (const media of mediatodelete) {
      await deleteMediaFromCloudinary(media.publicId)
      await Media.deleteOne({ _id: media._id });
    logger.info(`media deleted successfully ${mediatodelete}`);
      logger.info(
        `media deleted successfully ${media._id} associated with post ${postId}`
      );
    }

    logger.info("post deleted successfully");
  } catch (error) {
    logger.error("Error deleting media from cludinary", error);
  }
};
