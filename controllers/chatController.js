const Room = require("./../model/roomModel");
const Message = require("./../model/messageModel");
const multer = require("multer");
const io = require("./../socket");
const mongoose = require("mongoose");
const User = require("./../model/userModel");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/rooms");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    const err = new Error("Not an image!Please upload only images", 400);
    err.statusCode = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadRoomPhoto = upload.single("image");

exports.addRoom = async (req, res, next) => {
  try {
    let image = "";
    if (req.file) image = req.file.filename;
    const { name } = JSON.parse(req.body.room);
    console.log(name);
    const doc = await Room.findOne({ name });
    if (doc) {
      const err = new Error("Room already exists");
      err.statusCode = 409;
      return next(err);
    }
    const newRoom = new Room({
      name,
      createdBy: req.userId,
      image,
    });

    await newRoom.save();
    res.status(201).send(`${name} room created successfully`);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.rooms = async (req, res, next) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.history = async (req, res, next) => {
  try {
    const room = req.params.room;
    const doc = await Room.findOne({ name: room });
      Message.find({ room: doc._id })
        .populate("sender", { firstname: 1, lastname: 1, _id: 0 })
        .lean()
        .exec(async function (err, doc) {
          doc.map((obj) => {
            obj.sender = `${obj.sender.firstname} ${obj.sender.lastname}`;
            return obj;
          });
          const socket = io.getIO();
          const clients = await socket.in(room).allSockets();
          socket.to(room).emit("updateMembers", Array.from(clients).length);
          res.status(200).json(doc);
        });
    }
   catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
