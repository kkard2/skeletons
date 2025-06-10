import 'dotenv/config';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import auth from './routes/auth';
import messages from './routes/messages';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('client'));

app.use('/api/auth', auth);
app.use('/api/messages', messages);

mongoose.connect('mongodb://localhost:27017/skeletons');

server.listen(3000);
