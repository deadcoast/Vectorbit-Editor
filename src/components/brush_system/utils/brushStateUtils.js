/**
 * Utility functions for managing brush state
 */

/**
 * Creates an object with initial brush settings
 * @param {string} activeColor - Active color value
 * @returns {object} Initial pattern and gradient settings
 */
export const getInitialBrushSettings = activeColor => {
  return {
    patternSettings: {
      type: 'solid',
      scale: 1,
      density: 0.5,
      angle: 0,
    },
    gradientSettings: {
      startColor: activeColor,
      endColor: '#FFFFFF',
      type: 'linear',
      angle: 0,
    },
  };
};

/**
 * Creates a current brush settings object for preview
 * @param {object} settings - The current brush settings
 * @returns {object} Combined brush settings object
 */
export const createBrushSettingsObject = ({
  blendMode,
  brushEffect,
  brushHardness,
  brushShape,
  brushSize,
  brushSmoothing,
  brushSpacing,
  brushType,
  gradientSettings,
  opacity,
  patternSettings,
  pressure,
  symmetryMode,
}) => {
  return {
    blendMode,
    brushEffect,
    brushHardness,
    brushShape,
    brushSize,
    brushSmoothing,
    brushSpacing,
    brushType,
    gradientSettings,
    opacity,
    patternSettings,
    pressure,
    symmetryMode,
  };
};
