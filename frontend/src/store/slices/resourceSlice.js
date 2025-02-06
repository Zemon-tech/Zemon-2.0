import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Async thunks
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async ({ type, tags, search, sort } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (tags) params.append('tags', tags);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      
      const response = await axiosInstance.get(`/resources?${params}`);
      return response.data;
    } catch (error) {
      console.error('Fetch error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch resources'
      );
    }
  }
);

export const createResource = createAsyncThunk(
  'resources/createResource',
  async (resourceData) => {
    try {
      const response = await axiosInstance.post('/resources', resourceData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to create resource';
    }
  }
);

export const updateResourceAsync = createAsyncThunk(
  'resources/updateResource',
  async ({ id, data }) => {
    try {
      const response = await axiosInstance.put(`/resources/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update resource';
    }
  }
);

export const deleteResourceAsync = createAsyncThunk(
  'resources/deleteResource',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        throw new Error('Resource ID is required');
      }

      await axiosInstance.delete(`/resources/${id}`);
      return id;
    } catch (error) {
      console.error('Delete error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete resource'
      );
    }
  }
);

const initialState = {
  resources: [],
  loading: false,
  error: null,
  lastFetched: null,
};

const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    clearResourceError: (state) => {
      state.error = null;
    },
    removeFromState: (state, action) => {
      state.resources = state.resources.filter(
        resource => resource._id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch resources
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create resource
      .addCase(createResource.fulfilled, (state, action) => {
        state.resources.unshift(action.payload);
        state.error = null;
      })
      .addCase(createResource.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Update resource
      .addCase(updateResourceAsync.fulfilled, (state, action) => {
        const index = state.resources.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateResourceAsync.rejected, (state, action) => {
        state.error = action.error.message;
      })
      // Delete resource
      .addCase(deleteResourceAsync.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResourceAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = state.resources.filter(
          resource => resource._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteResourceAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to delete resource';
      });
  },
});

export const { clearResourceError, removeFromState } = resourceSlice.actions;

// Selectors
export const selectResources = (state) => state.resources.resources;
export const selectResourcesLoading = (state) => state.resources.loading;
export const selectResourcesError = (state) => state.resources.error;
export const selectLastFetched = (state) => state.resources.lastFetched;

export default resourceSlice.reducer; 