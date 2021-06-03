import express from 'express';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.Server(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:4000",
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });


});

server.listen(process.env.APIPORT || 4040, () => {
    console.log(`APIServer IS RUNNING, TALKING TO API SERVER ON ${process.env.APIPORT || 4040}`);
});
