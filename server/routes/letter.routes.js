import express from "express";
import letterCtrl from "../controllers/letter.controller.js";
import authCtrl from "../controllers/auth.controller.js";
import userCtrl from "../controllers/user.controller.js";

const router = express.Router();

router.route("/api/letters")
  .get(letterCtrl.list)
  .post(authCtrl.requireSignin, letterCtrl.requireAdmin, letterCtrl.create);

router.route("/api/letters/:letterId")
  .get(letterCtrl.read)
  .put(authCtrl.requireSignin, letterCtrl.requireAdmin, letterCtrl.update)
  .delete(authCtrl.requireSignin, letterCtrl.requireAdmin, letterCtrl.remove);

router.param("letterId", letterCtrl.letterByID);
router.param("userId", userCtrl.userByID);

export default router;
