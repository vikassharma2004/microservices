import logger from "../utils/logger.js";

export const invalidatePostCache = async (req,input) => {
    try {
      
      
            const cachedKey = `post:${input}`;
            await req.redisClient.del(cachedKey);
          
            const keys = await req.redisClient.keys("post:*"); // Match all paginated post cache keys
            if (keys.length > 0) {
              for (const key of keys) {
                await req.redisClient.del(key); // Delete each key
              }
            }
            logger.info("Post cache invalidated successfully");
          
    } catch (error) {
        logger.error("error invalidating post", error);
        res.status(500).json({ message: "Error invalidating post", success: false });
    }
};