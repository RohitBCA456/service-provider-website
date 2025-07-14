import { Router } from "express";
import { Login } from "../Controllers/Auth.Controller.js";

const router = Router();

router.route('/login').post(Login)

export default router;