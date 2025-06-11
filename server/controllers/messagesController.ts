import { Response } from 'express';
import Message from '../models/Message';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export async function sendMessage(req: AuthRequest, res: Response) {
    const senderId = req.userId;
    const { receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
        return res.status(404).json({ error: 'User not found' });
    }

    const message = new Message({ senderId, receiverId, content, timestamp: new Date() });
    await message.save();

    res.status(201).json({ message: 'Message sent' });
}

export async function deleteMessage(req: AuthRequest, res: Response) {
    const userId = req.userId;
    const messageId = req.params.messageId;

    if (!userId || !messageId) {
        return res.status(400).json({ error: 'Missing user or message ID' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId.toString() !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await message.deleteOne();

    res.status(200).json({ message: 'Message deleted' });
}


export async function getMessages(req: AuthRequest, res: Response) {
    const userId = req.userId;
    const otherUserId = req.query.otherUserId;

    if (!userId || !otherUserId) {
        return res.status(400).json({ error: 'Missing user IDs' });
    }

    const messages = await Message.find({
        $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId }
        ]
    }).sort({ timestamp: 1 });

    res.status(200).json({ messages });
}

export async function getConversations(req: AuthRequest, res: Response) {
    const userId = req.userId;

    const messages = await Message.find({
        $or: [{ senderId: userId }, { receiverId: userId }]
    }).select('senderId receiverId -_id');

    const userIds = new Set<string>();
    messages.forEach(msg => {
        if (msg.senderId !== userId) userIds.add(msg.senderId);
        if (msg.receiverId !== userId) userIds.add(msg.receiverId);
    });

    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('username _id');
    res.status(200).json({ conversations: users });
}

export async function startConversationByUsername(req: AuthRequest, res: Response) {
    const senderId = req.userId;
    const { username } = req.body;

    if (!senderId || !username) {
        return res.status(400).json({ error: 'Missing sender ID or username' });
    }

    const receiver = await User.findOne({ username });
    if (!receiver) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!receiver._id) {
        return res.status(404).json({ error: 'User not found' });
    }

    const message = new Message({
        senderId,
        receiverId: receiver._id,
        content: '👋',
        timestamp: new Date()
    });

    await message.save();

    res.status(201).json({});
}
