import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import ideaReducer from './slices/ideaSlice';
import chatReducer from './slices/chatSlice';
import adminReducer from './slices/adminSlice';
import resourceReducer from './slices/resourceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    ideas: ideaReducer,
    chats: chatReducer,
    admin: adminReducer,
    chat: chatReducer,
    resources: resourceReducer
  },
});

export default store; 