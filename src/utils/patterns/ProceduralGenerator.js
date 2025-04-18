/**
 * src/utils/patterns/ProceduralGenerator.js
 * Base Pattern Generators
 * Implementation of core pattern generation functions
 */

import seedrandom from 'seedrandom';

/**
 * Generate 2D Perlin noise
 * @param {number} width - Width of the grid
 * @param {number} height - Height of the grid
 * @param {number} scale - Scale factor for noise (smaller = smoother)
 * @param {number} seed - Random seed for reproducibility
 * @returns {Array} - 1D array of noise values (0-1)
 */
export const generatePerlinNoise = (width, height, scale = 0.1, seed = Math.random() * 10000) => {
  const random = seedrandom(seed.toString());

  // Generate a permutation table
  const perm = new Array(512);
  for (let i = 0; i < 256; i++) {
    perm[i] = perm[i + 256] = Math.floor(random() * 256);
  }

  // Helper function to calculate gradient
  const grad = (hash, x, y) => {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    let v = 0;
    if (h < 4) {
      v = y;
    } else if (h === 12 || h === 14) {
      v = x;
    }
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  // Fade function for smoother interpolation
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);

  // Linear interpolation
  const lerp = (a, b, t) => a + t * (b - a);

  // Generate noise value at a specific point
  const noise2D = (x, y) => {
    // Find unit square that contains the point
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    // Get relative position inside square
    x -= Math.floor(x);
    y -= Math.floor(y);

    // Compute fade curves
    const u = fade(x);
    const v = fade(y);

    // Hash coordinates
    const A = perm[X] + Y;
    const AA = perm[A];
    const AB = perm[A + 1];
    const B = perm[X + 1] + Y;
    const BA = perm[B];
    const BB = perm[B + 1];

    // Add weighted contributions from corners
    const result = lerp(
      lerp(grad(perm[AA], x, y), grad(perm[BA], x - 1, y), u),
      lerp(grad(perm[AB], x, y - 1), grad(perm[BB], x - 1, y - 1), u),
      v
    );

    // Normalize to 0-1
    return (result + 1) / 2;
  };

  // Generate the noise array
  const noiseArray = new Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      noiseArray[y * width + x] = noise2D(x * scale, y * scale);
    }
  }

  return noiseArray;
};

/**
 * Pattern Types Enumeration
 */
export const PATTERN_TYPES = {
  SOLID: 'solid',
  DOT: 'dot',
  LINE: 'line',
  NOISE: 'noise',
  CROSSHATCH: 'crosshatch',
  DITHER: 'dither',
  CHECKER: 'checker',
  PERLIN: 'perlin',
  FLOW_FIELD: 'flow_field',
};

/**
 * Main pattern generation function
 * @param {object} options - Pattern options
 * @param {string} options.type - Pattern type from PATTERN_TYPES
 * @param {number} options.size - Size of the pattern grid
 * @param {string} options.primaryColor - Primary color in hex format
 * @param {string} options.secondaryColor - Secondary color in hex format (if applicable)
 * @param {number} options.density - Pattern density (0-1)
 * @param {number} options.angle - Rotation angle in degrees (if applicable)
 * @param {number} options.seed - Random seed (if applicable)
 * @returns {Array} Generated pattern data
 */
export const generatePattern = options => {
  const {
    type = PATTERN_TYPES.SOLID,
    size = 16,
    primaryColor = '#000000',
    secondaryColor = '#FFFFFF',
    density = 0.5,
    angle = 0,
    seed = Math.floor(Math.random() * 10000),
  } = options;

  // Generate the requested pattern type
  switch (type) {
    case PATTERN_TYPES.SOLID:
      return generateSolidPattern(size, primaryColor);
    case PATTERN_TYPES.DOT:
      return generateDotPattern(size, density, primaryColor);
    case PATTERN_TYPES.LINE:
      return generateLinePattern(size, density, primaryColor, angle);
    case PATTERN_TYPES.NOISE:
      return generateNoisePattern(size, density, primaryColor, secondaryColor, seed);
    case PATTERN_TYPES.CROSSHATCH:
      return generateCrosshatchPattern(size, density, primaryColor);
    case PATTERN_TYPES.DITHER:
      return generateDitherPattern(primaryColor, secondaryColor, density);
    case PATTERN_TYPES.CHECKER:
      return generateCheckerPattern(size, primaryColor, secondaryColor);
    case PATTERN_TYPES.PERLIN:
      return generatePerlinPattern(size, density, primaryColor, secondaryColor, seed);
    case PATTERN_TYPES.FLOW_FIELD:
      return generateFlowFieldPattern(size, density, primaryColor, angle, seed);
    default:
      console.warn(`Unknown pattern type: ${type}, falling back to solid`);
      return generateSolidPattern(size, primaryColor);
  }
};

// Utility functions
const validateNumeric = (
  value,
  name,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY
) => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${name} must be a number`);
  }
  if (value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
};

const validateColor = color => {
  if (typeof color !== 'string' || !color.match(/^#([0-9A-F]{3}){1,2}$/i)) {
    throw new Error('Invalid color format, must be hex (e.g., #FF0000)');
  }
};

const hexToRgb = hex => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Generates a solid color pattern
 * @param {number} size - Size of the pattern grid
 * @param {string} color - Color in hex format
 * @returns {Array} Pattern data
 */
const generateSolidPattern = (size, color) => {
  validateNumeric(size, 'size', 1);
  validateColor(color);
  return Array(size * size).fill(color);
};

/**
 * Generates a dot pattern
 * @param {number} size - Size of the pattern grid
 * @param {number} density - Dot density (0-1)
 * @param {string} color - Color in hex format
 * @returns {Array} Pattern data
 */
const generateDotPattern = (size, density, color) => {
  validateNumeric(size, 'size', 1);
  validateNumeric(density, 'density', 0, 1);
  validateColor(color);

  const pattern = Array(size * size).fill(null);
  const spacing = Math.max(1, Math.floor(1 / density));
  const offset = Math.floor(spacing / 2);

  for (let y = offset; y < size; y += spacing) {
    for (let x = offset; x < size; x += spacing) {
      const index = y * size + x;
      if (index < pattern.length) {
        pattern[index] = color;
      }
    }
  }

  return pattern;
};

/**
 * Generates a line pattern
 * @param {number} size - Size of the pattern grid
 * @param {number} density - Line density (0-1)
 * @param {string} color - Color in hex format
 * @param {number} angle - Rotation angle in degrees
 * @returns {Array} Pattern data
 */
const generateLinePattern = (size, density, color, angle) => {
  validateNumeric(size, 'size', 1);
  validateNumeric(density, 'density', 0, 1);
  validateColor(color);
  validateNumeric(angle, 'angle');

  const pattern = Array(size * size).fill(null);
  const spacing = Math.max(1, Math.floor(1 / density));
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Project point onto line direction
      const projected = x * cos + y * sin;
      if (Math.round(projected) % spacing === 0) {
        pattern[y * size + x] = color;
      }
    }
  }

  return pattern;
};

/**
 * Generates a noise pattern with improved control
 * @param {number} size - Size of the pattern grid
 * @param {number} density - Noise density (0-1)
 * @param {string} color1 - First color in hex format
 * @param {string} color2 - Second color in hex format
 * @param {number} seed - Random seed
 * @returns {Array} Pattern data
 */
const generateNoisePattern = (size, density, color1, color2, seed) => {
  validateNumeric(size, 'size', 1);
  validateNumeric(density, 'density', 0, 1);
  validateColor(color1);
  validateColor(color2);

  const pattern = Array(size * size);
  const random = seedrandom(seed);
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  for (let i = 0; i < pattern.length; i++) {
    const noise = random();
    if (noise < density) {
      const blend = noise / density;
      pattern[i] = rgbToHex(
        Math.round(rgb1.r * blend + rgb2.r * (1 - blend)),
        Math.round(rgb1.g * blend + rgb2.g * (1 - blend)),
        Math.round(rgb1.b * blend + rgb2.b * (1 - blend))
      );
    } else {
      pattern[i] = null;
    }
  }

  return pattern;
};

/**
 * Generates a crosshatch pattern with variable density
 * @param {number} size - Size of the pattern grid
 * @param {number} density - Pattern density (0-1)
 * @param {string} color - Color in hex format
 * @returns {Array} Pattern data
 */
const generateCrosshatchPattern = (size, density, color) => {
  validateNumeric(size, 'size', 1);
  validateNumeric(density, 'density', 0, 1);
  validateColor(color);

  const pattern = Array(size * size).fill(null);
  const spacing = Math.max(1, Math.floor(1 / density));

  // First diagonal line set
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if ((x + y) % spacing === 0) {
        pattern[y * size + x] = color;
      }
    }
  }

  // Second diagonal line set
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if ((x - y + size) % spacing === 0 && !pattern[y * size + x]) {
        pattern[y * size + x] = color;
      }
    }
  }

  return pattern;
};

/**
 * Generates a dither pattern with improved quality
 * @param {string} color1 - First color in hex format
 * @param {string} color2 - Second color in hex format
 * @param {number} density - Pattern density (0-1)
 * @returns {Array} Pattern data
 */
const generateDitherPattern = (color1, color2, density) => {
  validateColor(color1);
  validateColor(color2);
  validateNumeric(density, 'density', 0, 1);

  // Bayer matrix for ordered dithering
  const bayerMatrix = [
    [0, 12, 3, 15],
    [8, 4, 11, 7],
    [2, 14, 1, 13],
    [10, 6, 9, 5],
  ];

  const pattern = Array(16).fill(null);
  const threshold = Math.floor(density * 16);

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const index = y * 4 + x;
      pattern[index] = bayerMatrix[y][x] < threshold ? color1 : color2;
    }
  }

  return pattern;
};

/**
 * Generates a checker pattern with custom sizing
 * @param {number} size - Size of the pattern grid
 * @param {string} color1 - First color in hex format
 * @param {string} color2 - Second color in hex format
 * @returns {Array} Pattern data
 */
const generateCheckerPattern = (size, color1, color2) => {
  validateNumeric(size, 'size', 1);
  validateColor(color1);
  validateColor(color2);

  const pattern = Array(size * size).fill(null);
  const cellSize = Math.max(1, Math.floor(size / 8));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cellX = Math.floor(x / cellSize);
      const cellY = Math.floor(y / cellSize);
      pattern[y * size + x] = (cellX + cellY) % 2 === 0 ? color1 : color2;
    }
  }

  return pattern;
};

/**
 * Generates a Perlin noise-based pattern
 * @param {number} size - Size of the pattern grid
 * @param {number} density - Pattern density (0-1)
 * @param {string} color1 - First color in hex format
 * @param {string} color2 - Second color in hex format
 * @param {number} seed - Random seed
 * @returns {Array} Pattern data
 */
const generatePerlinPattern = (size, density, color1, color2, seed) => {
  validateNumeric(size, 'size', 1);
  validateNumeric(density, 'density', 0, 1);
  validateColor(color1);
  validateColor(color2);

  const pattern = Array(size * size);
  const noise = generatePerlinNoise(size, size, 0.1, seed); // Scale factor 0.1 for smoother noise
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  for (let i = 0; i < pattern.length; i++) {
    const value = noise[i] * density;
    if (value > 0.5) {
      const blend = (value - 0.5) * 2;
      pattern[i] = rgbToHex(
        Math.round(rgb1.r * blend + rgb2.r * (1 - blend)),
        Math.round(rgb1.g * blend + rgb2.g * (1 - blend)),
        Math.round(rgb1.b * blend + rgb2.b * (1 - blend))
      );
    } else {
      pattern[i] = null;
    }
  }

  return pattern;
};

/**
 * Generates a flow field-based pattern
 * @param {number} size - Size of the pattern grid
 * @param {number} density - Pattern density (0-1)
 * @param {string} color - Color in hex format
 * @param {number} angle - Base angle for flow field
 * @param {number} seed - Random seed
 * @returns {Array} Pattern data
 */
const generateFlowFieldPattern = (size, density, color, angle, seed) => {
  validateNumeric(size, 'size', 1);
  validateNumeric(density, 'density', 0, 1);
  validateColor(color);
  validateNumeric(angle, 'angle');

  const pattern = Array(size * size).fill(null);
  const random = seedrandom(seed);

  // Generate flow field vectors
  const vectors = Array(size * size)
    .fill()
    .map(() => ({
      angle: angle + (random() - 0.5) * Math.PI,
      strength: random() * density,
    }));

  // Generate pattern following flow field
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = y * size + x;
      const vector = vectors[index];
      const dx = Math.cos(vector.angle) * vector.strength;
      const dy = Math.sin(vector.angle) * vector.strength;

      // Check if we should draw at this point
      if (random() < density) {
        pattern[index] = color;

        // Draw flow line (refactored to reduce nesting depth)
        drawFlowLine(pattern, x, y, dx, dy, color, size);
      }
    }
  }

  return pattern;
};

/**
 * Draws a flow line on the pattern
 * @param {Array} pattern - Pattern data
 * @param {number} x - Starting x position
 * @param {number} y - Starting y position
 * @param {number} dx - Delta x
 * @param {number} dy - Delta y
 * @param {string} color - Color in hex format
 * @param {number} size - Size of the pattern grid
 */
const drawFlowLine = (pattern, x, y, dx, dy, color, size) => {
  // Draw flow line
  let curX = x;
  let curY = y;
  for (let step = 0; step < 3; step++) {
    curX += dx;
    curY += dy;
    const newX = Math.floor(curX);
    const newY = Math.floor(curY);
    if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
      pattern[newY * size + newX] = color;
    }
  }
};

// Export as default for module compatibility
const proceduralGenerator = {
  PATTERN_TYPES,
  generatePattern,
  generatePerlinNoise,
};

export default proceduralGenerator;
