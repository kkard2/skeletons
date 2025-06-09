import { Server, Socket } from 'socket.io';
import { verifySocketToken } from '../middleware/auth';
import Message from '../models/Message';

interface AuthorizedSocket extends Socket {
    userId: string;
}

export function initSocket(io: Server) {
    io.use(verifySocketToken);
    io.on('connection', socketInput => {
        const socket = socketInput as AuthorizedSocket;

        socket.on('joinChannel', (channelId: string) => {
            socket.join(channelId);
            io.to(channelId).emit('userJoined', socket.userId);
        });

        socket.on('leaveChannel', (channelId: string) => {
            socket.leave(channelId);
            io.to(channelId).emit('userLeft', socket.userId);
        });

        socket.on('newMessage', async (data: { content: string; channelId: string }) => {
            const msg = await Message.create({
                content: data.content,
                channelId: data.channelId,
                senderId: socket.userId,
            });
            io.to(data.channelId).emit('newMessage', msg);
        });
    });
}
