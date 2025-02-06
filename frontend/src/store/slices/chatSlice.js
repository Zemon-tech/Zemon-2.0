import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { supabase } from '../../utils/supabase';

export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/chats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch chats');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (params, { rejectWithValue }) => {
    try {
      let participants, name, type;
      
      if (typeof params === 'string' || Array.isArray(params)) {
        // Handle direct chat creation
        participants = Array.isArray(params) ? params : [params];
        type = 'direct';
      } else {
        // Handle group chat creation
        ({ participants, name, type } = params);
      }

      const response = await axios.post('/chats', { 
        participants: Array.isArray(participants) ? participants : [participants],
        name,
        type
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create chat');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/chats/${chatId}/messages`, { content });
      return { chatId, message: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

export const deleteChat = createAsyncThunk(
  'chat/deleteChat',
  async (chatId, { rejectWithValue }) => {
    try {
      await axios.delete(`/chats/${chatId}`);
      return chatId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete chat');
    }
  }
);

export const fetchAvailableUsers = createAsyncThunk(
  'chat/fetchAvailableUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/chats/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch users');
    }
  }
);

export const addGroupMembers = createAsyncThunk(
  'chat/addGroupMembers',
  async ({ chatId, userIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/chats/${chatId}/members`, { userIds });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add members');
    }
  }
);

export const removeGroupMember = createAsyncThunk(
  'chat/removeGroupMember',
  async ({ chatId, userId }, { rejectWithValue }) => {
    try {
      await axios.delete(`/chats/${chatId}/members/${userId}`);
      return { chatId, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove member');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    activeChat: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    addMessageToChat: (state, action) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push(message);
        chat.lastMessage = message;
      }
      if (state.activeChat && state.activeChat._id === chatId) {
        if (!state.activeChat.messages) state.activeChat.messages = [];
        state.activeChat.messages.push(message);
        state.activeChat.lastMessage = message;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearChats: (state) => {
      state.chats = [];
      state.activeChat = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
        if (state.activeChat) {
          const updatedActiveChat = action.payload.find(
            chat => chat._id === state.activeChat._id
          );
          if (updatedActiveChat) {
            state.activeChat = updatedActiveChat;
          }
        }
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
        state.activeChat = action.payload;
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter(chat => chat._id !== action.payload);
        if (state.activeChat?._id === action.payload) {
          state.activeChat = null;
        }
      })
      .addCase(addGroupMembers.fulfilled, (state, action) => {
        const updatedChat = action.payload;
        const index = state.chats.findIndex(chat => chat._id === updatedChat._id);
        if (index !== -1) {
          state.chats[index] = {
            ...state.chats[index],
            ...updatedChat,
            messages: state.chats[index].messages // Preserve existing messages
          };
          if (state.activeChat?._id === updatedChat._id) {
            state.activeChat = {
              ...state.activeChat,
              ...updatedChat,
              messages: state.activeChat.messages // Preserve existing messages
            };
          }
        }
      })
      .addCase(removeGroupMember.fulfilled, (state, action) => {
        const { chatId, userId } = action.payload;
        const chat = state.chats.find(c => c._id === chatId);
        if (chat) {
          chat.participants = chat.participants.filter(p => p._id !== userId);
          if (state.activeChat?._id === chatId) {
            state.activeChat = chat;
          }
        }
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { chatId, message } = action.payload;
        const chat = state.chats.find(c => c._id === chatId);
        if (chat) {
          if (!chat.messages) chat.messages = [];
          chat.messages.push(message);
          chat.lastMessage = {
            content: message.content,
            sender: message.sender,
            createdAt: message.createdAt
          };
        }
        if (state.activeChat?._id === chatId) {
          if (!state.activeChat.messages) state.activeChat.messages = [];
          state.activeChat.messages.push(message);
          state.activeChat.lastMessage = {
            content: message.content,
            sender: message.sender,
            createdAt: message.createdAt
          };
        }
      });
  }
});

export const {
  setActiveChat,
  addMessageToChat,
  clearError,
  clearChats,
} = chatSlice.actions;

export default chatSlice.reducer; 