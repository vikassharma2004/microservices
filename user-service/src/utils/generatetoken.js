import jwt from "jsonwebtoken";
import crypto from "crypto";
import { RefreshToken } from "../models/refresh.token.js";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;



async function generateToken(user) {
  try {
    // Define payload for access token
    const payload = {
      id: user._id,
      username: user.username,
    };

    // Generate access token with 15 minutes expiration
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '40m' });

    // Generate refresh token using crypto
    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Set expiration time for refresh token (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token in the database
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt,
    });

    // Return both access token and refresh token
    return { accessToken, refreshToken };

  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new Error("Token generation failed");
  }
}

export { generateToken };
