import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import PostRoute from "./routes/post.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import Redis from "ioredis";
import cors from "cors";
import mongoose from "mongoose";
import logger from "./utils/logger.js";
import { connectrabbitmq } from "./utils/rabbitmq.js";
dotenv.config()

const app=express()

const PORT=process.env.PORT || 3002

//connect to mongodb
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
  });
// routes

app.use("/api/posts",(req, res, next) => {
    req.redisClient = redisClient;
    next();
  }, PostRoute);



  const Startserver=async()=>{
    try {
      await connectrabbitmq();
      
      app.listen(PORT, () => {
        logger.info(`Post service running on port ${PORT}`);
      });

      app.get("/", (req, res) => {
        res.send("Post Service is running!");
      });

    } catch (error) {
      logger.info("Error connecting to RabbitMQ and server",error);
      process.exit(1)
    }
  }




process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
  });


  Startserver();