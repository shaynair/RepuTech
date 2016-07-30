// This file handles the e-mail verification system.

// Requires
const socketio = require('socket.io');

// Sets up the socket listening events
const setupEvents = (socket, serverInfo) => {
    
}


// Method to start the socket.io server
exports.run = (server, serverInfo) => {
    socketio.listen(server).on("connection", (socket) => {
        setupEvents(socket, serverInfo);
    });
}