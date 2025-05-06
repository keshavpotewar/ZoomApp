
import { Router } from "express";
import { login, register } from "../Controllers/user.controller.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/logout");
router.route("/add_to_Activity");
router.route("/get_all_Activity");

export default router;
