import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('campuskart_token');
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      autoConnect: false,
    });
  }
  return socket;
};
