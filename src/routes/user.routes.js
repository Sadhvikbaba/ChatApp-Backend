import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";

import { registerUser , loginUser , logoutUser , refreshAccesstoken , getUsers , getCurrrentUser} from "../controllers/user.controllers.js";

const router = Router()

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT , logoutUser);
router.route("/refresh").post(refreshAccesstoken);
router.route("/users").get(verifyJWT , getUsers);
router.route("/user").get(verifyJWT , getCurrrentUser);

export default router