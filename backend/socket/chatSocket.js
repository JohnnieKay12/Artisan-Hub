const { ChatMessage, Conversation, User, Artisan } = require('../models');
const jwt = require('jsonwebtoken');

// Store connected users
const connectedUsers = new Map();

const chatSocket = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userType = decoded.userType;

      // Fetch user details
      let user;
      if (decoded.userType === 'artisan') {
        user = await Artisan.findById(decoded.id).select('firstName lastName profileImage');
      } else {
        user = await User.findById(decoded.id).select('firstName lastName avatar');
      }

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userType})`);

    // Store user connection
    connectedUsers.set(socket.userId.toString(), {
      socketId: socket.id,
      userType: socket.userType,
      user: socket.user
    });

    // Join user's room for direct messages
    socket.join(`user_${socket.userId}`);

    // Join conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation: ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation: ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { conversationId, recipientId } = data;
      
      // Notify recipient
      const recipientSocket = connectedUsers.get(recipientId);
      if (recipientSocket) {
        io.to(recipientSocket.socketId).emit('user_typing', {
          conversationId,
          userId: socket.userId,
          userType: socket.userType
        });
      }
    });

    // Handle stop typing
    socket.on('stop_typing', (data) => {
      const { conversationId, recipientId } = data;
      
      const recipientSocket = connectedUsers.get(recipientId);
      if (recipientSocket) {
        io.to(recipientSocket.socketId).emit('user_stop_typing', {
          conversationId,
          userId: socket.userId,
          userType: socket.userType
        });
      }
    });

    // Handle send message
    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, message, messageType = 'text', attachments, relatedBooking } = data;

        // Verify conversation exists
        const conversation = await Conversation.findOne({ conversationId });
        
        if (!conversation) {
          if (callback) callback({ success: false, error: 'Conversation not found' });
          return;
        }

        // Check if user is part of the conversation
        const isUser = conversation.user.toString() === socket.userId;
        const isArtisan = conversation.artisan.toString() === socket.userId;

        if (!isUser && !isArtisan) {
          if (callback) callback({ success: false, error: 'Not authorized' });
          return;
        }

        const senderModel = isUser ? 'User' : 'Artisan';
        const recipient = isUser ? conversation.artisan : conversation.user;
        const recipientModel = isUser ? 'Artisan' : 'User';

        // Create message
        const chatMessage = await ChatMessage.create({
          conversationId,
          sender: socket.userId,
          senderModel,
          recipient,
          recipientModel,
          message,
          messageType,
          attachments,
          relatedBooking
        });

        // Populate sender info
        await chatMessage.populate('sender', 'firstName lastName avatar profileImage');

        // Update conversation
        conversation.lastMessage = {
          message,
          sender: socket.userId,
          senderModel,
          createdAt: new Date()
        };

        // Increment unread count for recipient
        if (isUser) {
          conversation.unreadCount.artisan += 1;
        } else {
          conversation.unreadCount.user += 1;
        }

        await conversation.save();

        // Broadcast message to conversation room
        io.to(conversationId).emit('new_message', {
          message: chatMessage,
          conversationId
        });

        // Notify recipient if online
        const recipientSocket = connectedUsers.get(recipient.toString());
        if (recipientSocket) {
          io.to(recipientSocket.socketId).emit('new_notification', {
            type: 'message',
            message: {
              id: chatMessage._id,
              conversationId,
              sender: {
                id: socket.userId,
                name: `${socket.user.firstName} ${socket.user.lastName}`,
                avatar: socket.user.avatar || socket.user.profileImage
              },
              text: message,
              createdAt: chatMessage.createdAt
            }
          });
        }

        if (callback) callback({ success: true, data: chatMessage });
      } catch (error) {
        console.error('Send message error:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Handle mark as read
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId } = data;

        await ChatMessage.updateMany(
          {
            conversationId,
            recipient: socket.userId,
            isRead: false
          },
          { isRead: true, readAt: new Date() }
        );

        // Update conversation unread count
        const conversation = await Conversation.findOne({ conversationId });
        if (conversation) {
          if (socket.userType === 'user') {
            conversation.unreadCount.user = 0;
          } else {
            conversation.unreadCount.artisan = 0;
          }
          await conversation.save();
        }

        // Notify other user that messages have been read
        socket.to(conversationId).emit('messages_read', {
          conversationId,
          readBy: socket.userId
        });
      } catch (error) {
        console.error('Mark as read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId.toString());
    });
  });

  return {
    getConnectedUsers: () => Array.from(connectedUsers.keys()),
    isUserOnline: (userId) => connectedUsers.has(userId.toString())
  };
};

module.exports = chatSocket;
