/**
 * Brush Utility Functions
 * 
 * This file contains utility functions for the brush system
 * to help with various calculations and transformations.
 */

/**
 * Determines if a position is within the current brush shape
 * @param {number} offsetX - X offset from center
 * @param {number} offsetY - Y offset from center
 * @param {number} size - Brush size
 * @param {string|Array} shape - Brush shape
 * @returns {boolean} True if position is within brush
 */
export const isPositionInBrush = (offsetX, offsetY, size, shape) => {
  // Default shape is square
  if (!shape || shape === 'square') {
    return Math.abs(offsetX) <= size / 2 && Math.abs(offsetY) <= size / 2;
  }

  // Circle shape
  if (shape === 'circle') {
    const radius = size / 2;
    return Math.sqrt(offsetX * offsetX + offsetY * offsetY) <= radius;
  }

  // Diamond shape
  if (shape === 'diamond') {
    return Math.abs(offsetX) + Math.abs(offsetY) <= size / 2;
  }

  // Custom shape (use the brushShape array)
  if (Array.isArray(shape)) {
    const index =
      (offsetY + Math.floor(shape.length / 2)) * shape.length +
      (offsetX + Math.floor(shape[0].length / 2));
    return shape.flat()[index];
  }

  return false;
};

/**
 * Smooths the brush stroke using Catmull-Rom spline
 * @param {Array} points - Array of points to smooth
 * @returns {Array} Smoothed points
 */
export const smoothStroke = points => {
  if (points.length < 4) {
    return points;
  }

  const smoothed = [];
  for (let i = 1; i < points.length - 2; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2];

    for (let t = 0; t < 1; t += 0.1) {
      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

      const y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

      smoothed.push({ x, y });
    }
  }

  return smoothed;
};

/**
 * Format metadata for display
 * @param {object} metadata - Metadata to format
 * @returns {string} Formatted metadata
 */
export const formatMetadata = metadata => {
  try {
    return JSON.stringify(metadata, null, 2);
  } catch (e) {
    return 'Unable to format metadata';
  }
};

/**
 * Generates or retrieves pattern from cache
 * @param {object} settings - Pattern settings
 * @param {Map} patternCache - Cache to store patterns
 * @param {Function} generatePattern - Function to generate patterns
 * @returns {Array} Pattern data
 */
export const getPattern = (settings, patternCache, generatePattern) => {
  const key = JSON.stringify(settings);
  if (!patternCache.has(key)) {
    const pattern = generatePattern(settings);
    patternCache.set(key, pattern);
    return pattern;
  }
  return patternCache.get(key);
};
