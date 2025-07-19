import Router from "express";
import {
  updateProviderProfile,
  getSingleProvider,
  getALLNearByProviders,
  logoutProvider,
} from "../Controllers/Provider.Controller.js";
import { authMiddleware } from "../Middlewares/Auth.Middleware.js";


const router = Router();

router.route("/updateProvider").put(authMiddleware, updateProviderProfile);
router.route("/getProvider/:providerId").get(getSingleProvider);
router
  .route("/getAllNearByProviders")
  .get(authMiddleware, getALLNearByProviders);
router.route("/logoutProvider").get(authMiddleware, logoutProvider);

export default router;
