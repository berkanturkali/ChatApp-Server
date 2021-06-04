const io = require("./../socket");
exports.joinRoom = function (socket, room) {
  const roomToLeave = Array.from(socket.rooms)[1];
  console.log(roomToLeave);
  socket.leave(roomToLeave);
  socket.join(room);
  io.getIO()
    .to(room)
    .emit("joinEvent", {
      type: "join",
      content: `${socket.fullname} has joined`,
    });
};
