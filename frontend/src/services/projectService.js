import axiosInstance from '../utils/axios';

const API_URL = '/projects';

// Get all projects
export const getAllProjects = async () => {
  const response = await axiosInstance.get(API_URL);
  return response.data;
};

// Get a single project
export const getProject = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/${id}`);
  return response.data;
};

// Create a project
export const createProject = async (projectData) => {
  try {
    console.log('Creating project with data:', projectData);
    
    // Send the project data directly without additional options
    const response = await axiosInstance.post(API_URL, projectData);
    return response.data;
  } catch (error) {
    console.error('Project creation error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message,
      error: error.response?.data?.error,
      validation: error.response?.data?.errors,
      headers: error.response?.headers,
      config: error.config,
      requestData: error.config?.data
    });
    throw error;
  }
};

// Update a project
export const updateProject = async (id, projectData) => {
  const response = await axiosInstance.put(`${API_URL}/${id}`, projectData);
  return response.data;
};

// Delete a project
export const deleteProject = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response.data;
};

// Add timeline entry
export const addTimelineEntry = async (projectId, entryData) => {
  const response = await axiosInstance.post(`${API_URL}/${projectId}/timeline`, entryData);
  return response.data;
};

// Update timeline entry
export const updateTimelineEntry = async (projectId, entryId, entryData) => {
  const response = await axiosInstance.patch(`${API_URL}/${projectId}/timeline/${entryId}`, entryData);
  return response.data;
};

// Delete timeline entry
export const deleteTimelineEntry = async (projectId, entryId) => {
  const response = await axiosInstance.delete(`${API_URL}/${projectId}/timeline/${entryId}`);
  return response.data;
}; 