/**
 * BlendModeProcessor.js
 * Provides utility functions for processing blend modes between layers
 */

import { hexToRgb, rgbToHex } from '../color';

/**
 * Blend modes supported by the application
 */
export const BLEND_MODES = {
  NORMAL: 'normal',
  MULTIPLY: 'multiply',
  SCREEN: 'screen',
  OVERLAY: 'overlay',
  DARKEN: 'darken',
  LIGHTEN: 'lighten',
  COLOR_DODGE: 'color-dodge',
  COLOR_BURN: 'color-burn',
  HARD_LIGHT: 'hard-light',
  SOFT_LIGHT: 'soft-light',
  DIFFERENCE: 'difference',
  EXCLUSION: 'exclusion',
  HUE: 'hue',
  SATURATION: 'saturation',
  COLOR: 'color',
  LUMINOSITY: 'luminosity',
};

/**
 * Apply opacity to RGB values
 * @param {Object} rgb - RGB color object {r, g, b}
 * @param {number} opacity - Opacity value between 0 and 1
 * @returns {Object} - RGB color with opacity applied
 */
const applyOpacity = (rgb, opacity) => {
  return {
    r: Math.round(rgb.r * opacity),
    g: Math.round(rgb.g * opacity),
    b: Math.round(rgb.b * opacity),
  };
};

/**
 * Clamp RGB values to valid range (0-255)
 * @param {Object} rgb - RGB color object {r, g, b}
 * @returns {Object} - RGB color with values clamped to 0-255
 */
const clampRgb = rgb => {
  return {
    r: Math.min(255, Math.max(0, rgb.r)),
    g: Math.min(255, Math.max(0, rgb.g)),
    b: Math.min(255, Math.max(0, rgb.b)),
  };
};

/**
 * Apply blend mode between base color and blend color with opacity
 * @param {string} baseColor - Base layer color in hex
 * @param {string} blendColor - Blending layer color in hex
 * @param {string} blendMode - Blend mode to apply
 * @param {number} opacity - Opacity of the blending layer (0-1)
 * @returns {string} - Resulting color in hex format
 */
export const applyBlendMode = (
  baseColor,
  blendColor,
  blendMode = BLEND_MODES.NORMAL,
  opacity = 1
) => {
  // If no blendColor or it's fully transparent, return baseColor
  if (!blendColor || opacity === 0) {
    return baseColor;
  }

  // If blend mode is normal and opacity is 1, just return blendColor
  if (blendMode === BLEND_MODES.NORMAL && opacity === 1) {
    return blendColor;
  }

  // Convert colors to RGB
  const base = hexToRgb(baseColor || '#FFFFFF');
  const blend = applyOpacity(hexToRgb(blendColor), opacity);

  let result;

  // Apply blend mode logic
  switch (blendMode) {
    case BLEND_MODES.MULTIPLY:
      result = {
        r: (base.r * blend.r) / 255,
        g: (base.g * blend.g) / 255,
        b: (base.b * blend.b) / 255,
      };
      break;

    case BLEND_MODES.SCREEN:
      result = {
        r: 255 - ((255 - base.r) * (255 - blend.r)) / 255,
        g: 255 - ((255 - base.g) * (255 - blend.g)) / 255,
        b: 255 - ((255 - base.b) * (255 - blend.b)) / 255,
      };
      break;

    case BLEND_MODES.OVERLAY:
      result = {
        r:
          base.r < 128
            ? (2 * base.r * blend.r) / 255
            : 255 - (2 * (255 - base.r) * (255 - blend.r)) / 255,
        g:
          base.g < 128
            ? (2 * base.g * blend.g) / 255
            : 255 - (2 * (255 - base.g) * (255 - blend.g)) / 255,
        b:
          base.b < 128
            ? (2 * base.b * blend.b) / 255
            : 255 - (2 * (255 - base.b) * (255 - blend.b)) / 255,
      };
      break;

    case BLEND_MODES.DARKEN:
      result = {
        r: Math.min(base.r, blend.r),
        g: Math.min(base.g, blend.g),
        b: Math.min(base.b, blend.b),
      };
      break;

    case BLEND_MODES.LIGHTEN:
      result = {
        r: Math.max(base.r, blend.r),
        g: Math.max(base.g, blend.g),
        b: Math.max(base.b, blend.b),
      };
      break;

    case BLEND_MODES.COLOR_DODGE:
      result = {
        r: (() => {
          if (base.r === 0) return 0;
          if (blend.r === 255) return 255;
          return Math.min(255, (base.r * 255) / (255 - blend.r));
        })(),
        g: (() => {
          if (base.g === 0) return 0;
          if (blend.g === 255) return 255;
          return Math.min(255, (base.g * 255) / (255 - blend.g));
        })(),
        b: (() => {
          if (base.b === 0) return 0;
          if (blend.b === 255) return 255;
          return Math.min(255, (base.b * 255) / (255 - blend.b));
        })(),
      };
      break;

    case BLEND_MODES.COLOR_BURN:
      result = {
        r: (() => {
          if (base.r === 255) return 255;
          if (blend.r === 0) return 0;
          return 255 - Math.min(255, ((255 - base.r) * 255) / blend.r);
        })(),
        g: (() => {
          if (base.g === 255) return 255;
          if (blend.g === 0) return 0;
          return 255 - Math.min(255, ((255 - base.g) * 255) / blend.g);
        })(),
        b: (() => {
          if (base.b === 255) return 255;
          if (blend.b === 0) return 0;
          return 255 - Math.min(255, ((255 - base.b) * 255) / blend.b);
        })(),
      };
      break;

    case BLEND_MODES.DIFFERENCE:
      result = {
        r: Math.abs(base.r - blend.r),
        g: Math.abs(base.g - blend.g),
        b: Math.abs(base.b - blend.b),
      };
      break;

    case BLEND_MODES.EXCLUSION:
      result = {
        r: base.r + blend.r - (2 * base.r * blend.r) / 255,
        g: base.g + blend.g - (2 * base.g * blend.g) / 255,
        b: base.b + blend.b - (2 * base.b * blend.b) / 255,
      };
      break;

    case BLEND_MODES.NORMAL:
    default: {
      // For normal blend with opacity < 1, we do alpha compositing
      const alpha = opacity;
      result = {
        r: (1 - alpha) * base.r + alpha * blend.r,
        g: (1 - alpha) * base.g + alpha * blend.g,
        b: (1 - alpha) * base.b + alpha * blend.b,
      };
      break;
    }
  }

  // Clamp values and convert back to hex
  return rgbToHex(clampRgb(result));
};

// Create a default export object containing all the functions
const BlendModeProcessor = {
  BLEND_MODES,
  clampRgb,
  applyOpacity,
  applyBlendMode,
  processLayerStack,
  getCompositePixelColor,
};

export default BlendModeProcessor;

/**
 * Process multiple layers with their blend modes and opacity
 * @param {Object} layers - Array of layer objects with gridData, blendMode, and opacity
 * @param {string} cellKey - Cell key in format "x,y"
 * @returns {string} - Final color in hex format after blending all visible layers
 */
export const processLayerStack = (layers, cellKey) => {
  // Start with transparent background
  let resultColor = '#FFFFFF';

  // Process layers from bottom to top
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];

    // Skip hidden layers
    if (!layer.visible) {
      continue;
    }

    const cellColor = layer.gridData[cellKey];

    // Skip empty/transparent cells
    if (!cellColor) {
      continue;
    }

    // Apply the cell color with the layer's blend mode and opacity
    resultColor = applyBlendMode(resultColor, cellColor, layer.blendMode, layer.opacity);
  }

  return resultColor;
};

/**
 * Get the composite color for a single pixel across all layers
 * @param {Array} layers - Array of layer objects with gridData, blendMode, and opacity
 * @param {number} x - X coordinate of the pixel
 * @param {number} y - Y coordinate of the pixel
 * @returns {string} - Final color in hex format after blending all visible layers
 */
export const getCompositePixelColor = (layers, x, y) => {
  const cellKey = `${x},${y}`;
  return processLayerStack(layers, cellKey);
};
