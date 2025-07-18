import { Router } from "express";
import { fetchUserRole, Login } from "../Controllers/Auth.Controller.js";
import { authMiddleware } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.route("/login").post(Login);
router.route("/fetchUserRole").get(authMiddleware, fetchUserRole);

export default router;
