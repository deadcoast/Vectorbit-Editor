/**
 * Helper: Generate a random number within a range.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} - Random number within range.
 */
const randomInRange = (min, max) => Math.random() * (max - min) + min;

/**
 * Generate a random palette using Color Dispositionalism.
 * Aligns colors with specific moods or emotions.
 *
 * @param {string} disposition - Mood or emotion ("calm", "energetic", "warm", "cool").
 * @param {number} size - Number of colors in the palette (default: 5).
 * @returns {Array<string>} - Array of HEX color codes.
 */
export const generatePaletteByDisposition = (disposition = 'calm', size = 5) => {
  const dispositionRanges = {
    calm: { hue: [180, 240], saturation: [20, 50], lightness: [70, 90] },
    energetic: { hue: [0, 60], saturation: [70, 100], lightness: [50, 70] },
    warm: { hue: [0, 60], saturation: [50, 80], lightness: [60, 80] },
    cool: { hue: [180, 300], saturation: [40, 70], lightness: [60, 80] },
  };

  const { hue, saturation, lightness } =
    dispositionRanges[disposition] || dispositionRanges['calm'];

  return Array.from({ length: size }, () => {
    const h = randomInRange(hue[0], hue[1]);
    const s = randomInRange(saturation[0], saturation[1]);
    const l = randomInRange(lightness[0], lightness[1]);
    return hslToHex(h, s, l);
  });
};

/**
 * Generate a random palette using Visual Resonance Mapping (VRM).
 * Based on wave frequency analysis for psychologically harmonious colors.
 *
 * @param {number} size - Number of colors in the palette (default: 5).
 * @returns {Array<string>} - Array of HEX color codes.
 */
export const generatePaletteByResonance = (size = 5) => {
  const baseFrequency = Math.random() * 1000; // Base frequency in Hz

  return Array.from({ length: size }, (_, i) => {
    const frequency = baseFrequency + i * 50; // Increment frequency for each color
    const wavelength = 300 / frequency; // Convert frequency to wavelength
    const rgb = wavelengthToRgb(wavelength); // Convert wavelength to RGB
    return rgbToHex(rgb.r, rgb.g, rgb.b); // Convert RGB to HEX
  });
};

/**
 * Generate a random palette using Chromatic Synergy Theory (CST).
 * Balances warmth, contrast, and vibrancy for optimal aesthetic appeal.
 *
 * @param {number} size - Number of colors in the palette (default: 5).
 * @returns {Array<string>} - Array of HEX color codes.
 */
export const generatePaletteByChromaticSynergy = (size = 5) => {
  const baseHue = Math.random() * 360; // Random base hue
  const warmthBalance = Math.random() * 0.5 + 0.5; // Warmth factor (0.5-1)
  const contrastFactor = Math.random() * 0.3 + 0.7; // Contrast factor (0.7-1)

  return Array.from({ length: size }, (_, i) => {
    const hue = (baseHue + i * (360 / size)) % 360;
    const saturation = Math.random() * 30 + 70; // High saturation
    const lightness = warmthBalance * (contrastFactor * 50 + Math.random() * 25);
    return hslToHex(hue, saturation, lightness);
  });
};

/**
 * Helper: Convert wavelength (in nanometers) to RGB.
 * Based on physics of visible light spectrum (380nm-780nm).
 * @param {number} wavelength - Wavelength in nanometers.
 * @returns {Object} - RGB object with properties { r, g, b }.
 */
const wavelengthToRgb = wavelength => {
  let r, g, b;

  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0;
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0;
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
    b = 0;
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1;
    g = 0;
    b = 0;
  } else {
    r = g = b = 0;
  }

  // Calculate intensity factor based on wavelength
  let factor = 1;
  if (wavelength >= 380 && wavelength < 420) {
    factor = 0.3 + (0.7 * (wavelength - 380)) / 40;
  } else if (wavelength > 700 && wavelength <= 780) {
    factor = 0.3 + (0.7 * (780 - wavelength)) / 80;
  }

  return {
    r: Math.round(r * factor * 255),
    g: Math.round(g * factor * 255),
    b: Math.round(b * factor * 255),
  };
};

/**
 * Helper: Convert RGB to HEX.
 * @param {number} r - Red value (0-255).
 * @param {number} g - Green value (0-255).
 * @param {number} b - Blue value (0-255).
 * @returns {string} - HEX color code.
 */
const rgbToHex = (r, g, b) => {
  const toHex = value => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Helper: Convert HSL to HEX.
 * @param {number} h - Hue (0-360).
 * @param {number} s - Saturation (0-100).
 * @param {number} l - Lightness (0-100).
 * @returns {string} - HEX color code.
 */
const hslToHex = (h, s, l) => {
  const chroma = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100);
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l / 100 - chroma / 2;

  let [r, g, b] = [0, 0, 0];
  if (h >= 0 && h < 60) {
    [r, g, b] = [chroma, x, 0];
  } else if (h >= 60 && h < 120) {
    [r, g, b] = [x, chroma, 0];
  } else if (h >= 120 && h < 180) {
    [r, g, b] = [0, chroma, x];
  } else if (h >= 180 && h < 240) [r, g, b] = [0, x, chroma];
  else if (h >= 240 && h < 300) [r, g, b] = [x, 0, chroma];
  else if (h >= 300 && h <= 360) [r, g, b] = [chroma, 0, x];

  return rgbToHex(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255));
};

// Export as default for module compatibility
const randomPalette = {
  generatePaletteByDisposition,
  generatePaletteByResonance,
  generatePaletteByChromaticSynergy,
};

export default randomPalette;
