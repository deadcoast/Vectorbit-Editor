
import axios from "axios";

// Base API configuration
const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Palette API
export const fetchPalettes = async () => {
  try {
    const response = await api.get("/palettes");
    return response.data;
  } catch (error) {
    console.error("Error fetching palettes:", error.message);
    throw error;
  }
};

export const updatePaletteTags = async (id, tags) => {
  if (!id || !tags) throw new Error("Palette ID and tags are required");
  try {
    const response = await api.put(`/palettes/${id}/tags`, { tags });
    return response.data;
  } catch (error) {
    console.error("Error updating tags:", error.message);
    throw error;
  }
};

export const togglePaletteSharing = async (id) => {
  if (!id) throw new Error("Palette ID is required");
  try {
    const response = await api.put(`/palettes/${id}/share`);
    return response.data;
  } catch (error) {
    console.error("Error toggling sharing:", error.message);
    throw error;
  }
};

export const createPalette = async (palette) => {
  if (!palette) throw new Error("Palette data is required");
  try {
    const response = await api.post("/palettes", palette);
    return response.data;
  } catch (error) {
    console.error("Error creating palette:", error.message);
    throw error;
  }
};

export const deletePalette = async (id) => {
  if (!id) throw new Error("Palette ID is required");
  try {
    const response = await api.delete(`/palettes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting palette:", error.message);
    throw error;
  }
};

// Project API
export const createProject = async (project) => {
  if (!project) throw new Error("Project data is required");
  try {
    const response = await api.post("/projects", project);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error.message);
    throw error;
  }
};

export const fetchProjects = async () => {
  try {
    const response = await api.get("/projects");
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    throw error;
  }
};

export const fetchProjectById = async (id) => {
  if (!id) throw new Error("Project ID is required");
  try {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project by ID:", error.message);
    throw error;
  }
};

export const updateProject = async (id, project) => {
  if (!id || !project) throw new Error("Project ID and data are required");
  try {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error.message);
    throw error;
  }
};

export const deleteProject = async (id) => {
  if (!id) throw new Error("Project ID is required");
  try {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting project:", error.message);
    throw error;
  }
};

// File Conversion API
export const convertSvgToPng = async (file) => {
  if (!file) throw new Error("File is required for conversion");
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/projects/convert/png", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error converting SVG to PNG:", error.message);
    throw error;
  }
};

export const convertSvgToJpg = async (file) => {
  if (!file) throw new Error("File is required for conversion");
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/projects/convert/jpg", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error converting SVG to JPG:", error.message);
    throw error;
  }
};
