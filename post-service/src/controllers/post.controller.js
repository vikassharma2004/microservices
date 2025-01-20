import logger from "./../utils/logger.js";
import { Post } from "../model/post.model.js";
import { validateCreatePost } from "../utils/validationpost.js";
import { invalidatePostCache } from "../utils/invalidatepost.js";
import { publishEvent } from "../utils/rabbitmq.js";

export const createPost = async (req, res) => {
  logger.info("create post endpoint hit...");
  try {
    const { content, mediaIds } = req.body;

    const { error } = validateCreatePost(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message, success: false });
    }

    const newlyCreatedPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await newlyCreatedPost.save();
    const keys = await req.redisClient.keys("post:*"); // Get all cache keys related to posts
    for (const key of keys) {
      await req.redisClient.del(key); // Delete each key
    }
    await invalidatePostCache(req, req.params.id);
   
    logger.info("Post created successfully");

    res
      .status(201)
      .json({ message: "Post created successfully", success: true });
  } catch (error) {
    logger.error("Error creating post", error);
    res.status(500).json({ message: "Error creating post", success: false });
  }
};

export const getPost = async (req, res) => {
  logger.info("get post endpoint hit...");
  try {
    const postid = req.params.id;
    const cashekey = `post:${postid}`;
    const cashedpost = await req.redisClient.get(cashekey);
    if (cashedpost) {
      return res.status(200).json(JSON.parse(cashedpost));
    }

    const singlepostbyid = await Post.findById(postid);
    if (!singlepostbyid) {
      return res
        .status(404)
        .json({ message: "Post not found", success: false });
    }
    await req.redisClient.setex(cashekey, 3600, JSON.stringify(singlepostbyid));
    return res.status(200).json(singlepostbyid);
  } catch (error) {
    logger.error("error Fetching Post", error);
    res
      .status(500)
      .json({ message: "Error Fetching post by id", success: false });
  }
};
export const getAllPost = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const cacheKey = `post-${page}:${limit}`;

    // Check cache
    // Make sure to await this

    const cachedPost = await req.redisClient.get(cacheKey);
    if (cachedPost) {
      return res.status(200).json(JSON.parse(cachedPost)); // Add return here
    }

    // Fetch posts from database
    const posts = await Post.find()
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Post.countDocuments();
   

    // Prepare response
    const result = {
      result: posts,
      total,
      limit: limit,
      page: page,
    };

    // Cache the result
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    // Send response
    res.status(200).json(result);
  } catch (error) {
    logger.error("Error Fetching Post", error);
    res.status(500).json({ message: "Error Fetching post", success: false });
  }
};

export const DeletePost = async (req, res) => {
  logger.info("Delete post endpoint hit...");
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // publish post delete method ->

    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });
    const keys = await req.redisClient.keys("post:*"); // Get all cache keys related to posts
    for (const key of keys) {
      await req.redisClient.del(key); // Delete each key
    }
    await invalidatePostCache(req, req.params.id);
    res.json({
      message: "Post deleted successfully",
    });
  } catch (e) {
    logger.error("Error deleting post", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
    });
  }
};
