/**
 * Color Theory Utilities
 * Advanced color theory concepts and emotion-based color generation
 */

import colorUtils from './colorUtils';

/**
 * Color Meaning/Emotion Mapping
 */
export const COLOR_EMOTIONS = {
  HAPPY: 'happy',
  CALM: 'calm',
  ENERGETIC: 'energetic',
  SERIOUS: 'serious',
  PLAYFUL: 'playful',
  ELEGANT: 'elegant',
  NATURAL: 'natural',
  TECHNICAL: 'technical',
  CREATIVE: 'creative',
  TRUSTWORTHY: 'trustworthy',
};

/**
 * HSL ranges associated with different emotions
 */
const emotionHSLRanges = {
  [COLOR_EMOTIONS.HAPPY]: {
    h: [30, 60], // Yellow-orange
    s: [70, 100],
    l: [50, 70],
  },
  [COLOR_EMOTIONS.CALM]: {
    h: [180, 240], // Cyan-blue
    s: [30, 60],
    l: [60, 80],
  },
  [COLOR_EMOTIONS.ENERGETIC]: {
    h: [0, 30], // Red-orange
    s: [80, 100],
    l: [50, 60],
  },
  [COLOR_EMOTIONS.SERIOUS]: {
    h: [210, 270], // Blue-purple
    s: [30, 50],
    l: [20, 40],
  },
  [COLOR_EMOTIONS.PLAYFUL]: {
    h: [280, 340], // Purple-pink
    s: [70, 100],
    l: [65, 85],
  },
  [COLOR_EMOTIONS.ELEGANT]: {
    h: [270, 330], // Purple-magenta
    s: [20, 40],
    l: [15, 30],
  },
  [COLOR_EMOTIONS.NATURAL]: {
    h: [60, 150], // Yellow-green
    s: [30, 70],
    l: [40, 60],
  },
  [COLOR_EMOTIONS.TECHNICAL]: {
    h: [200, 240], // Blue
    s: [50, 70],
    l: [40, 60],
  },
  [COLOR_EMOTIONS.CREATIVE]: {
    h: [270, 330], // Purple-magenta
    s: [60, 90],
    l: [50, 70],
  },
  [COLOR_EMOTIONS.TRUSTWORTHY]: {
    h: [200, 240], // Blue
    s: [60, 80],
    l: [40, 60],
  },
};

/**
 * Generate a random value within a specified range
 * @param {Array} range - Min and max values [min, max]
 * @returns {number} - Random value within the range
 */
const randomInRange = range => {
  const [min, max] = range;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a color based on a specific emotion
 * @param {string} emotion - One of the values from COLOR_EMOTIONS
 * @returns {string} - HEX color representing the emotion
 */
export const generateEmotionColor = emotion => {
  if (!emotionHSLRanges[emotion]) {
    console.warn(`Unknown emotion: ${emotion}, falling back to random color`);
    return colorUtils.getRandomColor();
  }

  const ranges = emotionHSLRanges[emotion];
  const h = randomInRange(ranges.h);
  const s = randomInRange(ranges.s);
  const l = randomInRange(ranges.l);

  return colorUtils.hslToHex(h, s, l);
};

/**
 * Generate an accessibility-optimized color palette for text and background
 * @param {string} baseColor - Base HEX color
 * @param {string} wcagLevel - WCAG compliance level ('AA' or 'AAA')
 * @returns {Object} - Object containing foreground and background colors
 */
export const generateAccessiblePalette = (baseColor, wcagLevel = 'AA') => {
  const { h, s, l } = colorUtils.hexToHsl(baseColor);

  // Decide whether to use light or dark text based on base color's brightness
  const isDark = l < 50;
  let backgroundColor = baseColor;
  let textColor;

  if (isDark) {
    // For dark background, try to find a light text color
    textColor = '#FFFFFF';

    // If not accessible, adjust the background
    if (!colorUtils.isAccessible(textColor, backgroundColor, wcagLevel)) {
      // Darken the background until it's accessible with white text
      for (let newL = l; newL >= 0; newL -= 5) {
        backgroundColor = colorUtils.hslToHex(h, s, newL);
        if (colorUtils.isAccessible(textColor, backgroundColor, wcagLevel)) {
          break;
        }
      }
    }
  } else {
    // For light background, try to find a dark text color
    textColor = '#000000';

    // If not accessible, adjust the background
    if (!colorUtils.isAccessible(textColor, backgroundColor, wcagLevel)) {
      // Lighten the background until it's accessible with black text
      for (let newL = l; newL <= 100; newL += 5) {
        backgroundColor = colorUtils.hslToHex(h, s, newL);
        if (colorUtils.isAccessible(textColor, backgroundColor, wcagLevel)) {
          break;
        }
      }
    }
  }

  return {
    background: backgroundColor,
    text: textColor,
  };
};

/**
 * Generate a consistent brand palette based on a base color
 * @param {string} baseColor - Base HEX color for the brand
 * @returns {Object} - Object containing primary, secondary, accent, and neutral colors
 */
export const generateBrandPalette = baseColor => {
  const { h, s, l } = colorUtils.hexToHsl(baseColor);

  // Generate a complementary accent color
  const accentHue = (h + 180) % 360;

  // Create variations of primary color
  const primaryLight = colorUtils.hslToHex(h, s, Math.min(100, l + 20));
  const primaryDark = colorUtils.hslToHex(h, s, Math.max(0, l - 20));

  // Create secondary color (adjacent on color wheel)
  const secondaryHue = (h + 30) % 360;
  const secondary = colorUtils.hslToHex(secondaryHue, s, l);

  // Create accent color
  const accent = colorUtils.hslToHex(accentHue, s, l);

  // Create neutral grays with a hint of the primary color
  const neutrals = {
    light: colorUtils.hslToHex(h, Math.max(0, s - 50), 90),
    medium: colorUtils.hslToHex(h, Math.max(0, s - 60), 50),
    dark: colorUtils.hslToHex(h, Math.max(0, s - 70), 20),
  };

  return {
    primary: {
      main: baseColor,
      light: primaryLight,
      dark: primaryDark,
    },
    secondary: {
      main: secondary,
    },
    accent: {
      main: accent,
    },
    neutrals: neutrals,
  };
};

/**
 * Calculate color temperature (warm vs. cool)
 * @param {string} hexColor - HEX color code
 * @returns {number} - Temperature value (-1 to 1, where negative is cool, positive is warm)
 */
export const getColorTemperature = hexColor => {
  const { h } = colorUtils.hexToHsl(hexColor);

  // Colors between 0-30 and 330-360 are warm (red, orange)
  // Colors between 90-270 are cool (green, blue, purple)
  // Other colors are transitional

  let warmFactor;

  if ((h >= 0 && h <= 30) || (h >= 330 && h <= 360)) {
    // Warm: red to orange
    warmFactor = 1;
  } else if (h > 30 && h < 90) {
    // Transitioning from warm to cool: orange to green
    warmFactor = 1 - (h - 30) / 60;
  } else if (h >= 90 && h <= 270) {
    // Cool: green to blue to purple
    warmFactor = -1;
  } else {
    // Transitioning from cool to warm: purple to red
    warmFactor = -1 + (h - 270) / 60;
  }

  return warmFactor;
};

// Export as default for module compatibility
const colorTheory = {
  COLOR_EMOTIONS,
  generateEmotionColor,
  generateAccessiblePalette,
  generateBrandPalette,
  getColorTemperature,
};

export default colorTheory;
