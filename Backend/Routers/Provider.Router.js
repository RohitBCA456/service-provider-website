import Router from "express";
import {
  updateProviderProfile,
  getSingleProvider,
  getALLNearByProviders,
  logoutProvider,
  updateServicePair,
  deleteServicePair,
} from "../Controllers/Provider.Controller.js";
import { authMiddleware } from "../Middlewares/Auth.Middleware.js";
import { upload } from "../Middlewares/Multer.Middleware.js";

const router = Router();

router.put(
  "/updateProvider",
  authMiddleware,
  upload.single("avatar"),
  updateProviderProfile
);
router.route("/getProvider/:providerId").get(getSingleProvider);
router
  .route("/getAllNearByProviders")
  .get(authMiddleware, getALLNearByProviders);
authMiddleware,
  router.route("/logoutProvider").get(authMiddleware, logoutProvider);
router.route("/updateServicePairs").put(authMiddleware, updateServicePair);
router.route("/deleteServicePairs").delete(authMiddleware, deleteServicePair);

export default router;
