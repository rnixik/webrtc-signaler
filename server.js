'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const socketIo = require('socket.io');

function log(entry) {
    if (typeof entry === 'object' && entry instanceof Error) {
        console.log((new Date()) + ': Error: ');
        console.error(entry);
        return;
    }
    console.log((new Date()) + ': ' + entry);
}

let server;
let port;
if (process.env.HTTPS_CERT_KEY && process.env.HTTPS_CERT) {
    log('Using HTTPS certificate');
    const options = {
        key: fs.readFileSync(process.env.HTTPS_CERT_KEY),
        cert: fs.readFileSync(process.env.HTTPS_CERT),
    };
    server = https.createServer(options, (request, response) => {});
    port = 443;
} else {
    log('Certificate has not been specified. Using HTTP server.');
    server = http.createServer((request, response) => {});
    port = 80;
}

const webSocketsServerPort = process.env.PORT || port;
server.listen(webSocketsServerPort, () => {
    log("Server is listening on port " + webSocketsServerPort);
});

const io = socketIo.listen(server);

const users = {};

io.on('connection', (socket) => {
    socket.on('room', (message) => {
        try {
            const json = JSON.parse(message);
            users[json.id] = socket;

            socket.room = json.room;
            socket.join(socket.room);
            socket.userId = json.id;
            socket.to(socket.room).emit('new', json.id);
        } catch (e) {
            log(e);
        }
    });

    socket.on('webrtc', (message) => {
        try {
            const json = JSON.parse(message);
            if (json.to !== undefined && users[json.to] !== undefined) {
                users[json.to].emit('webrtc', message);
            }
        } catch (e) {
            log(e);
        }
    });

    socket.on('disconnect', () => {
        if (!socket.room || !socket.userId) {
            return;
        }
        socket.broadcast.to(socket.room).emit('leave', socket.userId);
        delete users[socket.userId];
    });
});
