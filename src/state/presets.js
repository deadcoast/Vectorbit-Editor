
// File: src/state/presets.js
import { useState, useEffect } from "react";
import axios from "axios";

// API URL for Cloud Storage (if applicable)
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Hook to Manage Presets with Local and Cloud Synchronization
export const usePresetStorage = () => {
  const [presets, setPresets] = useState(() => {
    const savedPresets = localStorage.getItem("anchorPresets");
    return savedPresets ? JSON.parse(savedPresets) : {};
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load Presets from Local Storage and Cloud
  useEffect(() => {
    const fetchCloudPresets = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/presets`);
        const cloudPresets = response.data;
        const combinedPresets = { ...presets, ...cloudPresets };
        setPresets(combinedPresets);
        localStorage.setItem("anchorPresets", JSON.stringify(combinedPresets));
      } catch (err) {
        console.error("Error fetching cloud presets:", err);
        setError("Failed to fetch cloud presets.");
      } finally {
        setLoading(false);
      }
    };
    fetchCloudPresets();
  }, []);

  // Save a Preset Locally and to Cloud
  const savePreset = async (name, preset) => {
    try {
      const updatedPresets = { ...presets, [name]: preset };
      setPresets(updatedPresets);
      localStorage.setItem("anchorPresets", JSON.stringify(updatedPresets));

      // Save to Cloud
      await axios.post(`${API_BASE_URL}/presets`, { name, preset });
      console.log("Preset saved successfully!");
    } catch (err) {
      console.error("Error saving preset:", err);
      setError("Failed to save preset to the cloud.");
    }
  };

  // Delete a Preset Locally and from Cloud
  const deletePreset = async (name) => {
    try {
      const updatedPresets = { ...presets };
      delete updatedPresets[name];
      setPresets(updatedPresets);
      localStorage.setItem("anchorPresets", JSON.stringify(updatedPresets));

      // Delete from Cloud
      await axios.delete(`${API_BASE_URL}/presets/${name}`);
      console.log("Preset deleted successfully!");
    } catch (err) {
      console.error("Error deleting preset:", err);
      setError("Failed to delete preset from the cloud.");
    }
  };

  // Export All Presets to a JSON File
  const exportPresets = () => {
    const dataStr = JSON.stringify(presets, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "presets.json";
    link.click();
  };

  // Import Presets from a JSON File
  const importPresets = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedPresets = JSON.parse(event.target.result);
        const combinedPresets = { ...presets, ...importedPresets };
        setPresets(combinedPresets);
        localStorage.setItem("anchorPresets", JSON.stringify(combinedPresets));
        console.log("Presets imported successfully!");
      } catch (err) {
        console.error("Error importing presets:", err);
        setError("Failed to import presets. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  // Fetch a Preset by Name
  const fetchPreset = (name) => {
    return presets[name] || null;
  };

  return {
    presets,
    savePreset,
    deletePreset,
    exportPresets,
    importPresets,
    fetchPreset,
    loading,
    error,
  };
};
