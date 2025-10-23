import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import corsOption from '../config/cors.config';

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: corsOption.origin,
      methods: ["GET", "POST"],
      credentials: corsOption.credentials
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  return io;
};

export default initializeSocket;