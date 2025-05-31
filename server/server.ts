import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import Message from './models/Message';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('client'));

mongoose.connect('mongodb://localhost:27017/messagingapp');

io.on('connection', (socket) => {
    socket.on('send-message', async (data) => {
        const message = new Message(data);
        await message.save();
        io.emit('new-message', message);
    });
});

server.listen(3000);
