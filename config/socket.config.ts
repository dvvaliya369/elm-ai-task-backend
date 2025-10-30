import { Server as SocketIOServer, ServerOptions } from "socket.io";
import { Server as HTTPServer } from "http";
import corsOption from "./cors.config";

const socketConfig: Partial<ServerOptions> = {
  cors: {
    origin: corsOption.origin || "*",
    methods: ["GET", "POST"],
    credentials: corsOption.credentials || true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
};

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(server, socketConfig);
  
  console.log("Socket.IO server initialized");
  return io;
};

export default socketConfig;