// src/components/Grid/DrawingTools.js
import { debounce } from "lodash";
import { interpolateColors, generateNoise } from "../utils/colorUtils";

/**
 * Brush Types and Effects Configuration
 */
export const BRUSH_TYPES = {
  FILLED: "filled",
  OUTLINE: "outline",
  PATTERNED: "patterned",
  GRADIENT: "gradient",
  AIRBRUSH: "airbrush",
  PIXEL_PERFECT: "pixel_perfect",
  TEXTURED: "textured",
  DITHERED: "dithered",
  NOISE: "noise",
  SYMMETRICAL: "symmetrical",
  SHADER: "shader",
  BLEND: "blend",
};

export const BRUSH_EFFECTS = {
  NONE: "none",
  GLOW: "glow",
  BLUR: "blur",
  SHARPEN: "sharpen",
  OUTLINE_EFFECT: "outline_effect",
  SHADOW: "shadow",
  NEON: "neon",
};

/**
 * Enhanced Brush Application with Effects
 */
export const applyBrush = (
  x,
  y,
  color,
  brushConfig,
  gridSize,
  setCellColors
) => {
  const {
    type = BRUSH_TYPES.FILLED,
    size = 1,
    opacity = 1,
    effect = BRUSH_EFFECTS.NONE,
    pressure = 1,
    angle = 0,
    spacing = 1,
    texture = null,
    blendMode = "normal",
  } = brushConfig;

  const updateCell = (x, y, color, opacity = 1) => {
    const index = y * gridSize + x;
    if (index >= 0 && index < gridSize * gridSize) {
      setCellColors((prev) => {
        const updatedColors = [...prev];
        const finalColor = applyBlendMode(
          updatedColors[index],
          color,
          blendMode,
          opacity
        );
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

    // ... existing brush types remain but enhanced
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

  points.forEach((point) => {
    const distance = Math.sqrt(
      Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2)
    );
    const pointOpacity = opacity * (1 - distance / size);
    updateCell(point.x, point.y, color, pointOpacity);
  });
};

const applyTexturedBrush = (
  x,
  y,
  color,
  size,
  texture,
  opacity,
  updateCell
) => {
  const texturePattern = generateTexturePattern(texture, size);

  for (let dx = -size; dx <= size; dx++) {
    for (let dy = -size; dy <= size; dy++) {
      const textureOpacity = texturePattern[dx + size][dy + size] * opacity;
      updateCell(x + dx, y + dy, color, textureOpacity);
    }
  }
};

const applyDitheredBrush = (x, y, color, size, updateCell) => {
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
const applyBrushEffect = (
  x,
  y,
  effect,
  color,
  size,
  gridSize,
  setCellColors
) => {
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

    // ... more effects
  }
};

/**
 * Utility Functions
 */
const applyBlendMode = (baseColor, blendColor, mode, opacity) => {
  if (!baseColor) return blendColor;

  switch (mode) {
    case "multiply":
      return multiplyColors(baseColor, blendColor, opacity);
    case "screen":
      return screenColors(baseColor, blendColor, opacity);
    case "overlay":
      return overlayColors(baseColor, blendColor, opacity);
    default:
      return blendColor;
  }
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
export const getBrushPreview = (brushConfig) => {
  // Generate brush preview for UI
  // Implementation details...
};

export const getBrushSize = (pressure, baseSize) => {
  return Math.max(1, Math.floor(baseSize * pressure));
};

// Debounced update function for performance
export const debouncedBrushUpdate = debounce((updateFn) => {
  updateFn();
}, 16);
