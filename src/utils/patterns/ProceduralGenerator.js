
/**
 * src/utils/patterns/ProceduralGenerator.js
 * Base Pattern Generators
 * Implementation of core pattern generation functions
 */

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
      const blend = (noise / density);
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
    [ 0, 12,  3, 15],
    [ 8,  4, 11,  7],
    [ 2, 14,  1, 13],
    [10,  6,  9,  5]
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
  const vectors = Array(size * size).fill().map(() => ({
    angle: angle + (random() - 0.5) * Math.PI,
    strength: random() * density
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
      }
    }
  }

  return pattern;
};
