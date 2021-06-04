const mongoose = require("mongoose");
const socketio = require("./socket");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const roomHelper = require("./utils/joinRoom");
const User = require("./model/userModel");
const Room = require("./model/roomModel");
const Message = require("./model/messageModel");
const app = require("./app");
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((database) => {
    console.log("db connection successfull");
  });
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

const io = socketio.init(server);

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("setUser",(fullname)=>{
    socket.fullname = fullname
  })

  socket.on("roomToJoin", (room) => {
    roomHelper.joinRoom(socket, room);    
  });

  socket.on("leaveEvent",(room)=>{
    socket.leave(room);
    io.to(room).emit("leaveEvent",{
      type:"leave",
      content:`${socket.fullname} has left`
    })
  })
  socket.on("messageToServer", async (msg) => {
    const roomTitle = Array.from(socket.rooms)[1];    
    let message = JSON.parse(msg);
    const sender = await User.findOne({ email: message.sender });
    const room = await Room.findOne({ name: message.room });
    
    const newMessage = Message({
      message: message.message,
      sender: sender._id,
      room: room._id,
      createdAt:message.createdAt
    });
    await newMessage.save();
    message = {
      ...message,
      sender:socket.fullname
    }
    console.log(message);
    io.to(roomTitle).emit("messageToClient", message);
  });
});
