import express from 'express'
import messageCtrl from '../controllers/message.controller.js'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/api/messages')
  .get(authCtrl.requireSignin, authCtrl.requireAdmin, messageCtrl.list)
  .post(messageCtrl.create)

router.route('/api/messages/stats')
  .get(authCtrl.requireSignin, authCtrl.requireAdmin, messageCtrl.getStats)

router.route('/api/messages/:messageId')
  .get(authCtrl.requireSignin, authCtrl.requireAdmin, messageCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.requireAdmin, messageCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.requireAdmin, messageCtrl.remove)

router.route('/api/messages/:messageId/read')
  .put(authCtrl.requireSignin, authCtrl.requireAdmin, messageCtrl.markAsRead)

router.route('/api/messages/:messageId/replied')
  .put(authCtrl.requireSignin, authCtrl.requireAdmin, messageCtrl.markAsReplied)

router.route('/api/messages/:messageId/reply')
  .post(authCtrl.requireSignin, authCtrl.requireAdmin, messageCtrl.replyToMessage)

router.route('/api/messages/user/messages')
  .post(authCtrl.requireSignin, messageCtrl.getUserMessages)

router.param('messageId', messageCtrl.messageByID)

export default router
