# Socket.IO Integration

This project now includes Socket.IO for real-time communication features.

## Features

- **Real-time Authentication**: JWT-based authentication for socket connections
- **Room Management**: Join/leave rooms for organized messaging
- **Messaging**: Send messages to rooms and private messages to users
- **Presence Tracking**: Track online/offline user status
- **Typing Indicators**: Show when users are typing
- **Rate Limiting**: Basic rate limiting for socket events

## Architecture

### Files Added/Modified

- `config/socket.config.ts` - Socket.IO server configuration
- `middleware/socket.middleware.ts` - Authentication and rate limiting middleware
- `service/socket.service.ts` - Business logic for Socket.IO operations
- `controllers/socket.controller.ts` - Event handlers for Socket.IO
- `index.ts` - Updated to create HTTP server and initialize Socket.IO
- `app.ts` - Updated with Socket.IO type declarations

## Socket Events

### Client to Server Events

- `authenticate` - Confirm authentication status
- `join_room` - Join a specific room
- `leave_room` - Leave a specific room
- `send_message` - Send message to a room
- `send_private_message` - Send private message to a user
- `typing` - Send typing indicator
- `get_online_users` - Get list of online users
- `get_room_members` - Get members of a specific room

### Server to Client Events

- `receive_message` - Receive room message
- `private_message` - Receive private message
- `user_joined_room` - User joined a room
- `user_left_room` - User left a room
- `typing_status` - Typing indicator from another user
- `user_presence` - User online/offline status

## Authentication

Socket connections require JWT authentication. Pass the token in one of these ways:

1. **Auth object**: `{ auth: { token: 'your-jwt-token' } }`
2. **Authorization header**: `{ headers: { authorization: 'Bearer your-jwt-token' } }`

## Usage Example

```javascript
// Connect with authentication
const socket = io('http://localhost:8000', {
  auth: { token: 'your-jwt-token' }
});

// Join a room
socket.emit('join_room', { roomId: 'room1' }, (response) => {
  console.log(response.success ? 'Joined!' : 'Failed to join');
});

// Send a message
socket.emit('send_message', { 
  roomId: 'room1', 
  message: 'Hello everyone!' 
}, (response) => {
  console.log('Message sent:', response.success);
});

// Listen for messages
socket.on('receive_message', (data) => {
  console.log(`${data.userId}: ${data.message}`);
});
```

## Testing

A test client is available at `test-socket-client.html`. Open it in a browser to test Socket.IO functionality:

1. Build and start the server: `npm run build && npm start`
2. Open `test-socket-client.html` in a web browser
3. Enter server URL (default: http://localhost:8000)
4. Optionally enter a JWT token for authenticated testing
5. Test various Socket.IO features through the UI

## Configuration

Socket.IO configuration can be modified in `config/socket.config.ts`:

- CORS settings (inherited from Express CORS config)
- Transport methods (websocket, polling)
- Ping timeout and interval settings

## Security Features

- JWT token validation for all socket connections
- Basic rate limiting (100 requests per minute per socket)
- Input validation for all socket events
- Room access control through authentication

## Integration with Existing API

The Socket.IO service can be accessed from REST API endpoints:

```typescript
import { getSocketService } from '../controllers/socket.controller';

// In your REST controller
const socketService = getSocketService();
if (socketService) {
  socketService.sendMessageToRoom('room1', messageData);
}
```

## Environment Variables

No additional environment variables are required. Socket.IO uses the existing JWT configuration from your `.env` file:

- `JWT_SECRET_AUTH` - Used for socket authentication
- `PORT` - Server port (Socket.IO runs on the same port as Express)