import Letter from "../models/letter.model.js";
import extend from "lodash/extend.js";
import errorHandler from "../helpers/dbErrorHandler.js";

const create = async (req, res) => {
  try {
    console.log("Creating letter with body:", req.body);
    console.log("Auth user:", req.auth);
    
    const letter = new Letter(req.body);
    letter.author = req.auth._id; // Use req.auth._id instead of req.profile._id
    
    console.log("Letter before save:", letter);
    const savedLetter = await letter.save();
    console.log("Letter saved successfully:", savedLetter);
    
    return res.status(200).json({
      message: "Letter created successfully!",
      letter: savedLetter
    });
  } catch (err) {
    console.error("Error creating letter:", err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const list = async (req, res) => {
  try {
    console.log("Fetching letters...");
    let letters = await Letter.find()
      .populate("author", "_id name")
      .sort({ created: -1 })
      .exec();
    console.log("Letters found:", letters.length);
    console.log("Letters data:", letters);
    res.json(letters);
  } catch (err) {
    console.error("Error fetching letters:", err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const letterByID = async (req, res, next, id) => {
  try {
    let letter = await Letter.findById(id).populate("author", "_id name").exec();
    if (!letter)
      return res.status(400).json({
        error: "Letter not found",
      });
    req.letter = letter;
    next();
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve letter",
    });
  }
};

const read = (req, res) => {
  return res.json(req.letter);
};

const update = async (req, res) => {
  try {
    console.log("Updating letter:", req.letter._id);
    console.log("Update data:", req.body);
    console.log("Auth user:", req.auth);
    
    let letter = req.letter;
    letter = extend(letter, req.body);
    letter.updated = Date.now();
    
    const updatedLetter = await letter.save();
    console.log("Letter updated successfully:", updatedLetter);
    
    res.json(updatedLetter);
  } catch (err) {
    console.error("Error updating letter:", err);
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const remove = async (req, res) => {
  try {
    let letter = req.letter;
    let deletedLetter = await letter.deleteOne();
    res.json(deletedLetter);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const hasAuthorization = (req, res, next) => {
  const authorized = req.letter && req.auth && req.letter.author._id == req.auth._id;
  if (!authorized) {
    return res.status(403).json({
      error: "User is not authorized",
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.auth || !req.auth.admin) {
    return res.status(403).json({
      error: "Admin access required",
    });
  }
  next();
};

export default {
  create,
  letterByID,
  read,
  list,
  remove,
  update,
  hasAuthorization,
  requireAdmin,
};
