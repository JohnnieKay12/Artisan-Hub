const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    unique: true,
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'participants.userModel'
    },
    userModel: {
      type: String,
      required: true,
      enum: ['User', 'Artisan']
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artisan',
    required: true
  },
  lastMessage: {
    message: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'lastMessage.senderModel'
    },
    senderModel: {
      type: String,
      enum: ['User', 'Artisan']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  unreadCount: {
    user: {
      type: Number,
      default: 0
    },
    artisan: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying conversations
ConversationSchema.index({ user: 1, updatedAt: -1 });
ConversationSchema.index({ artisan: 1, updatedAt: -1 });
ConversationSchema.index({ conversationId: 1 });

// Generate conversation ID before saving
ConversationSchema.pre('save', async function(next) {
  if (!this.conversationId) {
    const sortedIds = [this.user.toString(), this.artisan.toString()].sort();
    this.conversationId = `conv_${sortedIds[0]}_${sortedIds[1]}`;
  }
  next();
});

module.exports = mongoose.model('Conversation', ConversationSchema);
