import express from "express";
import albumCtrl from "../controllers/album.controller.js";
import authCtrl from "../controllers/auth.controller.js";
import userCtrl from "../controllers/user.controller.js";

const router = express.Router();

router.route("/api/albums")
  .get(albumCtrl.list)
  .post(authCtrl.requireSignin, albumCtrl.requireAdmin, albumCtrl.create);

router.route("/api/albums/all")
  .get(authCtrl.requireSignin, albumCtrl.requireAdmin, albumCtrl.listAll);

// Debug endpoint to check auth status
router.route("/api/albums/debug")
  .get(authCtrl.requireSignin, (req, res) => {
    res.json({
      auth: req.auth,
      isAdmin: req.auth?.admin || false,
      message: "Debug info"
    });
  });

router.route("/api/albums/:albumId")
  .get(albumCtrl.read)
  .put(authCtrl.requireSignin, albumCtrl.requireAdmin, albumCtrl.update)
  .delete(authCtrl.requireSignin, albumCtrl.requireAdmin, albumCtrl.remove);

router.route("/api/albums/:albumId/media")
  .post(authCtrl.requireSignin, albumCtrl.requireAdmin, albumCtrl.addMedia);

router.route("/api/albums/:albumId/media/:mediaId")
  .delete(authCtrl.requireSignin, albumCtrl.requireAdmin, albumCtrl.removeMedia);

router.param("albumId", albumCtrl.albumByID);
router.param("userId", userCtrl.userByID);

export default router;
