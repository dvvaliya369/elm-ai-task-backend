import { Server as SocketIOServer, Socket } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socket.middleware";

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set of roomIds

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  // User connection management
  addUser(userId: string, socketId: string): void {
    this.connectedUsers.set(userId, socketId);
    console.log(`User ${userId} connected with socket ${socketId}`);
  }

  removeUser(userId: string): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.connectedUsers.delete(userId);
      this.userRooms.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Room management
  joinRoom(userId: string, roomId: string, socket: Socket): void {
    socket.join(roomId);
    
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)?.add(roomId);
    
    console.log(`User ${userId} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user_joined_room', {
      userId,
      roomId,
      timestamp: new Date().toISOString()
    });
  }

  leaveRoom(userId: string, roomId: string, socket: Socket): void {
    socket.leave(roomId);
    
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.delete(roomId);
    }
    
    console.log(`User ${userId} left room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user_left_room', {
      userId,
      roomId,
      timestamp: new Date().toISOString()
    });
  }

  getUserRooms(userId: string): string[] {
    return Array.from(this.userRooms.get(userId) || []);
  }

  // Messaging
  sendMessageToRoom(roomId: string, message: any, excludeSocketId?: string): void {
    if (excludeSocketId) {
      this.io.to(roomId).except(excludeSocketId).emit('receive_message', message);
    } else {
      this.io.to(roomId).emit('receive_message', message);
    }
  }

  sendPrivateMessage(targetUserId: string, message: any): boolean {
    const targetSocketId = this.connectedUsers.get(targetUserId);
    if (targetSocketId) {
      this.io.to(targetSocketId).emit('private_message', message);
      return true;
    }
    return false;
  }

  // Broadcasting
  broadcastToAll(event: string, data: any, excludeSocketId?: string): void {
    if (excludeSocketId) {
      this.io.except(excludeSocketId).emit(event, data);
    } else {
      this.io.emit(event, data);
    }
  }

  broadcastToRoom(roomId: string, event: string, data: any, excludeSocketId?: string): void {
    if (excludeSocketId) {
      this.io.to(roomId).except(excludeSocketId).emit(event, data);
    } else {
      this.io.to(roomId).emit(event, data);
    }
  }

  // Typing indicators
  handleTyping(userId: string, roomId: string, isTyping: boolean, socket: Socket): void {
    socket.to(roomId).emit('typing_status', {
      userId,
      roomId,
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  // Presence
  broadcastUserPresence(userId: string, status: 'online' | 'offline'): void {
    this.io.emit('user_presence', {
      userId,
      status,
      timestamp: new Date().toISOString()
    });
  }

  // Get room members
  async getRoomMembers(roomId: string): Promise<string[]> {
    const sockets = await this.io.in(roomId).fetchSockets();
    return sockets.map(socket => (socket as any).userId).filter(Boolean) as string[];
  }
}