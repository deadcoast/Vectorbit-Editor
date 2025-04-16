
/**
 * Generate a complementary color palette based on color theory.
 * @param {string} color - Base color in HEX format.
 * @returns {Array<string>} - Array of complementary colors.
 */
export const generateComplementary = (color) => {
  const complement = `#${color
    .slice(1)
    .match(/.{2}/g)
    .map((hex) => (255 - parseInt(hex, 16)).toString(16).padStart(2, "0"))
    .join("")}`;
  return [color, complement];
};

/**
 * Generate an analogous color palette based on color theory.
 * @param {string} color - Base color in HEX format.
 * @param {number} step - Degree of separation between analogous colors (default: 30).
 * @returns {Array<string>} - Array of analogous colors.
 */
export const generateAnalogous = (color, step = 30) => {
  return [-step, 0, step].map((angle) => adjustHue(color, angle));
};

/**
 * Generate a triadic color palette based on color theory.
 * @param {string} color - Base color in HEX format.
 * @returns {Array<string>} - Array of triadic colors.
 */
export const generateTriadic = (color) => {
  return [0, 120, 240].map((angle) => adjustHue(color, angle));
};

/**
 * Generate a tetradic color palette based on color theory.
 * @param {string} color - Base color in HEX format.
 * @returns {Array<string>} - Array of tetradic colors.
 */
export const generateTetradic = (color) => {
  return [0, 90, 180, 270].map((angle) => adjustHue(color, angle));
};

/**
 * Generate a monochromatic color palette.
 * Creates variations of brightness for a single hue.
 * @param {string} color - Base color in HEX format.
 * @param {number} steps - Number of monochromatic variations (default: 5).
 * @returns {Array<string>} - Array of monochromatic colors.
 */
export const generateMonochromatic = (color, steps = 5) => {
  const [r, g, b] = color.slice(1).match(/.{2}/g).map((hex) => parseInt(hex, 16));
  const hsv = rgbToHsv(r, g, b);
  return Array.from({ length: steps }, (_, i) => {
    const factor = (i + 1) / steps;
    const [newR, newG, newB] = hsvToRgb(hsv[0], hsv[1], hsv[2] * factor);
    return `#${[newR, newG, newB]
      .map((val) => val.toString(16).padStart(2, "0"))
      .join("")}`;
  });
};

/**
 * Generate a random palette with customizable size.
 * @param {number} size - Number of colors in the palette (default: 5).
 * @returns {Array<string>} - Array of random colors.
 */
export const generateRandomPalette = (size = 5) => {
  return Array.from({ length: size }, () =>
    `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`
  );
};

/**
 * Adjust the hue of a color by a given angle.
 * @param {string} color - Base color in HEX format.
 * @param {number} angle - Angle in degrees to adjust the hue.
 * @returns {string} - Adjusted color in HEX format.
 */
const adjustHue = (color, angle) => {
  const [r, g, b] = color.slice(1).match(/.{2}/g).map((hex) => parseInt(hex, 16));
  const hsv = rgbToHsv(r, g, b);
  hsv[0] = (hsv[0] + angle + 360) % 360; // Ensure hue stays within 0-360
  const [newR, newG, newB] = hsvToRgb(hsv[0], hsv[1], hsv[2]);
  return `#${[newR, newG, newB]
    .map((val) => val.toString(16).padStart(2, "0"))
    .join("")}`;
};

/**
 * Convert RGB to HSV.
 * @param {number} r - Red component (0-255).
 * @param {number} g - Green component (0-255).
 * @param {number} b - Blue component (0-255).
 * @returns {Array<number>} - Array of HSV values ([hue, saturation, value]).
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
 * @param {number} v - Value/Brightness (0-1).
 * @returns {Array<number>} - Array of RGB values ([red, green, blue]).
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
