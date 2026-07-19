import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { createNotification } from '../utils/createNotification.js';

// Map of userId -> socketId, so we know who's online and can push events directly to them.
export const onlineUsers = new Map();

export const registerChatSocket = (io) => {
  // Auth middleware for sockets — expects a JWT passed in the connection handshake.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(String(socket.userId), socket.id);

    socket.on('chat:join', (chatId) => {
      socket.join(chatId);
    });

    socket.on('message:send', async ({ chatId, text }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.some((p) => String(p) === String(socket.userId))) return;

        const message = await Message.create({ chat: chatId, sender: socket.userId, text });
        chat.lastMessageAt = new Date();
        await chat.save();

        io.to(chatId).emit('message:receive', message);

        // Notify the other participant if they're not actively in this chat room
        const otherUserId = chat.participants.find((p) => String(p) !== String(socket.userId));
        if (otherUserId) {
          await createNotification({
            userId: otherUserId,
            type: 'message',
            payload: { chatId, preview: text.slice(0, 80) },
            io,
            onlineUsers,
          });
        }
      } catch (err) {
        console.error('message:send error', err.message);
      }
    });

    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('typing', { userId: socket.userId, isTyping });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(String(socket.userId));
    });
  });
};
