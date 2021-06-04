const Room = require("./../model/roomModel");
const Message = require("./../model/messageModel");

exports.addRoom = async (req, res, next) => {
  try {
    const name = req.body.name;
    const doc = await Room.findOne({ name });
    if (doc) {
      const err = new Error("Room already exists");
      err.statusCode = 409;
      return next(err);
    }
    const newRoom = new Room({
      name,
      createdBy: req.userId,
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
      .populate("sender", { firstname: 1,lastname:1, _id: 0 })
      .lean()
      .exec(function (err, doc) {
        doc.map((obj) => {
          obj.sender = `${obj.sender.firstname} ${obj.sender.lastname}`;
          return obj;
        });
        res.status(200).json(doc);
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
