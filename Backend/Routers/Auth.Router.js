import { Router } from "express";
import {
  fetchUserRole,
  getChatHistory,
  getCurrentUser,
  getUserDetails,
  Login,
} from "../Controllers/Auth.Controller.js";
import { authMiddleware } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.route("/login").post(Login);
router.route("/fetchUserRole").get(authMiddleware, fetchUserRole);
router.route("/getUserDetails/:id").get(getUserDetails);
router.route("/getChatHistory/:roomId").get(getChatHistory);
router.route("/getCurrentUser").get(authMiddleware, getCurrentUser);

export default router;
