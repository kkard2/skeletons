import { Schema, model } from 'mongoose';

const MessageSchema = new Schema({
    content: { type: String, required: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default model('Message', MessageSchema);
