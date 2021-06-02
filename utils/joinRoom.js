exports.joinRoom = function(socket,room){
    const roomToLeave = Array.from(socket.rooms)[1];
    socket.leave(roomToLeave);
    socket.join(room);
}