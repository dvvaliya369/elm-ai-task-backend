import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket, validateSocketData } from './socket.middleware';

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId} (${socket.id})`);

    // Join user to their personal room
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }

    // Handle joining specific rooms
    socket.on('join_room', (data) => {
      try {
        validateSocketData(data, ['roomId']);
        const { roomId } = data;
        
        socket.join(roomId);
        socket.emit('room_joined', { roomId, message: `Joined room: ${roomId}` });
        socket.to(roomId).emit('user_joined_room', { 
          userId: socket.userId, 
          roomId,
          message: `User ${socket.userId} joined the room`
        });
        
        console.log(`User ${socket.userId} joined room: ${roomId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle leaving specific rooms
    socket.on('leave_room', (data) => {
      try {
        validateSocketData(data, ['roomId']);
        const { roomId } = data;
        
        socket.leave(roomId);
        socket.emit('room_left', { roomId, message: `Left room: ${roomId}` });
        socket.to(roomId).emit('user_left_room', { 
          userId: socket.userId, 
          roomId,
          message: `User ${socket.userId} left the room`
        });
        
        console.log(`User ${socket.userId} left room: ${roomId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle sending messages to rooms
    socket.on('send_message', (data) => {
      try {
        validateSocketData(data, ['roomId', 'message']);
        const { roomId, message, messageType = 'text' } = data;
        
        const messageData = {
          id: Date.now().toString(),
          userId: socket.userId,
          user: socket.user,
          message,
          messageType,
          roomId,
          timestamp: new Date().toISOString()
        };

        // Send to all users in the room except sender
        socket.to(roomId).emit('new_message', messageData);
        
        // Send confirmation to sender
        socket.emit('message_sent', { 
          messageId: messageData.id,
          roomId,
          message: 'Message sent successfully'
        });
        
        console.log(`Message sent by ${socket.userId} to room ${roomId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle private messages
    socket.on('send_private_message', (data) => {
      try {
        validateSocketData(data, ['targetUserId', 'message']);
        const { targetUserId, message, messageType = 'text' } = data;
        
        const messageData = {
          id: Date.now().toString(),
          fromUserId: socket.userId,
          fromUser: socket.user,
          message,
          messageType,
          timestamp: new Date().toISOString()
        };

        // Send to target user
        socket.to(`user_${targetUserId}`).emit('private_message', messageData);
        
        // Send confirmation to sender
        socket.emit('private_message_sent', { 
          messageId: messageData.id,
          targetUserId,
          message: 'Private message sent successfully'
        });
        
        console.log(`Private message sent by ${socket.userId} to ${targetUserId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle notifications
    socket.on('send_notification', (data) => {
      try {
        validateSocketData(data, ['targetUserId', 'notification']);
        const { targetUserId, notification, notificationType = 'info' } = data;
        
        const notificationData = {
          id: Date.now().toString(),
          fromUserId: socket.userId,
          notification,
          notificationType,
          timestamp: new Date().toISOString()
        };

        // Send notification to target user
        socket.to(`user_${targetUserId}`).emit('notification', notificationData);
        
        console.log(`Notification sent by ${socket.userId} to ${targetUserId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      try {
        validateSocketData(data, ['roomId']);
        const { roomId } = data;
        
        socket.to(roomId).emit('user_typing', { 
          userId: socket.userId,
          roomId,
          isTyping: true
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('typing_stop', (data) => {
      try {
        validateSocketData(data, ['roomId']);
        const { roomId } = data;
        
        socket.to(roomId).emit('user_typing', { 
          userId: socket.userId,
          roomId,
          isTyping: false
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle user status updates
    socket.on('update_status', (data) => {
      try {
        validateSocketData(data, ['status']);
        const { status } = data;
        
        // Broadcast status update to all connected clients
        socket.broadcast.emit('user_status_update', {
          userId: socket.userId,
          status,
          timestamp: new Date().toISOString()
        });
        
        console.log(`User ${socket.userId} updated status to: ${status}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userId} (${socket.id}) - Reason: ${reason}`);
      
      // Broadcast user offline status
      socket.broadcast.emit('user_status_update', {
        userId: socket.userId,
        status: 'offline',
        timestamp: new Date().toISOString()
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });
};