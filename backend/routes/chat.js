const express = require('express');
const router = express.Router();
const { chatController } = require('../controllers');
const { protect } = require('../middlewares/auth');

// Get or create conversation
router.post('/conversations', protect, chatController.getOrCreateConversation);

// Get user's conversations
router.get('/conversations', protect, chatController.getConversations);

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', protect, chatController.getMessages);

// Mark messages as read
router.put('/conversations/:conversationId/read', protect, chatController.markAsRead);

// Send message
router.post('/messages', protect, chatController.sendMessage);

// Get unread message count
router.get('/unread-count', protect, chatController.getUnreadCount);

// Delete message
router.delete('/messages/:id', protect, chatController.deleteMessage);

module.exports = router;
