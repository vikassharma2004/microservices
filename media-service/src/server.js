import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import mediaRoutes from "./routes/media.route.js"
import { errorHandler } from "./middleware/errorHandler.js";
import Redis from "ioredis";
import cors from "cors";
import mongoose from "mongoose";
import logger from "./utils/logger.js";
import { connectrabbitmq, consumeEvent } from "./utils/rabbitmq.js"
import { handlepostdeleted } from "./eventhandlers/mediaeventhandler.js";
dotenv.config()

const app=express()

const PORT=process.env.PORT || 3003

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

app.use("/api/media",(req, res, next) => {
    req.redisClient = redisClient;
    next();
  }, mediaRoutes);

  const StartServer=async()=>{
    try {
      await connectrabbitmq();

      await consumeEvent("post.deleted",handlepostdeleted)
      app.listen(PORT, () => {
        logger.info(`media service running on port ${PORT}`);
      });
  
    } catch (error) {
      logger.info("Error connecting to RabbitMQ and server",error); 
  }

  }


process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
  });

  StartServer()