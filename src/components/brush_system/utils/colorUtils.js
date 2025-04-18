/**
 * Color Utility Functions
 *
 * This file contains utility functions for managing colors in the brush system.
 */
import { blendColors } from '../../../utils/color/colorCore';

/**
 * Determines the color for a cell based on current brush settings
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {object} settings - Current brush settings
 * @param {object} patternCache - Cache for patterns
 * @param {Function} generatePattern - Function to generate patterns
 * @returns {string|null} The color for the cell or null if transparent
 */
export const determineCellColor = (
  x,
  y,
  {
    brushType,
    activeColor,
    gridSize,
    patternSettings,
    gradientSettings,
    brushSize,
    patternCache,
    generatePattern,
  }
) => {
  if (brushType === 'eraser') return null;

  if (brushType === 'filled') {
    return activeColor;
  }

  if (brushType === 'gradient') {
    const { startColor, endColor, type, angle } = gradientSettings;

    if (type === 'linear') {
      // Simple linear gradient based on position
      const rad = (angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Project point onto gradient direction
      const normalizedX = x / gridSize;
      const normalizedY = y / gridSize;
      const projected = normalizedX * cos + normalizedY * sin;

      // Calculate blend ratio (0-1)
      const ratio = Math.max(0, Math.min(1, projected));

      return blendColors(startColor, endColor, ratio);
    } else if (type === 'radial') {
      // Radial gradient based on distance from center
      const centerX = gridSize / 2;
      const centerY = gridSize / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Calculate blend ratio (0-1)
      const ratio = Math.min(1, dist / maxDist);

      return blendColors(startColor, endColor, ratio);
    }

    return startColor; // Fallback
  }

  if (brushType === 'patterned') {
    // Generate pattern cache key
    const cacheKey = JSON.stringify(patternSettings);

    // Check if pattern is already cached
    if (!patternCache[cacheKey]) {
      // Generate the pattern
      const pattern = generatePattern({
        type: patternSettings.type,
        size: patternSettings.scale * brushSize,
        primaryColor: activeColor,
        secondaryColor: '#FFFFFF', // Could be configurable
        density: patternSettings.density,
        angle: patternSettings.angle,
      });

      patternCache[cacheKey] = pattern;
    }

    // Use cached pattern
    const pattern = patternCache[cacheKey];
    const patternSize = patternSettings.scale * brushSize;

    // Map grid coordinates to pattern coordinates
    const patternX = ((x % patternSize) + patternSize) % patternSize;
    const patternY = ((y % patternSize) + patternSize) % patternSize;

    // Look up color in pattern
    const index = Math.floor(patternY) * patternSize + Math.floor(patternX);
    return pattern[index] || null;
  }

  return activeColor; // Default fallback
};

/**
 * Calculates pressure-based size
 * @param {number} brushSize - Base brush size
 * @param {number} basePressure - Base pressure value
 * @param {Array} pressurePoints - History of pressure points
 * @returns {number} Calculated brush size based on pressure
 */
export const calculatePressureSize = (brushSize, basePressure, pressurePoints) => {
  const avgPressure =
    pressurePoints.reduce((sum, p) => sum + p, 0) / Math.max(1, pressurePoints.length);
  return Math.max(1, Math.round(brushSize * avgPressure * basePressure));
};
