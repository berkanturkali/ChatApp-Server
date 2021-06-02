const Room = require("./../model/roomModel");

exports.addRoom = async (req, res, next) => {
  try {
      console.log(req.body);
    const name = req.body.name;
    const doc = await Room.findOne({ name });
    if (doc) {
      const err = new Error("Room already exists");
      err.statusCode = 409;
      return next(err);
    }
    const newRoom = new Room({
        name,
        createdBy:req.userId
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
