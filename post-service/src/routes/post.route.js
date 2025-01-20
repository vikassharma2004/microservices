import express from "express"
const Router=express.Router()
import { createPost, DeletePost, getAllPost, getPost } from "../controllers/post.controller.js"
import { authenticateRequest } from "../middleware/authmiddleware.js";

Router.use(authenticateRequest)
Router.route("/create-post").post(createPost)
Router.route("/all-post").get(getAllPost)
Router.route("/:id").get(getPost)
Router.route("/:id").delete(DeletePost)


export default Router;
    
