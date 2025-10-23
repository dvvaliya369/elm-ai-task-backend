import { Server as SocketIOServer } from 'socket.io';

export class SocketService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user_${userId}`).emit('notification', {
      id: Date.now().toString(),
      notification,
      timestamp: new Date().toISOString()
    });
  }

  // Send notification to multiple users
  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  // Send message to specific room
  sendMessageToRoom(roomId: string, message: any, fromUserId?: string) {
    this.io.to(roomId).emit('new_message', {
      id: Date.now().toString(),
      message,
      fromUserId,
      roomId,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast system message to all connected users
  broadcastSystemMessage(message: string, messageType: string = 'system') {
    this.io.emit('system_message', {
      id: Date.now().toString(),
      message,
      messageType,
      timestamp: new Date().toISOString()
    });
  }

  // Get connected users count
  getConnectedUsersCount(): Promise<number> {
    return new Promise((resolve) => {
      this.io.engine.clientsCount ? resolve(this.io.engine.clientsCount) : resolve(0);
    });
  }

  // Get users in specific room
  getUsersInRoom(roomId: string): Promise<string[]> {
    return new Promise((resolve) => {
      const room = this.io.sockets.adapter.rooms.get(roomId);
      if (room) {
        resolve(Array.from(room));
      } else {
        resolve([]);
      }
    });
  }

  // Force disconnect user
  disconnectUser(userId: string, reason?: string) {
    this.io.to(`user_${userId}`).emit('force_disconnect', {
      reason: reason || 'Disconnected by server',
      timestamp: new Date().toISOString()
    });
    
    // Actually disconnect the socket
    this.io.to(`user_${userId}`).disconnectSockets();
  }

  // Send real-time update for posts (if needed for your app)
  sendPostUpdate(postId: string, updateType: 'created' | 'updated' | 'deleted', postData?: any) {
    this.io.emit('post_update', {
      postId,
      updateType,
      postData,
      timestamp: new Date().toISOString()
    });
  }

  // Send real-time update for user profiles
  sendProfileUpdate(userId: string, profileData: any) {
    this.io.emit('profile_update', {
      userId,
      profileData,
      timestamp: new Date().toISOString()
    });
  }
}

// Singleton instance
let socketServiceInstance: SocketService | null = null;

export const initializeSocketService = (io: SocketIOServer): SocketService => {
  socketServiceInstance = new SocketService(io);
  return socketServiceInstance;
};

export const getSocketService = (): SocketService => {
  if (!socketServiceInstance) {
    throw new Error('Socket service not initialized. Call initializeSocketService first.');
  }
  return socketServiceInstance;
};