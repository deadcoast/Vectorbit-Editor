// src/components/Grid/DrawingTools.js
import { debounce } from 'lodash';

import { multiplyColors, screenColors, overlayColors } from '../../utils/color/colorCore';

/**
 * Brush Types and Effects Configuration
 */
export const BRUSH_TYPES = {
  FILLED: 'filled',
  OUTLINE: 'outline',
  PATTERNED: 'patterned',
  GRADIENT: 'gradient',
  AIRBRUSH: 'airbrush',
  PIXEL_PERFECT: 'pixel_perfect',
  TEXTURED: 'textured',
  DITHERED: 'dithered',
  NOISE: 'noise',
  SYMMETRICAL: 'symmetrical',
  SHADER: 'shader',
  BLEND: 'blend',
};

export const BRUSH_EFFECTS = {
  NONE: 'none',
  GLOW: 'glow',
  BLUR: 'blur',
  SHARPEN: 'sharpen',
  OUTLINE_EFFECT: 'outline_effect',
  SHADOW: 'shadow',
  NEON: 'neon',
};

/**
 * Enhanced Brush Application with Effects
 */
export const applyBrush = (x, y, color, brushConfig, gridSize, setCellColors) => {
  const {
    type = BRUSH_TYPES.FILLED,
    size = 1,
    opacity = 1,
    effect = BRUSH_EFFECTS.NONE,
    pressure = 1,
    angle = 0,
    spacing = 1,
    texture = null,
    blendMode = 'normal',
  } = brushConfig;

  const updateCell = (x, y, color, opacity = 1) => {
    const index = y * gridSize + x;
    if (index >= 0 && index < gridSize * gridSize) {
      setCellColors(prev => {
        const updatedColors = [...prev];
        const finalColor = applyBlendMode(updatedColors[index], color, blendMode, opacity);
        updatedColors[index] = finalColor;
        return updatedColors;
      });
    }
  };

  // Apply different brush types
  switch (type) {
    case BRUSH_TYPES.PIXEL_PERFECT:
      applyPixelPerfectBrush(x, y, color, size, updateCell);
      break;

    case BRUSH_TYPES.AIRBRUSH:
      applyAirbrush(x, y, color, size, pressure, opacity, updateCell);
      break;

    case BRUSH_TYPES.TEXTURED:
      applyTexturedBrush(x, y, color, size, texture, opacity, updateCell);
      break;

    case BRUSH_TYPES.DITHERED:
      applyDitheredBrush(x, y, color, size, updateCell);
      break;

    case BRUSH_TYPES.SYMMETRICAL:
      applySymmetricalBrush(x, y, color, size, gridSize, updateCell);
      break;

    case BRUSH_TYPES.SHADER:
      applyShaderBrush(x, y, color, size, angle, updateCell);
      break;

    case BRUSH_TYPES.NOISE:
      applyNoiseBrush(x, y, color, size, opacity, updateCell);
      break;

    case BRUSH_TYPES.GRADIENT:
      applyGradientBrush(x, y, color, size, angle, opacity, updateCell);
      break;

    default:
      // Default to pixel perfect brush if type is not recognized
      applyPixelPerfectBrush(x, y, color, size, updateCell);
      break;
  }

  // Apply effects
  if (effect !== BRUSH_EFFECTS.NONE) {
    applyBrushEffect(x, y, effect, color, size, gridSize, setCellColors);
  }
};

/**
 * Advanced Brush Type Implementations
 */
const applyPixelPerfectBrush = (x, y, color, size, updateCell) => {
  // Implementation using Xiaolin Wu's line algorithm for anti-aliasing
  const plotPixel = (x, y, opacity) => {
    updateCell(Math.floor(x), Math.floor(y), color, opacity);
  };

  // Circular brush with anti-aliasing
  for (let dx = -size; dx <= size; dx++) {
    for (let dy = -size; dy <= size; dy++) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= size) {
        const opacity = Math.max(0, 1 - distance / size);
        plotPixel(x + dx, y + dy, opacity);
      }
    }
  }
};

const applyAirbrush = (x, y, color, size, pressure, opacity, updateCell) => {
  const sprayDensity = pressure * 0.5;
  const points = generateSprayPoints(x, y, size, sprayDensity);

  points.forEach(point => {
    const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
    const pointOpacity = opacity * (1 - distance / size);
    updateCell(point.x, point.y, color, pointOpacity);
  });
};

const applyTexturedBrush = (x, y, color, size, texture, opacity, updateCell) => {
  // Generate a texture pattern based on the texture type and size
  const texturePattern = generateTexturePattern(texture, size);

  for (let dx = -size; dx <= size; dx++) {
    for (let dy = -size; dy <= size; dy++) {
      const textureOpacity = texturePattern[dx + size][dy + size] * opacity;
      updateCell(x + dx, y + dy, color, textureOpacity);
    }
  }
};

const applyDitheredBrush = (x, y, color, size, updateCell) => {
  // Get predefined dithering patterns
  const patterns = getDitheringPatterns();
  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

  for (let dx = -size; dx <= size; dx++) {
    for (let dy = -size; dy <= size; dy++) {
      if (selectedPattern[(dx + size) % 4][(dy + size) % 4]) {
        updateCell(x + dx, y + dy, color);
      }
    }
  }
};

/**
 * Brush Effects Implementation
 */
const applyBrushEffect = (x, y, effect, color, size, gridSize, setCellColors) => {
  switch (effect) {
    case BRUSH_EFFECTS.GLOW:
      applyGlowEffect(x, y, color, size, gridSize, setCellColors);
      break;

    case BRUSH_EFFECTS.BLUR:
      applyBlurEffect(x, y, size, gridSize, setCellColors);
      break;

    case BRUSH_EFFECTS.NEON:
      applyNeonEffect(x, y, color, size, gridSize, setCellColors);
      break;

    default:
      // No effect applied
      break;
  }
};

/**
 * Utility Functions
 */
const applyBlendMode = (baseColor, blendColor, mode, opacity) => {
  if (!baseColor) return blendColor;

  switch (mode) {
    case 'multiply':
      return multiplyColors(baseColor, blendColor, opacity);
    case 'screen':
      return screenColors(baseColor, blendColor, opacity);
    case 'overlay':
      return overlayColors(baseColor, blendColor, opacity);
    default:
      return blendColor;
  }
};

// Missing function implementations for brush effects
const applySymmetricalBrush = (x, y, color, size, gridSize, updateCell) => {
  // Apply symmetrical brush with mirrored points across the grid
  const centerX = Math.floor(gridSize / 2);
  const centerY = Math.floor(gridSize / 2);

  // Apply the brush at the original point
  applyPixelPerfectBrush(x, y, color, size, updateCell);

  // Apply mirroring on X axis
  const mirrorX = centerX + (centerX - x);
  if (mirrorX >= 0 && mirrorX < gridSize) {
    applyPixelPerfectBrush(mirrorX, y, color, size, updateCell);
  }

  // Apply mirroring on Y axis
  const mirrorY = centerY + (centerY - y);
  if (mirrorY >= 0 && mirrorY < gridSize) {
    applyPixelPerfectBrush(x, mirrorY, color, size, updateCell);
  }

  // Apply mirroring on both X and Y axes
  if (mirrorX >= 0 && mirrorX < gridSize && mirrorY >= 0 && mirrorY < gridSize) {
    applyPixelPerfectBrush(mirrorX, mirrorY, color, size, updateCell);
  }
};

const applyShaderBrush = (x, y, color, size, angle, updateCell) => {
  // Apply shader brush with angular gradient
  for (let dx = -size; dx <= size; dx++) {
    for (let dy = -size; dy <= size; dy++) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= size) {
        const pointAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        const angleDiff = Math.abs((pointAngle - angle) % 360);
        const opacity = Math.max(0, 1 - angleDiff / 180 - distance / size);
        updateCell(x + dx, y + dy, color, opacity);
      }
    }
  }
};

const applyNoiseBrush = (x, y, color, size, opacity, updateCell) => {
  // Apply noise brush with random opacity variations
  for (let dx = -size; dx <= size; dx++) {
    for (let dy = -size; dy <= size; dy++) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= size) {
        const noiseOpacity = opacity * Math.random();
        updateCell(x + dx, y + dy, color, noiseOpacity);
      }
    }
  }
};

const applyGradientBrush = (x, y, color, size, angle, opacity, updateCell) => {
  // Apply gradient brush with directional fade
  const radianAngle = angle * (Math.PI / 180);
  const dirX = Math.cos(radianAngle);
  const dirY = Math.sin(radianAngle);

  for (let dx = -size; dx <= size; dx++) {
    for (let dy = -size; dy <= size; dy++) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= size) {
        // Calculate dot product for directional gradient
        const dot = (dx * dirX + dy * dirY) / size;
        const gradientOpacity = opacity * Math.max(0, 0.5 + dot * 0.5);
        updateCell(x + dx, y + dy, color, gradientOpacity);
      }
    }
  }
};

// Functions for generating patterns and textures
const generateTexturePattern = (texture, size) => {
  // Create a 2D array for the texture pattern
  const pattern = Array(size * 2 + 1)
    .fill()
    .map(() => Array(size * 2 + 1).fill(0));

  // Fill the pattern based on texture type
  if (!texture) return pattern;

  switch (texture) {
    case 'dots':
      // Create a dotted pattern
      for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
          pattern[i][j] = i % 2 === 0 && j % 2 === 0 ? 1 : 0;
        }
      }
      break;
    case 'lines':
      // Create a lined pattern
      for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
          pattern[i][j] = i % 3 === 0 ? 1 : 0;
        }
      }
      break;
    case 'grid':
      // Create a grid pattern
      for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
          pattern[i][j] = i % 3 === 0 || j % 3 === 0 ? 1 : 0;
        }
      }
      break;
    default:
      // Random noise texture
      for (let i = 0; i < pattern.length; i++) {
        for (let j = 0; j < pattern[i].length; j++) {
          pattern[i][j] = Math.random();
        }
      }
  }

  return pattern;
};

const getDitheringPatterns = () => {
  // Return a set of dithering patterns
  return [
    [
      [1, 0, 0, 1],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [1, 0, 0, 1],
    ],
    [
      [1, 0, 1, 0],
      [0, 1, 0, 1],
      [1, 0, 1, 0],
      [0, 1, 0, 1],
    ],
    [
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 1],
      [0, 0, 1, 1],
    ],
  ];
};

// Functions for special effects
const applyGlowEffect = (x, y, color, size, gridSize, setCellColors) => {
  const glowRadius = size * 2;
  const glowIntensity = 0.8;

  setCellColors(prev => {
    const updatedColors = [...prev];

    // Apply glow effect in a larger radius than the brush
    // Helper function to apply glow at a specific point
    const applyGlowAtPoint = (dx, dy) => {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > glowRadius) {
        return; // Skip points outside glow radius
      }

      const glowX = x + dx;
      const glowY = y + dy;
      const index = glowY * gridSize + glowX;

      // Skip invalid indices
      if (index < 0 || index >= gridSize * gridSize) {
        return;
      }

      // Calculate glow opacity based on distance
      const opacity = glowIntensity * (1 - distance / glowRadius);

      // Only apply glow if it would make the cell brighter
      if (!updatedColors[index] || opacity > 0.1) {
        updatedColors[index] = color; // Simplified for example
      }
    };

    // Process all points within glow radius
    for (let dx = -glowRadius; dx <= glowRadius; dx++) {
      for (let dy = -glowRadius; dy <= glowRadius; dy++) {
        applyGlowAtPoint(dx, dy);
      }
    }

    return updatedColors;
  });
};

const applyBlurEffect = (x, y, size, gridSize, setCellColors) => {
  const blurRadius = Math.max(1, Math.floor(size / 2));

  setCellColors(prev => {
    const updatedColors = [...prev];
    const tempColors = [...prev];

    // Create a list of positions to blur
    const positions = [];
    for (let dx = -blurRadius; dx <= blurRadius; dx++) {
      for (let dy = -blurRadius; dy <= blurRadius; dy++) {
        positions.push([x + dx, y + dy]);
      }
    }

    // Apply blur to each position
    positions.forEach(([blurX, blurY]) => {
      const index = blurY * gridSize + blurX;

      if (isValidIndex(index, gridSize)) {
        const count = getNeighborCount(blurX, blurY, gridSize, tempColors);

        if (count > 0) {
          // Simplified color blending
          updatedColors[index] = tempColors[index]; // Placeholder for actual blur
        }
      }
    });

    return updatedColors;
  });
};

// Helper function to count valid neighbors for blur effect
const getNeighborCount = (x, y, gridSize, colors) => {
  let count = 0;

  // Check each neighbor in a 3x3 grid
  // Using a 3x3 grid pattern for neighbors
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 0],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  directions.forEach(([bx, by]) => {
    const sampleX = x + bx;
    const sampleY = y + by;
    const sampleIndex = sampleY * gridSize + sampleX;

    if (isValidIndex(sampleIndex, gridSize) && colors[sampleIndex]) {
      count++;
    }
  });

  return count;
};

// Helper function to check if an index is valid
const isValidIndex = (index, gridSize) => {
  return index >= 0 && index < gridSize * gridSize;
};

const applyNeonEffect = (x, y, color, size, gridSize, setCellColors) => {
  // Neon effect combines glow with a bright center
  // First apply a glow effect
  applyGlowEffect(x, y, color, size, gridSize, setCellColors);

  // Then add a bright center
  setCellColors(prev => {
    const updatedColors = [...prev];

    // Add bright center
    for (let dx = -size / 2; dx <= size / 2; dx++) {
      for (let dy = -size / 2; dy <= size / 2; dy++) {
        const centerX = x + dx;
        const centerY = y + dy;
        const index = centerY * gridSize + centerX;

        if (index >= 0 && index < gridSize * gridSize) {
          // Make the center brighter
          updatedColors[index] = color; // In a real implementation, we would lighten the color
        }
      }
    }

    return updatedColors;
  });
};

const generateSprayPoints = (x, y, size, density) => {
  const points = [];
  const numPoints = Math.floor(size * size * density);

  for (let i = 0; i < numPoints; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * size;
    points.push({
      x: Math.floor(x + Math.cos(angle) * radius),
      y: Math.floor(y + Math.sin(angle) * radius),
    });
  }

  return points;
};

// Export additional utility functions
export const getBrushPreview = (brushConfig = {}) => {
  // Generate brush preview for UI based on brush configuration
  return {
    previewData: { type: brushConfig.type || BRUSH_TYPES.FILLED },
  };
};

export const getBrushSize = (pressure, baseSize) => {
  return Math.max(1, Math.floor(baseSize * pressure));
};

// Debounced update function for performance
export const debouncedBrushUpdate = debounce(updateFn => {
  updateFn();
}, 16);
