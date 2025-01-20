import express from "express";  
const Router =express.Router();
import { registerUser,loginUser, logoutUser, refreshTokenUser } from "../controllers/user.controller.js";

Router.route("/register").post(registerUser);
Router.route("/login").post(loginUser);
Router.route("/logout").post(logoutUser);

Router.route("/refresh-token").post(refreshTokenUser);

export default Router