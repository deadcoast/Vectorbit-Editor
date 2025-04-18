/**
 * Centralized Color Utilities
 *
 * This module exports a unified set of color functions to prevent duplication
 * across the codebase. Import from this file instead of using separate
 * implementations in different modules.
 */

// Import from colorCore but don't re-export (to avoid naming conflicts)
import * as colorCoreUtils from './colorCore';
// Import specific utilities from meta_modulated modules
import { harmonizePalette as metaHarmonize, harmonizeColor } from './meta_modulated/colorHarmony';

// Common color conversion utilities
export const hexToRgb = hex => {
  const cleanHex = hex.replace(/^#/, '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

export const rgbToHex = (r, g, b) => {
  const toHex = value => {
    const hex = Math.round(value).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const rotateHue = (hex, angle) => {
  const { r, g, b } = hexToRgb(hex);
  const hsv = rgbToHsv(r, g, b);
  hsv[0] = (hsv[0] + angle + 360) % 360; // Keep hue within 0-360
  const [newR, newG, newB] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
  return rgbToHex(newR, newG, newB);
};

export const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const s = max === 0 ? 0 : diff / max;
  const v = max;

  if (diff !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / diff + 2) * 60;
        break;
      case b:
        h = ((r - g) / diff + 4) * 60;
        break;
      default:
        // This should never happen as max must be r, g, or b
        h = 0;
        break;
    }
  }

  return [h, s, v];
};

export const hsvToRgb = (h, s, v) => {
  let r, g, b;

  const i = Math.floor(h / 60) % 6;
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      // Since we're doing i % 6, this should never happen, but added for linting compliance
      r = v;
      g = p;
      b = q;
      break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Export common color adjustment functions
export const adjustBrightness = (hex, amount) => {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + amount / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
  return rgbToHex(newR, newG, newB);
};

export const blendColors = (color1, color2, ratio = 0.5) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

  return rgbToHex(r, g, b);
};

// Create a unified export object that merges functionality from all sources
const colorUtils = {
  // Add methods from this file
  hexToRgb,
  rgbToHex,
  rotateHue,
  rgbToHsv,
  hsvToRgb,
  adjustBrightness,
  blendColors,
  // Add methods from meta_modulated
  harmonizePalette: metaHarmonize,
  harmonizeColor,
  // Add methods from colorCore (without naming conflicts)
  ...colorCoreUtils,
};

export default colorUtils;

// Re-export colorUtils functions for compatibility
export { colorUtils };
