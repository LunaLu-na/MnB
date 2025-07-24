import Message from '../models/message.model.js'
import dbErrorHandler from '../helpers/dbErrorHandler.js'

const create = async (req, res) => {
  try {
    const message = new Message(req.body)
    await message.save()
    return res.status(200).json({
      message: "Message sent successfully! Miggy will get back to you soon."
    })
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const list = async (req, res) => {
  try {
    let messages = await Message.find().sort({ created: -1 })
    res.json(messages)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const messageByID = async (req, res, next, id) => {
  try {
    let message = await Message.findById(id)
    if (!message)
      return res.status(400).json({
        error: "Message not found"
      })
    req.message = message
    next()
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve message"
    })
  }
}

const read = (req, res) => {
  return res.json(req.message)
}

const update = async (req, res) => {
  try {
    let message = req.message
    message = Object.assign(message, req.body)
    message.updatedAt = Date.now()
    await message.save()
    res.json(message)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    let message = req.message
    let deletedMessage = await message.deleteOne()
    res.json(deletedMessage)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const markAsRead = async (req, res) => {
  try {
    let message = req.message
    message.status = 'read'
    message.updatedAt = Date.now()
    await message.save()
    res.json({ message: "Message marked as read" })
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const markAsReplied = async (req, res) => {
  try {
    let message = req.message
    message.status = 'replied'
    message.updatedAt = Date.now()
    await message.save()
    res.json({ message: "Message marked as replied" })
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const replyToMessage = async (req, res) => {
  try {
    let message = req.message
    message.reply = {
      content: req.body.replyContent,
      sentAt: new Date(),
      sentBy: req.auth._id
    }
    message.status = 'replied'
    message.updatedAt = Date.now()
    await message.save()
    
    // Populate the reply sender info for response
    await message.populate('reply.sentBy', 'name email')
    
    res.json({ 
      message: "Reply sent successfully",
      data: message 
    })
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const getUserMessages = async (req, res) => {
  try {
    const userEmail = req.body.email || req.query.email
    const userId = req.body.userId || req.query.userId
    
    if (!userEmail && !userId) {
      return res.status(400).json({
        error: "Email or userId is required"
      })
    }
    
    // Build query - find messages by userId OR by email (for backward compatibility)
    let query = {}
    if (userId) {
      query.$or = [
        { userId: userId },
        { email: userEmail, userId: null } // Include messages sent before userId was implemented
      ]
    } else {
      query.email = userEmail
    }
    
    let messages = await Message.find(query)
      .populate('reply.sentBy', 'name email')
      .sort({ created: -1 })
    res.json(messages)
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

const getStats = async (req, res) => {
  try {
    const total = await Message.countDocuments()
    const unread = await Message.countDocuments({ status: 'unread' })
    const read = await Message.countDocuments({ status: 'read' })
    const replied = await Message.countDocuments({ status: 'replied' })
    
    res.json({
      total,
      unread,
      read,
      replied
    })
  } catch (err) {
    return res.status(400).json({
      error: dbErrorHandler.getErrorMessage(err)
    })
  }
}

export default {
  create,
  messageByID,
  read,
  list,
  remove,
  update,
  markAsRead,
  markAsReplied,
  replyToMessage,
  getUserMessages,
  getStats
}
