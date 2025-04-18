/**
 * Utility functions for working with brush presets
 */

/**
 * Load presets from localStorage
 * @returns {array} Array of presets or empty array if none found
 */
export const loadPresetsFromStorage = () => {
  const savedPresets = localStorage.getItem('vectorbit_presets');
  if (savedPresets) {
    try {
      return JSON.parse(savedPresets);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  }
  return [];
};

/**
 * Save presets to localStorage
 * @param {array} presets - Array of presets to save
 */
export const savePresetsToStorage = presets => {
  localStorage.setItem('vectorbit_presets', JSON.stringify(presets));
};

/**
 * Create a new preset object from current settings
 * @param {string} presetName - Name for the preset
 * @param {string} presetCategory - Category of the preset
 * @param {object} currentBrushSettings - Current brush settings to save
 * @returns {object} New preset object
 */
export const createPresetObject = (presetName, presetCategory, currentBrushSettings) => {
  return {
    id: Date.now().toString(),
    name: presetName,
    category: presetCategory,
    settings: { ...currentBrushSettings },
  };
};

/**
 * Check if preset name already exists in presets array
 * @param {array} presets - Array of existing presets
 * @param {string} presetName - Name to check for
 * @returns {boolean} True if name exists, false otherwise
 */
export const isPresetNameDuplicate = (presets, presetName) => {
  return presets.some(preset => preset.name === presetName);
};

/**
 * Get filtered presets by category
 * @param {array} presets - Array of all presets
 * @param {string} category - Category to filter by
 * @returns {array} Filtered presets
 */
export const getPresetsByCategory = (presets, category) => {
  return presets.filter(preset => preset.category === category);
};
