import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

export const fetchIdeas = createAsyncThunk(
  'ideas/fetchIdeas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/ideas');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createIdea = createAsyncThunk(
  'ideas/createIdea',
  async (ideaData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/ideas', ideaData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const voteIdea = createAsyncThunk(
  'ideas/voteIdea',
  async (id, { rejectWithValue, getState }) => {
    try {
      const response = await axios.post(`/ideas/${id}/vote`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addComment = createAsyncThunk(
  'ideas/addComment',
  async ({ id, comment }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/ideas/${id}/comment`, { comment });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteIdea = createAsyncThunk(
  'ideas/deleteIdea',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/ideas/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const ideaSlice = createSlice({
  name: 'ideas',
  initialState: {
    ideas: [],
    loading: false,
    error: null,
    currentIdea: null,
  },
  reducers: {
    setCurrentIdea: (state, action) => {
      state.currentIdea = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch ideas
      .addCase(fetchIdeas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIdeas.fulfilled, (state, action) => {
        state.loading = false;
        state.ideas = action.payload;
      })
      .addCase(fetchIdeas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch ideas';
      })
      // Create idea
      .addCase(createIdea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIdea.fulfilled, (state, action) => {
        state.loading = false;
        state.ideas.unshift(action.payload);
      })
      .addCase(createIdea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create idea';
      })
      // Vote idea
      .addCase(voteIdea.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(voteIdea.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.ideas.findIndex(idea => idea._id === action.payload._id);
        if (index !== -1) {
          state.ideas[index] = action.payload;
        }
      })
      .addCase(voteIdea.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to vote';
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const index = state.ideas.findIndex(idea => idea._id === action.payload._id);
        if (index !== -1) {
          state.ideas[index] = action.payload;
        }
      })
      .addCase(deleteIdea.fulfilled, (state, action) => {
        state.ideas = state.ideas.filter(idea => idea._id !== action.payload);
      });
  },
});

export const { setCurrentIdea, clearError } = ideaSlice.actions;
export default ideaSlice.reducer; 