import { Server as SocketIOServer } from "socket.io";
import { AuthenticatedSocket, socketAuthMiddleware, socketRateLimitMiddleware } from "../middleware/socket.middleware";
import { SocketService } from "../service/socket.service";

let socketService: SocketService;

export const setupSocketHandlers = (io: SocketIOServer): void => {
  socketService = new SocketService(io);

  // Apply middleware
  io.use(socketAuthMiddleware);
  io.use(socketRateLimitMiddleware);

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.id} for user: ${socket.userId}`);

    // Add user to connected users
    if (socket.userId) {
      socketService.addUser(socket.userId, socket.id);
      socketService.broadcastUserPresence(socket.userId, 'online');
    }

    // Handle authentication confirmation
    socket.on('authenticate', (callback) => {
      if (socket.userId) {
        callback({
          success: true,
          userId: socket.userId,
          message: 'Authentication successful'
        });
      } else {
        callback({
          success: false,
          message: 'Authentication failed'
        });
      }
    });

    // Handle joining rooms
    socket.on('join_room', (data: { roomId: string }, callback) => {
      try {
        const { roomId } = data;
        
        if (!roomId || !socket.userId) {
          return callback?.({
            success: false,
            message: 'Room ID and user authentication required'
          });
        }

        socketService.joinRoom(socket.userId, roomId, socket);
        
        callback?.({
          success: true,
          message: `Joined room ${roomId}`,
          roomId
        });
      } catch (error) {
        console.error('Error joining room:', error);
        callback?.({
          success: false,
          message: 'Failed to join room'
        });
      }
    });

    // Handle leaving rooms
    socket.on('leave_room', (data: { roomId: string }, callback) => {
      try {
        const { roomId } = data;
        
        if (!roomId || !socket.userId) {
          return callback?.({
            success: false,
            message: 'Room ID and user authentication required'
          });
        }

        socketService.leaveRoom(socket.userId, roomId, socket);
        
        callback?.({
          success: true,
          message: `Left room ${roomId}`,
          roomId
        });
      } catch (error) {
        console.error('Error leaving room:', error);
        callback?.({
          success: false,
          message: 'Failed to leave room'
        });
      }
    });

    // Handle sending messages to rooms
    socket.on('send_message', (data: { roomId: string; message: string; type?: string }, callback) => {
      try {
        const { roomId, message, type = 'text' } = data;
        
        if (!roomId || !message || !socket.userId) {
          return callback?.({
            success: false,
            message: 'Room ID, message, and user authentication required'
          });
        }

        const messageData = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: socket.userId,
          roomId,
          message,
          type,
          timestamp: new Date().toISOString()
        };

        socketService.sendMessageToRoom(roomId, messageData, socket.id);
        
        callback?.({
          success: true,
          message: 'Message sent',
          messageId: messageData.id
        });
      } catch (error) {
        console.error('Error sending message:', error);
        callback?.({
          success: false,
          message: 'Failed to send message'
        });
      }
    });

    // Handle private messages
    socket.on('send_private_message', (data: { targetUserId: string; message: string }, callback) => {
      try {
        const { targetUserId, message } = data;
        
        if (!targetUserId || !message || !socket.userId) {
          return callback?.({
            success: false,
            message: 'Target user ID, message, and user authentication required'
          });
        }

        const messageData = {
          id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fromUserId: socket.userId,
          toUserId: targetUserId,
          message,
          timestamp: new Date().toISOString()
        };

        const sent = socketService.sendPrivateMessage(targetUserId, messageData);
        
        callback?.({
          success: sent,
          message: sent ? 'Private message sent' : 'User not online',
          messageId: messageData.id
        });
      } catch (error) {
        console.error('Error sending private message:', error);
        callback?.({
          success: false,
          message: 'Failed to send private message'
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
      try {
        const { roomId, isTyping } = data;
        
        if (!roomId || !socket.userId) {
          return;
        }

        socketService.handleTyping(socket.userId, roomId, isTyping, socket);
      } catch (error) {
        console.error('Error handling typing:', error);
      }
    });

    // Handle getting online users
    socket.on('get_online_users', (callback) => {
      try {
        const onlineUsers = socketService.getConnectedUsers();
        callback?.({
          success: true,
          users: onlineUsers
        });
      } catch (error) {
        console.error('Error getting online users:', error);
        callback?.({
          success: false,
          message: 'Failed to get online users'
        });
      }
    });

    // Handle getting room members
    socket.on('get_room_members', async (data: { roomId: string }, callback) => {
      try {
        const { roomId } = data;
        
        if (!roomId) {
          return callback?.({
            success: false,
            message: 'Room ID required'
          });
        }

        const members = await socketService.getRoomMembers(roomId);
        callback?.({
          success: true,
          members
        });
      } catch (error) {
        console.error('Error getting room members:', error);
        callback?.({
          success: false,
          message: 'Failed to get room members'
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} for user: ${socket.userId}, reason: ${reason}`);
      
      if (socket.userId) {
        socketService.removeUser(socket.userId);
        socketService.broadcastUserPresence(socket.userId, 'offline');
      }
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  console.log('Socket.IO event handlers setup complete');
};

// Export socket service for use in other parts of the application
export const getSocketService = (): SocketService | undefined => {
  return socketService;
};