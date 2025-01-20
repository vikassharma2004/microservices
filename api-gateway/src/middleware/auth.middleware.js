import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken"



export const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Access attempt without valid token!");
    return res.status(401).json({
      message: "Authentication required",
      success: false,
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn("Invalid token!");
      return res.status(429).json({
        message: "Invalid token!",
        success: false,
      });
    }

    req.user = user;
    next();
  });
};
