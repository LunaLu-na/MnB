import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Name is required'
  },
  email: {
    type: String,
    trim: true,
    required: 'Email is required',
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  subject: {
    type: String,
    trim: true,
    required: 'Subject is required'
  },
  message: {
    type: String,
    trim: true,
    required: 'Message is required'
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null  // Will be null for non-authenticated users
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied'],
    default: 'unread'
  },
  reply: {
    content: {
      type: String,
      trim: true
    },
    sentAt: {
      type: Date
    },
    sentBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  created: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

MessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Message', MessageSchema)
