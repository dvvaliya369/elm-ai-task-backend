# Socket.IO Real-time Communication

This project now includes Socket.IO for real-time communication features.

## Features

- **Authentication**: JWT-based socket authentication
- **Room Management**: Join/leave rooms for group communications
- **Private Messaging**: Direct user-to-user messaging
- **Notifications**: Real-time notifications
- **Typing Indicators**: Show when users are typing
- **Status Updates**: User online/offline status
- **System Messages**: Broadcast messages to all users

## Client Connection

### Basic Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});
```

### With Authorization Header
```javascript
const socket = io('http://localhost:8000', {
  extraHeaders: {
    Authorization: 'Bearer your-jwt-token-here'
  }
});
```

## Socket Events

### Connection Events
```javascript
// Connection successful
socket.on('connect', () => {
  console.log('Connected to server');
});

// Connection error
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});

// Disconnection
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

### Room Management
```javascript
// Join a room
socket.emit('join_room', { roomId: 'room123' });

// Leave a room
socket.emit('leave_room', { roomId: 'room123' });

// Listen for room events
socket.on('room_joined', (data) => {
  console.log('Joined room:', data.roomId);
});

socket.on('user_joined_room', (data) => {
  console.log(`User ${data.userId} joined room ${data.roomId}`);
});
```

### Messaging
```javascript
// Send message to room
socket.emit('send_message', {
  roomId: 'room123',
  message: 'Hello everyone!',
  messageType: 'text'
});

// Send private message
socket.emit('send_private_message', {
  targetUserId: 'user456',
  message: 'Hello there!',
  messageType: 'text'
});

// Listen for messages
socket.on('new_message', (data) => {
  console.log('New message:', data);
});

socket.on('private_message', (data) => {
  console.log('Private message from:', data.fromUserId, data.message);
});
```

### Notifications
```javascript
// Send notification
socket.emit('send_notification', {
  targetUserId: 'user456',
  notification: 'You have a new follower!',
  notificationType: 'info'
});

// Listen for notifications
socket.on('notification', (data) => {
  console.log('Notification:', data.notification);
});
```

### Typing Indicators
```javascript
// Start typing
socket.emit('typing_start', { roomId: 'room123' });

// Stop typing
socket.emit('typing_stop', { roomId: 'room123' });

// Listen for typing events
socket.on('user_typing', (data) => {
  if (data.isTyping) {
    console.log(`User ${data.userId} is typing...`);
  } else {
    console.log(`User ${data.userId} stopped typing`);
  }
});
```

### Status Updates
```javascript
// Update your status
socket.emit('update_status', { status: 'online' });

// Listen for status updates
socket.on('user_status_update', (data) => {
  console.log(`User ${data.userId} is now ${data.status}`);
});
```

### System Messages
```javascript
// Listen for system messages
socket.on('system_message', (data) => {
  console.log('System:', data.message);
});
```

## Server-side Usage

### Using Socket Service
```typescript
import { getSocketService } from './socket';

// Get the socket service instance
const socketService = getSocketService();

// Send notification to user
socketService.sendNotificationToUser('user123', {
  title: 'New Post',
  message: 'Someone liked your post!'
});

// Send message to room
socketService.sendMessageToRoom('room123', {
  message: 'Welcome to the room!',
  type: 'system'
});

// Broadcast system message
socketService.broadcastSystemMessage('Server maintenance in 5 minutes');
```

### Integration with Routes
```typescript
// In your route handlers
import { getSocketService } from '../socket';

export const createPost = async (req: Request, res: Response) => {
  // ... create post logic
  
  // Notify followers about new post
  const socketService = getSocketService();
  socketService.sendPostUpdate(post.id, 'created', post);
  
  res.json({ success: true, post });
};
```

## Error Handling

```javascript
// Listen for socket errors
socket.on('error', (error) => {
  console.error('Socket error:', error.message);
});

// Handle force disconnect
socket.on('force_disconnect', (data) => {
  console.log('Disconnected by server:', data.reason);
});
```

## Environment Variables

Make sure these environment variables are set:
- `JWT_SECRET_AUTH`: Your JWT secret for authentication
- `PORT`: Server port (default: 8000)

## CORS Configuration

Socket.IO uses the same CORS configuration as your Express app, defined in `config/cors.config.ts`.