import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, ChatMessage, PotentialPartner } from '@/api/chatService';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: ChatMessage[];
  potentialPartners: PotentialPartner[];
  isLoading: boolean;
  error: string | null;
  isSending: boolean;
}

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  potentialPartners: [],
  isLoading: false,
  error: null,
  isSending: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Fetch Conversations
    fetchConversationsRequest(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchConversationsSuccess(state, action: PayloadAction<Conversation[]>) {
      state.isLoading = false;
      state.conversations = action.payload;
    },
    fetchConversationsFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch Messages
    fetchMessagesRequest(state, _action: PayloadAction<string>) {
      state.isLoading = true;
      state.error = null;
    },
    fetchMessagesSuccess(state, action: PayloadAction<ChatMessage[]>) {
      state.isLoading = false;
      state.messages = action.payload;
    },
    fetchMessagesFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Send Message
    sendMessageRequest(state, _action: PayloadAction<{ conversationId: string; content: string; files?: File[] }>) {
      state.isSending = true;
    },
    sendMessageSuccess(state, action: PayloadAction<ChatMessage>) {
      state.isSending = false;
      if (!Array.isArray(state.messages)) state.messages = [];
      const exists = state.messages.some(m => m._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
      }
      
      // Update last message in conversation list
      if (!Array.isArray(state.conversations)) state.conversations = [];
      const convIndex = state.conversations.findIndex(c => c._id === action.payload.conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = action.payload;
        state.conversations[convIndex].updatedAt = action.payload.createdAt;
        // Move to top
        const [conv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },
    sendMessageFailure(state, action: PayloadAction<string>) {
      state.isSending = false;
      state.error = action.payload;
    },

    // Receive Message (Socket)
    receiveMessage(state, action: PayloadAction<ChatMessage>) {
      if (!Array.isArray(state.messages)) state.messages = [];
      if (state.activeConversation?._id === action.payload.conversationId) {
        // Prevent duplicate messages if we already added it via sendMessageSuccess
        const exists = state.messages.some(m => m._id === action.payload._id);
        if (!exists) {
          state.messages.push(action.payload);
        }
      }

      // Update conversations list for the sidebar
      if (!Array.isArray(state.conversations)) state.conversations = [];
      const convIndex = state.conversations.findIndex(c => c._id === action.payload.conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = action.payload;
        state.conversations[convIndex].updatedAt = action.payload.createdAt;
        
        // Move to top
        const [conv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },

    // Mark as Read
    markAsReadRequest(_state, _action: PayloadAction<string>) {},
    markAsReadSuccess(state, action: PayloadAction<string>) {
      const convIndex = state.conversations.findIndex(c => c._id === action.payload);
      if (convIndex !== -1) {
        // Find which participant is "me" and set their count to 0
        // For simplicity we'll let the next fetchConversations handle it if needed
        // but let's try to clear it if possible
      }
    },

    // Set Active Conversation
    setActiveConversation(state, action: PayloadAction<string | null>) {
      if (!action.payload) {
        state.activeConversation = null;
        state.messages = [];
        return;
      }
      if (!Array.isArray(state.conversations)) state.conversations = [];
      const conv = state.conversations.find(c => c._id === action.payload);
      if (conv) {
        state.activeConversation = conv;
      }
    },

    // Create Conversation
    createConversationRequest(state, _action: PayloadAction<{ participants: string[]; contextId: string; contextType: "Auction" | "Inventory" }>) {
        state.isLoading = true;
    },
    createConversationSuccess(state, action: PayloadAction<Conversation>) {
        state.isLoading = false;
        if (!Array.isArray(state.conversations)) state.conversations = [];
        const exists = state.conversations.some(c => c._id === action.payload._id);
        if (!exists) {
            state.conversations.unshift(action.payload);
        }
        state.activeConversation = action.payload;
    },
    createConversationFailure(state, action: PayloadAction<string>) {
        state.isLoading = false;
        state.error = action.payload;
    },

    // Potential Partners
    fetchPotentialPartnersRequest(state) {
        state.isLoading = true;
    },
    fetchPotentialPartnersSuccess(state, action: PayloadAction<PotentialPartner[]>) {
        state.isLoading = false;
        state.potentialPartners = action.payload;
    },
    fetchPotentialPartnersFailure(state, action: PayloadAction<string>) {
        state.isLoading = false;
        state.error = action.payload;
    }
  },
});

export const {
  fetchConversationsRequest,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageRequest,
  sendMessageSuccess,
  sendMessageFailure,
  receiveMessage,
  markAsReadRequest,
  markAsReadSuccess,
  setActiveConversation,
  createConversationRequest,
  createConversationSuccess,
  createConversationFailure,
  fetchPotentialPartnersRequest,
  fetchPotentialPartnersSuccess,
  fetchPotentialPartnersFailure
} = chatSlice.actions;

export default chatSlice.reducer;
