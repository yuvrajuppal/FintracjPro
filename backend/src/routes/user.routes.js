import { Router } from "express";
import { signupController, loginController, checkIsLoggedInController } from "../controller/user.controller.js";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/check", checkIsLoggedInController);

export default router;
