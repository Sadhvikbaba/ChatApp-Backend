import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";

import { sendMessage ,getMessage} from "../controllers/message.controller.js";

const router = Router()

router.route("/send/:id").post(verifyJWT , sendMessage);
router.route("/:id").get(verifyJWT , getMessage);

export default router