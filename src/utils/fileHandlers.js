
// src/utils/fileHandlers.js

import axios from "axios";

/**
 * Create a new file by resetting the application state.
 * @param {Function} resetState - Callback to reset the app state.
 */
export const handleNewFile = (resetState) => {
  if (confirm("Are you sure you want to create a new file? Unsaved changes will be lost.")) {
    resetState(); // Reset the app state
    console.log("New file created!");
  }
};

/**
 * Open an existing file (JSON) and update the app state.
 * Includes file validation and error handling.
 * @param {Function} setState - Callback to update the app state with file data.
 */
export const handleOpenFile = async (setState) => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json"; // Accept only JSON files
  fileInput.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const parsedData = JSON.parse(fileContent);

      // Basic schema validation (add more checks as needed)
      if (!parsedData.gridSize || !parsedData.canvasSize || !Array.isArray(parsedData.layers)) {
        throw new Error("Invalid file format. Please ensure the file has the correct structure.");
      }

      setState(parsedData); // Update the app state with file data
      console.log("File opened successfully!");
    } catch (error) {
      console.error("Error opening file:", error);
      alert("Failed to open file. Ensure it's a valid JSON grid file.");
    }
  };
  fileInput.click();
};

/**
 * Save the current application state to a JSON file.
 * @param {Object} state - Current application state.
 */
export const handleSaveFile = (state) => {
  try {
    const fileData = JSON.stringify(state, null, 2);
    const blob = new Blob([fileData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${state.metadata?.projectName || "project"}.json`; // Use project name if available
    link.click();
    console.log("File saved successfully!");
  } catch (error) {
    console.error("Error saving file:", error);
    alert("Failed to save file. Please try again.");
  }
};

/**
 * Save the current file to a backend API.
 * Includes error handling and progress feedback.
 * @param {Object} state - Current application state.
 * @param {Function} onProgress - Callback for progress updates (optional).
 */
export const saveFileToAPI = async (state, onProgress) => {
  try {
    if (onProgress) onProgress(0); // Start progress
    const response = await axios.post("/api/save", state, {
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted); // Update progress
        }
      },
    });
    console.log("File saved to API successfully:", response.data);
    alert("File saved to server successfully!");
  } catch (error) {
    console.error("Error saving file to API:", error);
    alert("Failed to save file to server. Please check your connection or try again later.");
  } finally {
    if (onProgress) onProgress(100); // End progress
  }
};

/**
 * Export a file in custom formats (e.g., JSON, PNG, or other grid exports).
 * @param {HTMLCanvasElement} canvas - Canvas to export if required (e.g., for images).
 * @param {Object} state - Current application state (for JSON export).
 * @param {string} format - Export format ("json", "png").
 */
export const exportFile = (canvas, state, format = "json") => {
  if (format === "json") {
    handleSaveFile(state); // Save as JSON
  } else if (format === "png" && canvas) {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${state.metadata?.projectName || "grid"}.png`; // Use project name if available
    link.click();
    console.log("Canvas exported as PNG successfully!");
  } else {
    alert("Unsupported format or missing canvas for export.");
  }
};

/**
 * Import grid data from a JSON file.
 * Includes validation and fallback for incorrect data.
 * @param {File} file - File to import.
 * @param {Function} callback - Callback to process the imported data.
 */
export const importGridDataFromFile = async (file, callback) => {
  try {
    const fileContent = await file.text();
    const gridData = JSON.parse(fileContent);

    // Validate imported grid data
    if (!Array.isArray(gridData.layers)) {
      throw new Error("Invalid grid data format.");
    }

    callback(gridData); // Pass valid data to callback
    console.log("Grid data imported successfully!");
  } catch (error) {
    console.error("Error importing grid data:", error);
    alert("Failed to import grid data. Please ensure the file is valid and try again.");
  }
};

/**
 * Upload a grid file to a backend API.
 * Includes file validation and upload progress tracking.
 * @param {File} file - File to upload.
 * @param {Function} callback - Callback to process uploaded data.
 * @param {Function} onProgress - Callback for upload progress.
 */
export const uploadFileToAPI = async (file, callback, onProgress) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    const {data} = response;
    if (!data || !data.layers) {
      throw new Error("Invalid response from server.");
    }

    callback(data);
    console.log("File uploaded and processed successfully!");
  } catch (error) {
    console.error("Error uploading file to API:", error);
    alert("Failed to upload file. Please check your connection or try again later.");
  }
};
