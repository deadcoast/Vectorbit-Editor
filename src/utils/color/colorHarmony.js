/**
 * Color Harmony Utilities
 * A collection of functions for generating harmonious color combinations
 * based on color theory principles.
 */

import colorUtils from './colorUtils';

/**
 * Harmony Types Enumeration
 */
export const HARMONY_TYPES = {
  COMPLEMENTARY: 'complementary',
  ANALOGOUS: 'analogous',
  TRIADIC: 'triadic',
  SPLIT_COMPLEMENTARY: 'split_complementary',
  TETRADIC: 'tetradic',
  SQUARE: 'square',
  MONOCHROMATIC: 'monochromatic',
};

/**
 * Generate a complementary color palette (two colors opposite on the color wheel).
 * @param {string} baseColor - Base color in hexadecimal format.
 * @returns {Array<string>} - Array of hexadecimal colors in the harmony.
 */
export const getComplementaryHarmony = baseColor => {
  const { h, s, l } = colorUtils.hexToHsl(baseColor);
  const complementary = (h + 180) % 360;

  return [baseColor, colorUtils.hslToHex(complementary, s, l)];
};

/**
 * Generate an analogous color palette (colors adjacent on the color wheel).
 * @param {string} baseColor - Base color in hexadecimal format.
 * @param {number} angle - Angle between colors (default: 30).
 * @param {number} count - Number of colors to generate (default: 3).
 * @returns {Array<string>} - Array of hexadecimal colors in the harmony.
 */
export const getAnalogousHarmony = (baseColor, angle = 30, count = 3) => {
  const { h, s, l } = colorUtils.hexToHsl(baseColor);
  const colors = [];

  const startAngle = h - ((count - 1) / 2) * angle;

  for (let i = 0; i < count; i++) {
    const newHue = (startAngle + i * angle + 360) % 360;
    colors.push(colorUtils.hslToHex(newHue, s, l));
  }

  return colors;
};

/**
 * Generate a triadic color palette (three colors evenly spaced on the color wheel).
 * @param {string} baseColor - Base color in hexadecimal format.
 * @returns {Array<string>} - Array of hexadecimal colors in the harmony.
 */
export const getTriadicHarmony = baseColor => {
  const { h, s, l } = colorUtils.hexToHsl(baseColor);

  return [
    baseColor,
    colorUtils.hslToHex((h + 120) % 360, s, l),
    colorUtils.hslToHex((h + 240) % 360, s, l),
  ];
};

/**
 * Generate a split complementary color palette.
 * @param {string} baseColor - Base color in hexadecimal format.
 * @param {number} angle - Angle to split from the complementary (default: 30).
 * @returns {Array<string>} - Array of hexadecimal colors in the harmony.
 */
export const getSplitComplementaryHarmony = (baseColor, angle = 30) => {
  const { h, s, l } = colorUtils.hexToHsl(baseColor);
  const complementary = (h + 180) % 360;

  return [
    baseColor,
    colorUtils.hslToHex((complementary - angle + 360) % 360, s, l),
    colorUtils.hslToHex((complementary + angle) % 360, s, l),
  ];
};

/**
 * Generate a tetradic (double complementary) color palette.
 * @param {string} baseColor - Base color in hexadecimal format.
 * @param {number} angle - Angle between first and second pair (default: 60).
 * @returns {Array<string>} - Array of hexadecimal colors in the harmony.
 */
export const getTetradicHarmony = (baseColor, angle = 60) => {
  const { h, s, l } = colorUtils.hexToHsl(baseColor);

  return [
    baseColor,
    colorUtils.hslToHex((h + angle) % 360, s, l),
    colorUtils.hslToHex((h + 180) % 360, s, l),
    colorUtils.hslToHex((h + 180 + angle) % 360, s, l),
  ];
};

/**
 * Generate a square color palette (four colors evenly spaced on the color wheel).
 * @param {string} baseColor - Base color in hexadecimal format.
 * @returns {Array<string>} - Array of hexadecimal colors in the harmony.
 */
export const getSquareHarmony = baseColor => {
  const { h, s, l } = colorUtils.hexToHsl(baseColor);

  return [
    baseColor,
    colorUtils.hslToHex((h + 90) % 360, s, l),
    colorUtils.hslToHex((h + 180) % 360, s, l),
    colorUtils.hslToHex((h + 270) % 360, s, l),
  ];
};

/**
 * Generate a monochromatic color palette (variations in lightness of the same hue).
 * @param {string} baseColor - Base color in hexadecimal format.
 * @param {number} count - Number of colors to generate (default: 5).
 * @returns {Array<string>} - Array of hexadecimal colors in the harmony.
 */
export const getMonochromaticHarmony = (baseColor, count = 5) => {
  const { h, s, l } = colorUtils.hexToHsl(baseColor);
  const colors = [];

  const lightnessStep = 100 / (count - 1);

  for (let i = 0; i < count; i++) {
    const newLightness = Math.min(100, Math.max(0, i * lightnessStep));
    colors.push(colorUtils.hslToHex(h, s, newLightness));
  }

  return colors;
};

/**
 * Generate a color harmony based on the specified type.
 * @param {string} baseColor - Base color in hexadecimal format.
 * @param {string} harmonyType - Type of harmony from HARMONY_TYPES.
 * @param {Object} options - Additional options for the specific harmony.
 * @returns {Array<string>} - Array of hexadecimal colors in the harmony.
 */
export const getColorHarmony = (baseColor, harmonyType, options = {}) => {
  switch (harmonyType) {
    case HARMONY_TYPES.COMPLEMENTARY:
      return getComplementaryHarmony(baseColor);
    case HARMONY_TYPES.ANALOGOUS:
      return getAnalogousHarmony(baseColor, options.angle, options.count);
    case HARMONY_TYPES.TRIADIC:
      return getTriadicHarmony(baseColor);
    case HARMONY_TYPES.SPLIT_COMPLEMENTARY:
      return getSplitComplementaryHarmony(baseColor, options.angle);
    case HARMONY_TYPES.TETRADIC:
      return getTetradicHarmony(baseColor, options.angle);
    case HARMONY_TYPES.SQUARE:
      return getSquareHarmony(baseColor);
    case HARMONY_TYPES.MONOCHROMATIC:
      return getMonochromaticHarmony(baseColor, options.count);
    default:
      console.warn(`Unknown harmony type: ${harmonyType}, falling back to complementary`);
      return getComplementaryHarmony(baseColor);
  }
};

// Export as default for module compatibility
const colorHarmony = {
  HARMONY_TYPES,
  getColorHarmony,
  getComplementaryHarmony,
  getAnalogousHarmony,
  getTriadicHarmony,
  getSplitComplementaryHarmony,
  getTetradicHarmony,
  getSquareHarmony,
  getMonochromaticHarmony,
};

export default colorHarmony;
