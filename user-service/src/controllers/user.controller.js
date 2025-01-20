import { User } from "../models/user.model.js";
import logger from "../utils/logger.js";
import { validateUser } from "../utils/validation.js";
import { generateToken } from "../utils/generatetoken.js";
import { RefreshToken } from "../models/refresh.token.js";
import { validatelogin } from "../utils/validation.js";


// user registeration controller
export const registerUser = async (req, res) => {
  logger.info("User registration request received");
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
    {
      logger.warn("All fields are required");
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const { error ,value} = validateUser(req.body);
    console.log("Validation result:", validateUser(req.body));
    if (error) {
      logger.warn("validation error:", error.details[0].message);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    let userexist = await User.findOne({ $or: [{ username }, { email }] });
    if (userexist) {
      logger.warn("user already exist");
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const user = new User({ username, email, password });
    await user.save();
    const { accessToken, refreshToken } = await generateToken(user);
    
    
    logger.warn("user registered successfully", user._id);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      userID:user._id
    });
  } catch (error) {
    logger.error("Error registering user:", error);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
};

// user login controller
export const loginUser = async (req, res) => {
  logger.info("User login request received");
  try {
    const { error ,value} = validatelogin(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Invalid user");
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch=await user.comparePassword(password);
    if(!isMatch){
      logger.warn("Invalid password");
        return res.status(400).json({
            success:false,
            message:"password incorrect"
        })
    }

    const { accessToken, refreshToken } = await generateToken(user);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
      refreshToken,
      data: {...user._doc, password:undefined},
    });
  } catch (error) {
    logger.error("Login error occured", error);
    res.status(500).json({ success: false, message: "Error logging in user" });
  }
};
// refresh token controller

//logout controller



export const refreshTokenUser = async (req, res) => {
  logger.info("Refresh token endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");

      return res.status(401).json({
        success: false,
        message: `Invalid or expired refresh token`,
      });
    }

    const user = await User.findById(storedToken.user);

    if (!user) {
      logger.warn("User not found");

      return res.status(401).json({
        success: false,
        message: `User not found`,
      });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user);

    //delete the old refresh token
    await RefreshToken.deleteOne({ _id: storedToken._id });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (e) {
    logger.error("Refresh token error occured", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//logout

export const logoutUser = async (req, res) => {
  logger.info("Logout endpoint hit...");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info("Refresh token deleted for logout");

    res.json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (e) {
    logger.error("Error while logging out", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
