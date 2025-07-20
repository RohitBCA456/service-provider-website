import { Router } from "express";
import { updateCustomerProfile, logoutCustomer } from "../Controllers/Customer.Controller.js";
import { authMiddleware } from "../Middlewares/Auth.Middleware.js";
import { upload } from "../Middlewares/Multer.Middleware.js";

const router = Router();

router.route('/updateCustomer').put(upload.single("avatar"), authMiddleware, updateCustomerProfile)
router.route('/logoutCustomer').get(authMiddleware, logoutCustomer);

export default router;