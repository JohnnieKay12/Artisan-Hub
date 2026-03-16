const { ChatMessage, Conversation, User, Artisan, Booking } = require('../models');
const { getPaginationOptions } = require('../utils/helpers');

// @desc    Get or create conversation
// @route   POST /api/chat/conversations
// @access  Private
const getOrCreateConversation = async (req, res) => {
  try {
    const { userId, artisanId } = req.body;

    // Determine who is initiating
    let user, artisan;
    
    if (req.userType === 'user') {
      user = req.user.id;
      artisan = artisanId;
    } else if (req.userType === 'artisan') {
      user = userId;
      artisan = req.user.id;
    }

    if (!user || !artisan) {
      return res.status(400).json({
        success: false,
        message: 'Both user and artisan IDs are required'
      });
    }

    // Generate conversation ID
    const sortedIds = [user.toString(), artisan.toString()].sort();
    const conversationId = `conv_${sortedIds[0]}_${sortedIds[1]}`;

    // Find or create conversation
    let conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      conversation = await Conversation.create({
        conversationId,
        user,
        artisan,
        participants: [
          { user, userModel: 'User' },
          { user: artisan, userModel: 'Artisan' }
        ]
      });
    }

    await conversation.populate('user', 'firstName lastName avatar');
    await conversation.populate('artisan', 'firstName lastName profileImage category');

    res.status(200).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's conversations
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationOptions(req.query);

    let query = {};
    if (req.userType === 'user') {
      query.user = req.user.id;
    } else if (req.userType === 'artisan') {
      query.artisan = req.user.id;
    }

    const conversations = await Conversation.find(query)
      .populate('user', 'firstName lastName avatar')
      .populate('artisan', 'firstName lastName profileImage category rating')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments(query);

    res.status(200).json({
      success: true,
      count: conversations.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      data: conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/chat/conversations/:conversationId/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page, limit, skip } = getPaginationOptions(req.query);

    // Verify user has access to this conversation
    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const hasAccess = 
      conversation.user.toString() === req.user.id ||
      conversation.artisan.toString() === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    const messages = await ChatMessage.find({ conversationId })
      .populate('sender', 'firstName lastName avatar profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ChatMessage.countDocuments({ conversationId });

    // Mark messages as read
    await ChatMessage.updateMany(
      {
        conversationId,
        recipient: req.user.id,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    // Reset unread count for this user
    if (req.userType === 'user') {
      conversation.unreadCount.user = 0;
    } else {
      conversation.unreadCount.artisan = 0;
    }
    await conversation.save();

    res.status(200).json({
      success: true,
      count: messages.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      data: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, messageType = 'text', attachments, relatedBooking } = req.body;

    // Verify conversation exists and user has access
    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isUser = conversation.user.toString() === req.user.id;
    const isArtisan = conversation.artisan.toString() === req.user.id;

    if (!isUser && !isArtisan) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    const senderModel = isUser ? 'User' : 'Artisan';
    const recipient = isUser ? conversation.artisan : conversation.user;
    const recipientModel = isUser ? 'Artisan' : 'User';

    // Create message
    const chatMessage = await ChatMessage.create({
      conversationId,
      sender: req.user.id,
      senderModel,
      recipient,
      recipientModel,
      message,
      messageType,
      attachments,
      relatedBooking
    });

    // Update conversation
    conversation.lastMessage = {
      message,
      sender: req.user.id,
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

    // Populate sender info
    await chatMessage.populate('sender', 'firstName lastName avatar profileImage');

    res.status(201).json({
      success: true,
      data: chatMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/conversations/:conversationId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const hasAccess = 
      conversation.user.toString() === req.user.id ||
      conversation.artisan.toString() === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Mark messages as read
    await ChatMessage.updateMany(
      {
        conversationId,
        recipient: req.user.id,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    // Reset unread count
    if (req.userType === 'user') {
      conversation.unreadCount.user = 0;
    } else {
      conversation.unreadCount.artisan = 0;
    }
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await ChatMessage.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    // Get unread counts per conversation
    const conversationUnreadCounts = await ChatMessage.aggregate([
      {
        $match: {
          recipient: req.user._id,
          isRead: false
        }
      },
      {
        $group: {
          _id: '$conversationId',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: unreadCount,
        conversations: conversationUnreadCounts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await ChatMessage.findOne({
      _id: req.params.id,
      sender: req.user.id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or you are not the sender'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage
};
