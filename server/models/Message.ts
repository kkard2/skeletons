import { Schema, model } from 'mongoose';
import { Message } from '../../shared/types';

const messageSchema = new Schema<Message>({
    sender: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
});

export default model<Message>('Message', messageSchema);
