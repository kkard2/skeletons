"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const socket_io_1 = require("socket.io");
const Message_1 = __importDefault(require("./models/Message"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(express_1.default.static('client'));
mongoose_1.default.connect('mongodb://localhost:27017/messagingapp');
io.on('connection', (socket) => {
    socket.on('send-message', async (data) => {
        const message = new Message_1.default(data);
        await message.save();
        io.emit('new-message', message);
    });
});
server.listen(3000);
