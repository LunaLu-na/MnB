import Album from "../models/album.model.js";
import extend from "lodash/extend.js";
import errorHandler from "../helpers/dbErrorHandler.js";

const create = async (req, res) => {
  try {
    const album = new Album(req.body);
    album.author = req.auth._id; // Use req.auth._id instead of req.profile._id
    await album.save();
    return res.status(200).json({
      message: "Album created successfully!",
    });
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const list = async (req, res) => {
  try {
    let albums = await Album.find({ isPublic: true })
      .populate("author", "_id name")
      .sort({ created: -1 })
      .exec();
    res.json(albums);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listAll = async (req, res) => {
  try {
    let albums = await Album.find()
      .populate("author", "_id name")
      .sort({ created: -1 })
      .exec();
    res.json(albums);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const albumByID = async (req, res, next, id) => {
  try {
    let album = await Album.findById(id).populate("author", "_id name").exec();
    if (!album)
      return res.status(400).json({
        error: "Album not found",
      });
    req.album = album;
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve album",
    });
  }
};

const read = (req, res) => {
  return res.json(req.album);
};

const update = async (req, res) => {
  try {
    let album = req.album;
    album = extend(album, req.body);
    album.updated = Date.now();
    await album.save();
    res.json(album);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  try {
    let album = req.album;
    let deletedAlbum = await album.deleteOne();
    res.json(deletedAlbum);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const addMedia = async (req, res) => {
  try {
    let album = req.album;
    album.media.push(req.body);
    album.updated = Date.now();
    await album.save();
    res.json(album);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const removeMedia = async (req, res) => {
  try {
    let album = req.album;
    album.media.id(req.params.mediaId).remove();
    album.updated = Date.now();
    await album.save();
    res.json(album);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const hasAuthorization = (req, res, next) => {
  const authorized = req.album && req.auth && req.album.author._id == req.auth._id;
  if (!authorized) {
    return res.status(403).json({
      error: "User is not authorized",
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  console.log("requireAdmin - req.auth:", req.auth);
  console.log("requireAdmin - req.auth.admin:", req.auth?.admin);
  
  if (!req.auth || !req.auth.admin) {
    console.log("Access denied - not admin");
    return res.status(403).json({
      error: "Admin access required",
    });
  }
  console.log("Admin access granted");
  next();
};

export default {
  create,
  albumByID,
  read,
  list,
  listAll,
  remove,
  update,
  addMedia,
  removeMedia,
  hasAuthorization,
  requireAdmin,
};
