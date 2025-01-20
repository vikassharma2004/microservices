import express from "express";
import { getallmedia, mediaUpload } from "../controllers/media.controller.js";
import { authenticateRequest } from "../middleware/authmiddleware.js";

const Router = express.Router();

Router.route("/upload-media").post( authenticateRequest, mediaUpload);
Router.route("/get-media").get( authenticateRequest, getallmedia);

export default Router;
