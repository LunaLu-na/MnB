import express from "express";
import userCtrl from "../controllers/user.controller.js";
import authCtrl from "../controllers/auth.controller.js";

const router = express.Router();

// Admin middleware for user management
const requireAdmin = (req, res, next) => {
  if (!req.auth || !req.auth.admin) {
    return res.status(403).json({
      error: "Admin access required",
    });
  }
  next();
};

router.route("/api/users").post(userCtrl.create);
router.route("/api/users").get(authCtrl.requireSignin, requireAdmin, userCtrl.list);

router
  .route("/api/users/:userId")
  .get(authCtrl.requireSignin, userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, requireAdmin, userCtrl.remove);

router.route("/api/users/:userId/make-admin")
  .put(userCtrl.makeAdmin);

router.route("/api/users/:userId/toggle-admin")
  .put(authCtrl.requireSignin, requireAdmin, userCtrl.toggleAdmin);

router.param("userId", userCtrl.userByID);

export default router;
