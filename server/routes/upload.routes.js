import express from 'express';
import uploadCtrl from '../controllers/upload.controller.js';
import authCtrl from '../controllers/auth.controller.js';

const router = express.Router();

// Upload endpoint - requires authentication and admin privileges
router.route('/api/upload')
  .post(authCtrl.requireSignin, authCtrl.requireAdmin, uploadCtrl.uploadFile);

export default router;
