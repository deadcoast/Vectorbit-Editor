import axios from 'axios';

// Base URL for the API (set via environment variables or fallback to localhost)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create a reusable Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Helper function to handle API requests with error handling.
 * @param {Function} requestFn - The API request function to execute.
 * @returns {Promise<any>} - The API response data.
 */
const handleApiRequest = async requestFn => {
  try {
    const response = await requestFn();
    console.log('API request successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    alert(`API Error: ${error.response?.data?.message || error.message}`);
    throw error; // Re-throw for further error handling if needed
  }
};

/**
 * Fetch all palettes from the API.
 * @returns {Promise<Array>} - List of palettes.
 */
export const fetchPalettes = async () => {
  return handleApiRequest(() => api.get('/palettes'));
};

/**
 * Create a new palette via the API.
 * @param {Object} palette - Palette object to create.
 * @returns {Promise<Object>} - Created palette data.
 */
export const createPalette = async palette => {
  if (!palette.name || !Array.isArray(palette.colors)) {
    alert('Invalid palette data. Ensure the name and colors are provided.');
    throw new Error('Invalid palette data.');
  }
  return handleApiRequest(() => api.post('/palettes', palette));
};

/**
 * Update tags for an existing palette.
 * @param {string} paletteId - ID of the palette to update.
 * @param {Array<string>} tags - New tags for the palette.
 * @returns {Promise<Object>} - Updated palette data.
 */
export const updatePaletteTags = async (paletteId, tags) => {
  if (!paletteId) {
    alert('Palette ID is required to update tags.');
    throw new Error('Missing palette ID.');
  }
  if (!Array.isArray(tags)) {
    alert('Tags must be provided as an array.');
    throw new Error('Invalid tags format.');
  }
  return handleApiRequest(() => api.patch(`/palettes/${paletteId}/tags`, { tags }));
};

/**
 * Delete a palette by its ID via the API.
 * @param {string} id - Palette ID to delete.
 * @returns {Promise<Object>} - Deleted palette confirmation.
 */
export const deletePalette = async id => {
  if (!id) {
    alert('Palette ID is required to delete.');
    throw new Error('Missing palette ID.');
  }
  return handleApiRequest(() => api.delete(`/palettes/${id}`));
};

/**
 * Fetch all projects from the API.
 * @returns {Promise<Array>} - List of projects.
 */
export const fetchProjects = async () => {
  return handleApiRequest(() => api.get('/projects'));
};

/**
 * Create a new project via the API.
 * @param {Object} project - Project object to create.
 * @returns {Promise<Object>} - Created project data.
 */
export const createProject = async project => {
  if (!project.name || !project.gridData) {
    alert('Invalid project data. Ensure the name and grid data are provided.');
    throw new Error('Invalid project data.');
  }
  return handleApiRequest(() => api.post('/projects', project));
};

/**
 * Delete a project by its ID via the API.
 * @param {string} id - Project ID to delete.
 * @returns {Promise<Object>} - Deleted project confirmation.
 */
export const deleteProject = async id => {
  if (!id) {
    alert('Project ID is required to delete.');
    throw new Error('Missing project ID.');
  }
  return handleApiRequest(() => api.delete(`/projects/${id}`));
};

/**
 * Fetch detailed project data by ID.
 * @param {string} id - Project ID to fetch.
 * @returns {Promise<Object>} - Project details.
 */
export const fetchProjectById = async id => {
  if (!id) {
    alert('Project ID is required to fetch.');
    throw new Error('Missing project ID.');
  }
  return handleApiRequest(() => api.get(`/projects/${id}`));
};

/**
 * Upload a file to the server via the API.
 * Includes progress tracking for large uploads.
 * @param {File} file - File to upload.
 * @param {Function} onProgress - Callback for upload progress.
 * @returns {Promise<Object>} - Uploaded file metadata.
 */
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return handleApiRequest(() =>
    api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    })
  );
};

/**
 * Save project data to the server.
 * Includes automatic retry logic for network issues.
 * @param {Object} projectData - Project data to save.
 * @param {number} retries - Number of retry attempts (default: 3).
 * @returns {Promise<Object>} - Saved project data.
 */
export const saveProjectWithRetry = async (projectData, retries = 3) => {
  const trySave = async attempt => {
    try {
      return await createProject(projectData);
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Retrying save... Attempt ${attempt + 1}`);
        return trySave(attempt + 1);
      }
      throw error;
    }
  };
  return trySave(0);
};

/**
 * Handle generic API requests with custom method and endpoint.
 * @param {string} method - HTTP method ("GET", "POST", etc.).
 * @param {string} endpoint - API endpoint.
 * @param {Object} data - Payload for the request (if applicable).
 * @returns {Promise<any>} - API response data.
 */
export const handleCustomRequest = async (method, endpoint, data = {}) => {
  return handleApiRequest(() =>
    api.request({
      method,
      url: endpoint,
      data,
    })
  );
};

export default api;
