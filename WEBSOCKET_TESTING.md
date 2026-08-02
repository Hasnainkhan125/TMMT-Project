# TAMMAT WebSocket Chat Testing Guide

This document explains how to test the real-time WebSocket chat functionality with immigration officers.

## Overview

The TAMMAT platform now includes real-time communication capabilities using WebSockets, allowing users to:
- Chat with immigration officers in real-time
- Send and receive messages instantly
- Share files and documents
- Make voice and video calls (mock implementation)
- See typing indicators and online status

## Prerequisites

1. **Backend Server**: Ensure the TAMMAT backend is running on port 5001
2. **Frontend**: Start the TAMMAT frontend development server
3. **Dependencies**: Both frontend and backend should have Socket.IO installed

## Testing Steps

### 1. Start the Backend Server

```bash
cd tammat-backend
npm start
```

The server should start and show:
```
🚀 TAMMAT Visa Services Platform listening at http://127.0.0.1:5001
🔌 WebSocket server available at ws://127.0.0.1:5001
```

### 2. Start the Frontend

```bash
cd tammat-frontend
npm run dev
```

### 3. Navigate to Chat Test Page

Visit: `http://localhost:5173/chat-test`

### 4. Test WebSocket Connection

1. **Enter Authentication Token**: 
   - For testing purposes, you can use any string as a token
   - In production, this would be a valid JWT token from Clerk authentication

2. **Click Connect**: 
   - The WebSocket connection will be established
   - You should see "Connected" status

3. **Select an Officer**: 
   - Choose from the available immigration officers
   - Each officer has different specialties (Family Visa, Business Visa, etc.)

4. **Start Chat**: 
   - Click "Start Chat" to begin a conversation
   - The chat interface will appear

### 5. Test Chat Features

#### Real-time Messaging
- Type messages in the input field
- Messages are sent via WebSocket
- See typing indicators when the other person is typing

#### File Sharing
- Click the paperclip icon to attach files
- Files are processed and shared via WebSocket
- Support for images, PDFs, and documents

#### Voice/Video Calls
- Click the phone icon for voice calls
- Click the video icon for video calls
- Currently mocked - shows the UI flow

#### Typing Indicators
- Start typing to see "user is typing" indicator
- Stop typing when you finish or blur the input

## WebSocket Events

The system handles these WebSocket events:

### Client to Server
- `join_chat_room`: Join a specific chat room
- `leave_chat_room`: Leave the current chat room
- `send_message`: Send a new message
- `typing_start`: Start typing indicator
- `typing_stop`: Stop typing indicator
- `file_upload_start`: Begin file upload
- `file_upload_complete`: Complete file upload
- `voice_call_request`: Request voice call
- `video_call_request`: Request video call
- `call_end`: End active call

### Server to Client
- `new_message`: Receive new message
- `room_joined`: Confirmation of room join
- `user_typing`: Typing indicator from other user
- `file_upload_start`: File upload started by other user
- `file_upload_complete`: File upload completed by other user
- `voice_call_request`: Incoming voice call request
- `video_call_request`: Incoming video call request
- `call_ended`: Call ended notification

## Backend API Endpoints

The chat system also provides REST API endpoints:

- `GET /api/chat/officers` - Get available immigration officers
- `POST /api/chat/rooms` - Create or join chat room
- `GET /api/chat/rooms/:roomId/messages` - Get room messages
- `POST /api/chat/rooms/:roomId/messages` - Send message
- `PATCH /api/chat/rooms/:roomId/messages/:messageId` - Update message status
- `GET /api/chat/users/:userId/rooms` - Get user's active rooms
- `PATCH /api/chat/rooms/:roomId/end` - End chat room
- `GET /api/chat/rooms/:roomId/stats` - Get room statistics

## Troubleshooting

### Connection Issues
- Ensure backend is running on port 5001
- Check CORS settings in backend
- Verify WebSocket server is properly initialized

### Authentication Issues
- Ensure valid JWT token format
- Check JWT_SECRET environment variable in backend
- Verify token expiration

### Message Delivery Issues
- Check WebSocket connection status
- Verify room joining/leaving logic
- Check message format and validation

## Development Notes

### Frontend Components
- `useWebSocket` hook: Manages WebSocket connections and state
- `ChatInterface`: Main chat UI component
- `ChatTestPage`: Testing interface for WebSocket functionality

### Backend Components
- `WebSocketServer`: Main WebSocket server class
- `chatRoutes.js`: REST API endpoints for chat functionality
- `setupWebSocket`: WebSocket event handlers

### Security Considerations
- JWT token authentication required for WebSocket connections
- File upload validation and size limits
- Rate limiting for message sending
- Input sanitization for chat messages

## Next Steps

1. **Real Voice/Video Calls**: Implement actual WebRTC functionality
2. **File Storage**: Integrate with cloud storage (AWS S3, etc.)
3. **Message Persistence**: Store chat history in MongoDB
4. **Push Notifications**: Add real-time notifications for offline users
5. **Chat Encryption**: Implement end-to-end encryption for sensitive conversations
6. **Officer Management**: Admin interface for managing immigration officers
7. **Chat Analytics**: Track chat metrics and performance

## Testing with Multiple Users

To test real-time functionality with multiple users:

1. Open multiple browser tabs/windows
2. Connect each with different user IDs
3. Join the same chat room
4. Send messages to see real-time delivery
5. Test typing indicators across users

This setup allows you to verify that messages are properly broadcasted to all room participants in real-time. 