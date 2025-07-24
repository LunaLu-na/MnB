import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: "Title is required",
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  url: {
    type: String,
    required: "Media URL is required",
  },
  thumbnail: {
    type: String,
    default: "",
  },
  size: {
    type: Number,
    default: 0,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

const AlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: "Album title is required",
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  coverImage: {
    type: String,
    default: "",
  },
  media: [MediaSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Album", AlbumSchema);
