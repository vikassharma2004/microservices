import winston from "winston";

const logger = winston.createLogger({
  level: process.env.NODE_ENV == "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "userservice" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.colorize()
      ),
    }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

export default logger;
