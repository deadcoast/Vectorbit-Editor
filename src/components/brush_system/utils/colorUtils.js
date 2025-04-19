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
 * Generates a pattern based on provided settings
 * @param {object} settings - Pattern settings
 * @param {string} settings.type - Pattern type (e.g., 'dots', 'lines', 'grid')
 * @param {number} settings.size - Size of the pattern
 * @param {string} settings.primaryColor - Primary color for the pattern
 * @param {string} settings.secondaryColor - Secondary color for the pattern
 * @param {number} settings.density - Density of the pattern elements
 * @param {number} settings.angle - Angle for directional patterns
 * @returns {Array<Array<string>>} 2D array representing the pattern
 */
export const generatePattern = ({
  type = 'dots',
  size = 10,
  primaryColor = '#000000',
  secondaryColor = '#FFFFFF',
  density = 0.5,
  angle = 0,
}) => {
  // Create a 2D array representing the pattern
  const pattern = Array(size)
    .fill()
    .map(() => Array(size).fill(secondaryColor));

  // Variables needed for patterns - declare outside case statements to avoid lexical declaration errors
  let rad;
  let lineSpacing;
  let gridSpacing;
  let checkerSize;
  let projected;
  let checkerX;
  let checkerY;

  // Apply different pattern types
  switch (type) {
    case 'dots':
      // Create a dot pattern
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          // Place dots based on density
          if (
            Math.random() < density &&
            (x + y) % Math.max(2, Math.floor((1 - density) * 5)) === 0
          ) {
            pattern[y][x] = primaryColor;
          }
        }
      }
      break;

    case 'lines':
      // Create a line pattern at specified angle
      rad = (angle * Math.PI) / 180;
      lineSpacing = Math.max(1, Math.floor(size / (size * density)));

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          // Project point onto angle direction to determine line position
          projected = x * Math.cos(rad) + y * Math.sin(rad);
          if (Math.round(projected) % lineSpacing === 0) {
            pattern[y][x] = primaryColor;
          }
        }
      }
      break;

    case 'grid':
      // Create a grid pattern
      gridSpacing = Math.max(1, Math.floor(size / (size * density)));

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (x % gridSpacing === 0 || y % gridSpacing === 0) {
            pattern[y][x] = primaryColor;
          }
        }
      }
      break;

    case 'checker':
      // Create a checker pattern
      checkerSize = Math.max(1, Math.floor(size / (size * density) / 2));

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          checkerX = Math.floor(x / checkerSize);
          checkerY = Math.floor(y / checkerSize);

          if ((checkerX + checkerY) % 2 === 0) {
            pattern[y][x] = primaryColor;
          }
        }
      }
      break;

    default:
      // Default to flat color
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          pattern[y][x] = primaryColor;
        }
      }
  }

  return pattern;
};

/**
 * Calculates pressure-based size
 * @param {number} brushSize - Base brush size
 * @param {number} basePressure - Base pressure value
 * @param {Array} pressurePoints - History of pressure points
 * @returns {number} Calculated brush size based on pressure
 */
export const calculatePressureSize = (brushSize, basePressure, pressurePoints) => {
  if (!pressurePoints || pressurePoints.length === 0) {
    return brushSize;
  }

  // Average the last few pressure points
  const recentPressure =
    pressurePoints.slice(-3).reduce((acc, p) => acc + p, 0) / Math.min(3, pressurePoints.length);

  // Scale brush size based on pressure relative to base pressure
  return brushSize * (recentPressure / basePressure);
};
