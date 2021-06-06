const io = require("./../socket");
exports.joinRoom = function (socket, room) {
  const roomToLeave = Array.from(socket.rooms)[1];
  socket.leave(roomToLeave);
  updateUsersInRoom(room);
  socket.join(room);
  io.getIO()
    .to(room)
    .emit("joinEvent", {
      type: "join",
      content: `${socket.fullname} has joined`
    });
};
async function updateUsersInRoom(room){
  const clients = await io.getIO().in(room).allSockets();
  io.getIO().in(room).emit('updateMembers',Array.from(clients).length);
}
