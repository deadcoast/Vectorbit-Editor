/**
 * Utility functions for brush effects and settings
 */

/**
 * Creates brush API object to expose to parent components
 *
 * @param {object} options - Current brush settings
 * @returns {object} The brush API object to expose
 */
export const createBrushAPI = ({
  applyBrush,
  brushType,
  brushEffect,
  brushSize,
  opacity,
  pressure,
  patternSettings,
  gradientSettings,
  symmetryMode,
  blendMode,
}) => {
  return {
    applyBrush,
    brushType,
    brushEffect,
    brushSize,
    opacity,
    pressure,
    patternSettings,
    gradientSettings,
    symmetryMode,
    blendMode,
  };
};

/**
 * Creates settings object to pass to settings change callback
 *
 * @param {object} options - Current brush settings
 * @returns {object} The settings object to pass to callback
 */
export const createSettingsObject = ({
  brushType,
  brushEffect,
  brushSize,
  opacity,
  pressure,
  patternSettings,
  gradientSettings,
  symmetryMode,
  blendMode,
}) => {
  return {
    brushType,
    brushEffect,
    brushSize,
    opacity,
    pressure,
    patternSettings,
    gradientSettings,
    symmetryMode,
    blendMode,
  };
};
