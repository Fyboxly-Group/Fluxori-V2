/**
 * Conversation model for AI Customer Service Agent
 * 
 * MongoDB schema definition for the AI CS Agent conversations
 */
import mongoose, { Document, Schema } from 'mongoose';
import { 
  IConversation, 
  IConversationDocument, 
  IMessage, 
  MessageRole, 
  ConversationStatus 
} from '../interfaces/conversation.interface';

// Create the schema for a message
const messageSchema = new Schema<IMessage>({
  role: {
    type: String,
    required: true,
    enum: Object.values(MessageRole)
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

// Create the schema for a conversation
const conversationSchema = new Schema<IConversationDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: Object.values(ConversationStatus),
    default: ConversationStatus.ACTIVE,
    index: true
  },
  topic: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
conversationSchema.index({ userId: 1, status: 1 });
conversationSchema.index({ organizationId: 1, status: 1 });
conversationSchema.index({ lastMessageAt: -1 });

/**
 * Middleware: Update lastMessageAt when messages are updated
 */
conversationSchema.pre('save', function(next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    this.lastMessageAt = new Date();
  }
  next();
});

/**
 * Statics: Find active conversations for a user
 */
conversationSchema.statics.findActiveByUser = function(userId: string) {
  return this.find({ 
    userId: new mongoose.Types.ObjectId(userId),
    status: ConversationStatus.ACTIVE
  }).sort({ lastMessageAt: -1 });
};

/**
 * Statics: Find conversations by organization
 */
conversationSchema.statics.findByOrganization = function(orgId: string, status?: ConversationStatus) {
  const query: { organizationId: mongoose.Types.ObjectId; status?: ConversationStatus } = {
    organizationId: new mongoose.Types.ObjectId(orgId)
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query).sort({ lastMessageAt: -1 });
};

// Create and export the model with static methods
export interface IConversationModel extends mongoose.Model<IConversationDocument> {
  findActiveByUser(userId: string): Promise<IConversationDocument[]>;
  findByOrganization(orgId: string, status?: ConversationStatus): Promise<IConversationDocument[]>;
}

const Conversation = mongoose.model<IConversationDocument, IConversationModel>(
  'Conversation', 
  conversationSchema
);

export default Conversation;