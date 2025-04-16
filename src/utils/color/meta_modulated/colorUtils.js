
/**
 * Convert HEX color to RGB.
 * @param {string} hex - HEX color code (e.g., "#FFFFFF").
 * @returns {Object} - RGB object with properties { r, g, b }.
 */
export const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

/**
 * Convert RGB color to HEX.
 * @param {number} r - Red value (0-255).
 * @param {number} g - Green value (0-255).
 * @param {number} b - Blue value (0-255).
 * @returns {string} - HEX color code (e.g., "#FFFFFF").
 */
export const rgbToHex = (r, g, b) => {
  const toHex = (value) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Rotate the hue of a HEX color by a given angle.
 * @param {string} hex - HEX color code.
 * @param {number} angle - Angle in degrees to rotate the hue.
 * @returns {string} - Adjusted HEX color code.
 */
export const rotateHue = (hex, angle) => {
  const { r, g, b } = hexToRgb(hex);
  const hsv = rgbToHsv(r, g, b);
  hsv[0] = (hsv[0] + angle + 360) % 360; // Keep hue within 0-360
  const [newR, newG, newB] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
  return rgbToHex(newR, newG, newB);
};

/**
 * Lighten or darken a HEX color.
 * @param {string} hex - HEX color code.
 * @param {number} amount - Percentage to lighten/darken (-100 to 100).
 * @returns {string} - Adjusted HEX color code.
 */
export const adjustBrightness = (hex, amount) => {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + amount / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
  return rgbToHex(newR, newG, newB);
};

/**
 * Blend two HEX colors together.
 * @param {string} color1 - First HEX color.
 * @param {string} color2 - Second HEX color.
 * @param {number} ratio - Blend ratio (0.0 to 1.0).
 * @returns {string} - Blended HEX color.
 */
export const blendColors = (color1, color2, ratio = 0.5) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const blend = (val1, val2) =>
    Math.round(val1 * (1 - ratio) + val2 * ratio);

  return rgbToHex(
    blend(rgb1.r, rgb2.r),
    blend(rgb1.g, rgb2.g),
    blend(rgb1.b, rgb2.b)
  );
};

/**
 * Generate a complementary color palette.
 * @param {string} baseColor - Base HEX color.
 * @returns {Array<string>} - Complementary palette.
 */
export const generateComplementary = (baseColor) => {
  return [baseColor, rotateHue(baseColor, 180)];
};

/**
 * Generate an analogous color palette.
 * @param {string} baseColor - Base HEX color.
 * @returns {Array<string>} - Analogous palette.
 */
export const generateAnalogous = (baseColor) => {
  return [-30, 0, 30].map((angle) => rotateHue(baseColor, angle));
};

/**
 * Generate a triadic color palette.
 * @param {string} baseColor - Base HEX color.
 * @returns {Array<string>} - Triadic palette.
 */
export const generateTriadic = (baseColor) => {
  return [0, 120, 240].map((angle) => rotateHue(baseColor, angle));
};

/**
 * Generate a tetradic color palette.
 * @param {string} baseColor - Base HEX color.
 * @returns {Array<string>} - Tetradic palette.
 */
export const generateTetradic = (baseColor) => {
  return [0, 90, 180, 270].map((angle) => rotateHue(baseColor, angle));
};

/**
 * Generate a random palette.
 * @param {number} size - Number of colors in the palette (default: 5).
 * @returns {Array<string>} - Array of random HEX colors.
 */
export const generateRandomPalette = (size = 5) => {
  return Array.from({ length: size }, () =>
    `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`
  );
};

/**
 * Convert RGB to HSV.
 * @param {number} r - Red value (0-255).
 * @param {number} g - Green value (0-255).
 * @param {number} b - Blue value (0-255).
 * @returns {Array<number>} - HSV values [hue, saturation, value].
 */
const rgbToHsv = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return [h * 60, s, v];
};

/**
 * Convert HSV to RGB.
 * @param {number} h - Hue (0-360).
 * @param {number} s - Saturation (0-1).
 * @param {number} v - Value (0-1).
 * @returns {Array<number>} - RGB values [red, green, blue].
 */
const hsvToRgb = (h, s, v) => {
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;

  let [r, g, b] = [0, 0, 0];

  if (h >= 0 && h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 60 && h < 120) {
           [r, g, b] = [x, c, 0];
         } else if (h >= 120 && h < 180) {
                  [r, g, b] = [0, c, x];
                } else if (h >= 180 && h < 240) {
                         [r, g, b] = [0, x, c];
                       } else if (h >= 240 && h < 300) {
                                [r, g, b] = [x, 0, c];
                              } else if (h >= 300 && h <= 360) {
                                       [r, g, b] = [c, 0, x];
                                     }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
};
