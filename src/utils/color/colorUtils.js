/**
 * Color Utility Functions
 * A collection of helper functions for working with colors
 * in various formats (HEX, RGB, HSL, etc.)
 */

/**
 * Convert a HEX color to RGB object.
 * @param {string} hex - Color in hexadecimal format (e.g., "#FF0000").
 * @returns {Object} - RGB object with r, g, b properties (0-255).
 */
export const hexToRgb = hex => {
  // Remove the hash if it exists
  const cleanHex = hex.charAt(0) === '#' ? hex.substring(1) : hex;

  // Handle both 3-digit and 6-digit hex codes
  const expandedHex =
    cleanHex.length === 3
      ? cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2]
      : cleanHex;

  // Convert to RGB values
  const r = parseInt(expandedHex.substring(0, 2), 16);
  const g = parseInt(expandedHex.substring(2, 4), 16);
  const b = parseInt(expandedHex.substring(4, 6), 16);

  return { r, g, b };
};

/**
 * Convert RGB values to HEX color.
 * @param {number} r - Red value (0-255).
 * @param {number} g - Green value (0-255).
 * @param {number} b - Blue value (0-255).
 * @returns {string} - Color in hexadecimal format.
 */
export const rgbToHex = (r, g, b) => {
  const toHex = value => {
    const hex = Math.max(0, Math.min(255, Math.round(value))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Convert RGB to HSL.
 * @param {number} r - Red value (0-255).
 * @param {number} g - Green value (0-255).
 * @param {number} b - Blue value (0-255).
 * @returns {Object} - HSL object with h (0-360), s (0-100), l (0-100).
 */
export const rgbToHsl = (r, g, b) => {
  // Normalize RGB values
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;

  const max = Math.max(normR, normG, normB);
  const min = Math.min(normR, normG, normB);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case normR:
        h = ((normG - normB) / delta + (normG < normB ? 6 : 0)) * 60;
        break;
      case normG:
        h = ((normB - normR) / delta + 2) * 60;
        break;
      case normB:
        h = ((normR - normG) / delta + 4) * 60;
        break;
      default:
        // This case should not occur since max must be one of the normalized RGB values
        h = 0;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

/**
 * Convert HSL to RGB.
 * @param {number} h - Hue (0-360).
 * @param {number} s - Saturation (0-100).
 * @param {number} l - Lightness (0-100).
 * @returns {Object} - RGB object with r, g, b properties (0-255).
 */
export const hslToRgb = (h, s, l) => {
  // Normalize HSL values
  const normH = h / 360;
  const normS = s / 100;
  const normL = l / 100;

  let r, g, b;

  if (normS === 0) {
    r = g = b = normL; // Grayscale
  } else {
    const hueToRgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = normL < 0.5 ? normL * (1 + normS) : normL + normS - normL * normS;
    const p = 2 * normL - q;

    r = hueToRgb(p, q, normH + 1 / 3);
    g = hueToRgb(p, q, normH);
    b = hueToRgb(p, q, normH - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

/**
 * Convert HEX to HSL.
 * @param {string} hex - Color in hexadecimal format.
 * @returns {Object} - HSL object with h, s, l properties.
 */
export const hexToHsl = hex => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
};

/**
 * Convert HSL to HEX.
 * @param {number} h - Hue (0-360).
 * @param {number} s - Saturation (0-100).
 * @param {number} l - Lightness (0-100).
 * @returns {string} - Color in hexadecimal format.
 */
export const hslToHex = (h, s, l) => {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

/**
 * Adjust the brightness of a color.
 * @param {string} hex - Color in hexadecimal format.
 * @param {number} factor - Amount to adjust brightness (-100 to 100).
 * @returns {string} - Adjusted color in hexadecimal format.
 */
export const adjustBrightness = (hex, factor) => {
  const { h, s, l } = hexToHsl(hex);
  const newL = Math.max(0, Math.min(100, l + factor));
  return hslToHex(h, s, newL);
};

/**
 * Generate a random color.
 * @param {number} minBrightness - Minimum brightness (0-100).
 * @param {number} maxBrightness - Maximum brightness (0-100).
 * @returns {string} - Random color in hexadecimal format.
 */
export const getRandomColor = (minBrightness = 0, maxBrightness = 100) => {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 100);
  const l = Math.floor(Math.random() * (maxBrightness - minBrightness) + minBrightness);
  return hslToHex(h, s, l);
};

/**
 * Calculate the contrast ratio between two colors.
 * @param {string} colorA - First color in hexadecimal format.
 * @param {string} colorB - Second color in hexadecimal format.
 * @returns {number} - Contrast ratio (1-21).
 */
export const getContrastRatio = (colorA, colorB) => {
  const luminance = hex => {
    const rgb = hexToRgb(hex);
    const normRGB = {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255,
    };

    // Apply gamma correction
    Object.keys(normRGB).forEach(key => {
      normRGB[key] =
        normRGB[key] <= 0.03928
          ? normRGB[key] / 12.92
          : Math.pow((normRGB[key] + 0.055) / 1.055, 2.4);
    });

    // Calculate relative luminance
    return 0.2126 * normRGB.r + 0.7152 * normRGB.g + 0.0722 * normRGB.b;
  };

  const luminA = luminance(colorA);
  const luminB = luminance(colorB);

  const lighter = Math.max(luminA, luminB);
  const darker = Math.min(luminA, luminB);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if a color is accessible on another color based on WCAG guidelines.
 * @param {string} foreground - Foreground color in hexadecimal format.
 * @param {string} background - Background color in hexadecimal format.
 * @param {string} level - WCAG level ('AA' or 'AAA').
 * @param {string} size - Text size ('small' or 'large').
 * @returns {boolean} - Whether the color combination is accessible.
 */
export const isAccessible = (foreground, background, level = 'AA', size = 'small') => {
  const ratio = getContrastRatio(foreground, background);

  const thresholds = {
    AA: {
      small: 4.5,
      large: 3,
    },
    AAA: {
      small: 7,
      large: 4.5,
    },
  };

  return ratio >= thresholds[level][size];
};

// Export as default for module compatibility
const colorUtils = {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hexToHsl,
  hslToHex,
  adjustBrightness,
  getRandomColor,
  getContrastRatio,
  isAccessible,
};

export default colorUtils;
