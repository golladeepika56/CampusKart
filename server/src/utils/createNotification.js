import Notification from '../models/Notification.js';

// Creates a notification in DB. If an io instance + connected socket map is passed,
// also pushes it to the user in real time.
export const createNotification = async ({ userId, type, payload = {}, io, onlineUsers }) => {
  const notification = await Notification.create({ user: userId, type, payload });

  if (io && onlineUsers) {
    const socketId = onlineUsers.get(String(userId));
    if (socketId) {
      io.to(socketId).emit('notification:new', notification);
    }
  }

  return notification;
};
