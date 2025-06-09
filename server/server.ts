import 'dotenv/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import auth from './routes/auth';
import { verifySocketToken } from './middleware/auth';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('client'));

app.use('/api/auth', auth);

mongoose.connect('mongodb://localhost:27017/skeletons');

io.use(verifySocketToken);
io.on('connection', (socket) => {
    console.log('connected');
    socket.on('message', async (data) => {
        io.emit('message', data);
    });
});

server.listen(3000);
