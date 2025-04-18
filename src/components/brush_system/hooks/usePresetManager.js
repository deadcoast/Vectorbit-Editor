/**
 * Custom hook for managing brush presets
 */
import { useState, useEffect } from 'react';

import {
  createPresetObject,
  getPresetsByCategory,
  isPresetNameDuplicate,
  loadPresetsFromStorage,
  savePresetsToStorage,
} from '../utils/presetUtils';

/**
 * Hook to manage brush presets
 * @param {Object} currentBrushSettings - Current brush settings
 * @param {Function} onLoadPreset - Callback when a preset is loaded
 * @param {Function} onSavePreset - Callback when a preset is saved
 * @param {Function} onDeletePreset - Callback when a preset is deleted
 * @param {Function} onUpdatePreset - Callback when a preset is updated
 * @returns {Object} Preset management functions and state
 */
const usePresetManager = ({
  currentBrushSettings,
  onDeletePreset,
  onLoadPreset,
  onSavePreset,
  onUpdatePreset,
}) => {
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [presetCategory, setPresetCategory] = useState('brush');
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [categoryPresets, setCategoryPresets] = useState([]);

  // Load presets from localStorage
  useEffect(() => {
    const savedPresets = loadPresetsFromStorage();
    setPresets(savedPresets);
  }, []);

  // Filter presets by category
  useEffect(() => {
    const filtered = getPresetsByCategory(presets, presetCategory);
    setCategoryPresets(filtered);
  }, [presetCategory, presets]);

  /**
   * Handle saving a new preset
   */
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a name for your preset');
      return;
    }

    if (isPresetNameDuplicate(presets, presetName, presetCategory)) {
      alert(
        'A preset with this name already exists. Please choose a different name or update the existing preset.'
      );
      return;
    }

    const newPreset = createPresetObject(presetName, presetCategory, currentBrushSettings);

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);

    // Clear the form
    setPresetName('');

    // Call the onSavePreset callback from parent
    if (onSavePreset) {
      onSavePreset(newPreset);
    }
  };

  /**
   * Handle loading a preset
   */
  const handleLoadPreset = presetId => {
    const preset = presets.find(p => p.id === presetId);
    if (preset && onLoadPreset) {
      onLoadPreset(preset);
      setSelectedPresetId(presetId);
    }
  };

  /**
   * Handle updating an existing preset
   */
  const handleUpdatePreset = presetId => {
    const updatedPresets = presets.map(preset => {
      if (preset.id === presetId) {
        return {
          ...preset,
          settings: currentBrushSettings,
          updated: new Date().toISOString(),
        };
      }
      return preset;
    });

    setPresets(updatedPresets);
    savePresetsToStorage(updatedPresets);

    if (onUpdatePreset) {
      onUpdatePreset(updatedPresets.find(p => p.id === presetId));
    }
  };

  /**
   * Handle deleting a preset
   */
  const handleDeletePreset = presetId => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      const updatedPresets = presets.filter(preset => preset.id !== presetId);
      setPresets(updatedPresets);
      savePresetsToStorage(updatedPresets);

      if (selectedPresetId === presetId) {
        setSelectedPresetId(null);
      }

      if (onDeletePreset) {
        onDeletePreset(presetId);
      }
    }
  };

  return {
    presetName,
    setPresetName,
    presetCategory,
    setPresetCategory,
    selectedPresetId,
    setSelectedPresetId,
    categoryPresets,
    handleSavePreset,
    handleLoadPreset,
    handleUpdatePreset,
    handleDeletePreset,
  };
};

export default usePresetManager;
