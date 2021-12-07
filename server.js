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

const typingUsers =[];

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
  socket.on("setUser", async (fullname, email) => {
    socket.fullname = fullname;
    socket.email = email;
  });

  socket.on("typing",(data)=>{      
    const user = data.user;
    if(data.isTyping){
      if(!typingUsers.includes(user)){
      typingUsers.push(user);
      }
    }else{
      const index = typingUsers.indexOf(user);
      if(index > -1) typingUsers.splice(index,1);  
    }
    socket.to(data.room).emit("displayTyping",data.isTyping,typingUsers);
  })
  socket.on("roomToJoin", (room) => {
    roomHelper.joinRoom(socket, room);
  });


  socket.on("leaveEvent", async (room) => {
    socket.leave(room);
    io.to(room).emit("leaveEvent", {
      type: "leave",
      content: `${socket.fullname} has left`
    })
    const index = typingUsers.indexOf(socket.fullname);
    if(index > -1) typingUsers.splice(index,1); 
    const clients = await io.in(room).allSockets();
    io.in(room).emit("displayTyping",false,typingUsers);
    io.in(room).emit('updateMembers', Array.from(clients).length);
  })
  socket.on("messageToServer", async (msg) => {
    const roomTitle = Array.from(socket.rooms)[1];
    const message = await createNewMessage(msg, socket);
    io.to(roomTitle).emit("messageToClient", message);
  });
  socket.on("unsend",async(id) =>{
      const deleted = await unsend(id);   
      if(deleted){
        io.to(Array.from(socket.rooms)[1]).emit("deletedMessageId",id);
      }else{
        io.to(Array.from(socket.rooms)[1]).emit("deletedMessageId","-1");
      }
  })
});

async function unsend(id){
  try{
    await Message.findByIdAndDelete(id);
    return true;
  }catch(err){
    console.log(err);
    return false;
  }
}

async function createNewMessage(msg, socket) {
  let message = JSON.parse(msg);
  try {
    const sender = await User.findOne({ email: message.sender });
    const room = await Room.findOne({ name: message.room });
    const newMessage = await Message({
      message: message.message,
      sender: sender._id,
      room:room._id ,
      createdAt: message.createdAt
    }).save();
    message = {
      ...message,
      sender: socket.fullname,
      _id:newMessage._id    
    }
    return message;
  } catch (err) {
    console.log(err);
  }
}


