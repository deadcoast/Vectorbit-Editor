// src/utils/color/colorCore.js

/**
 * Color Space Conversion Functions
 */

export const hexToRgb = hex => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

// Convert any color format to hex
export const colorToHex = color => {
  // If already hex format, return as is
  if (typeof color === 'string' && color.startsWith('#')) {
    return color;
  }

  // If it's an RGB object
  if (typeof color === 'object' && 'r' in color && 'g' in color && 'b' in color) {
    return rgbToHex(color.r, color.g, color.b);
  }

  // Default fallback - return black if can't convert
  return '#000000';
};

export const rgbToHex = (r, g, b) => {
  const toHex = value => value.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const rgbToHsv = (r, g, b) => {
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

export const hsvToRgb = (h, s, v) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
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

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

export const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

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

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

export const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / delta + 2) * 60;
        break;
      case b:
        h = ((r - g) / delta + 4) * 60;
        break;
      default:
        // This should never happen since max must be one of r, g, or b
        h = 0;
        break;
    }
  }

  return [h, s * 100, l * 100];
};

export const hslToHex = (h, s, l) => {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
};

export const hexToHsl = hex => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
};

/**
 * Color Manipulation Functions
 */

export const rotateHue = (hex, angle) => {
  const { r, g, b } = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newHue = (h + angle + 360) % 360;
  const [newR, newG, newB] = hslToRgb(newHue, s, l);
  return rgbToHex(newR, newG, newB);
};

export const adjustBrightness = (hex, amount) => {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + amount / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));
  return rgbToHex(newR, newG, newB);
};

export const adjustSaturation = (hex, amount) => {
  const { r, g, b } = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  const newSaturation = Math.min(100, Math.max(0, s + amount));
  const [newR, newG, newB] = hslToRgb(h, newSaturation, l);
  return rgbToHex(newR, newG, newB);
};

/**
 * Color Blending Functions
 */
export const blendColors = (color1, color2, ratio = 0.5) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const blend = (val1, val2) => Math.round(val1 * (1 - ratio) + val2 * ratio);

  return rgbToHex(blend(rgb1.r, rgb2.r), blend(rgb1.g, rgb2.g), blend(rgb1.b, rgb2.b));
};

export const multiplyColors = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  return rgbToHex((rgb1.r * rgb2.r) / 255, (rgb1.g * rgb2.g) / 255, (rgb1.b * rgb2.b) / 255);
};

export const screenColors = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  return rgbToHex(
    255 - ((255 - rgb1.r) * (255 - rgb2.r)) / 255,
    255 - ((255 - rgb1.g) * (255 - rgb2.g)) / 255,
    255 - ((255 - rgb1.b) * (255 - rgb2.b)) / 255
  );
};

export const overlayColors = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const overlay = (a, b) => (a < 128 ? (2 * a * b) / 255 : 255 - (2 * (255 - a) * (255 - b)) / 255);

  return rgbToHex(overlay(rgb1.r, rgb2.r), overlay(rgb1.g, rgb2.g), overlay(rgb1.b, rgb2.b));
};

export const darkenColor = (color, amount) => {
  const rgb = hexToRgb(color);
  const factor = 1 - amount;

  return rgbToHex(
    Math.round(rgb.r * factor),
    Math.round(rgb.g * factor),
    Math.round(rgb.b * factor)
  );
};

export const lightenColor = (color, amount) => {
  const rgb = hexToRgb(color);
  const factor = amount;

  return rgbToHex(
    Math.round(rgb.r + (255 - rgb.r) * factor),
    Math.round(rgb.g + (255 - rgb.g) * factor),
    Math.round(rgb.b + (255 - rgb.b) * factor)
  );
};

export const blendMode = {
  normal: (base, blend) => blend,
  multiply: multiplyColors,
  screen: screenColors,
  overlay: overlayColors,
  darken: (base, blend) => {
    const baseRgb = hexToRgb(base);
    const blendRgb = hexToRgb(blend);
    return rgbToHex(
      Math.min(baseRgb.r, blendRgb.r),
      Math.min(baseRgb.g, blendRgb.g),
      Math.min(baseRgb.b, blendRgb.b)
    );
  },
  lighten: (base, blend) => {
    const baseRgb = hexToRgb(base);
    const blendRgb = hexToRgb(blend);
    return rgbToHex(
      Math.max(baseRgb.r, blendRgb.r),
      Math.max(baseRgb.g, blendRgb.g),
      Math.max(baseRgb.b, blendRgb.b)
    );
  },
  dodge: (base, blend) => {
    const baseRgb = hexToRgb(base);
    const blendRgb = hexToRgb(blend);

    const dodge = (a, b) => (b === 255 ? 255 : Math.min(255, Math.floor((a * 256) / (255 - b))));

    return rgbToHex(
      dodge(baseRgb.r, blendRgb.r),
      dodge(baseRgb.g, blendRgb.g),
      dodge(baseRgb.b, blendRgb.b)
    );
  },
  burn: (base, blend) => {
    const baseRgb = hexToRgb(base);
    const blendRgb = hexToRgb(blend);

    const burn = (a, b) => (b === 0 ? 0 : Math.max(0, 255 - ((255 - a) * 256) / b));

    return rgbToHex(
      burn(baseRgb.r, blendRgb.r),
      burn(baseRgb.g, blendRgb.g),
      burn(baseRgb.b, blendRgb.b)
    );
  },
};

export const applyBlendMode = (baseColor, blendColor, mode = 'normal', opacity = 1) => {
  const blendedColor = blendMode[mode](baseColor, blendColor);
  if (opacity === 1) {
    return blendedColor;
  }
  return blendColors(baseColor, blendedColor, opacity);
};

/**
 * Palette Generation Functions
 */
export const generateComplementary = baseColor => {
  return [baseColor, rotateHue(baseColor, 180)];
};

export const generateAnalogous = (baseColor, angle = 30) => {
  return [-angle, 0, angle].map(deg => rotateHue(baseColor, deg));
};

export const generateTriadic = baseColor => {
  return [0, 120, 240].map(angle => rotateHue(baseColor, angle));
};

export const generateTetradic = baseColor => {
  return [0, 90, 180, 270].map(angle => rotateHue(baseColor, angle));
};

export const generateSquare = baseColor => {
  return [0, 90, 180, 270].map(angle => rotateHue(baseColor, angle));
};

export const generateSplitComplementary = (baseColor, angle = 30) => {
  const complement = rotateHue(baseColor, 180);
  return [baseColor, rotateHue(complement, -angle), rotateHue(complement, angle)];
};

export const generateMonochromatic = (baseColor, steps = 5) => {
  const { r, g, b } = hexToRgb(baseColor);
  const [hue, sat, light] = rgbToHsl(r, g, b);

  return Array.from({ length: steps }, (_, i) => {
    const newLight = Math.max(
      0,
      Math.min(100, light + (i - Math.floor(steps / 2)) * (100 / steps))
    );
    const [newR, newG, newB] = hslToRgb(hue, sat, newLight);
    return rgbToHex(newR, newG, newB);
  });
};

export const generateShades = (baseColor, steps = 5) => {
  return Array.from({ length: steps }, (_, i) => {
    const factor = i / (steps - 1);
    return darkenColor(baseColor, factor);
  });
};

export const generateTints = (baseColor, steps = 5) => {
  return Array.from({ length: steps }, (_, i) => {
    const factor = i / (steps - 1);
    return lightenColor(baseColor, factor);
  });
};

export const generateRandomPalette = (size = 5, options = {}) => {
  const {
    minHue = 0,
    maxHue = 360,
    minSaturation = 50,
    maxSaturation = 100,
    minLightness = 30,
    maxLightness = 70,
    harmony = 'random',
  } = options;

  const randomHsl = () => {
    const h = minHue + Math.random() * (maxHue - minHue);
    const s = minSaturation + Math.random() * (maxSaturation - minSaturation);
    const l = minLightness + Math.random() * (maxLightness - minLightness);
    return [h, s, l];
  };

  if (harmony === 'random') {
    return Array.from({ length: size }, () => {
      const [h, s, l] = randomHsl();
      return hslToHex(h, s, l);
    });
  }

  const baseHsl = randomHsl();
  const baseColor = hslToHex(...baseHsl);

  switch (harmony) {
    case 'complementary':
      return generateComplementary(baseColor);
    case 'analogous':
      return generateAnalogous(baseColor);
    case 'triadic':
      return generateTriadic(baseColor);
    case 'tetradic':
      return generateTetradic(baseColor);
    case 'monochromatic':
      return generateMonochromatic(baseColor, size);
    default:
      return generateRandomPalette(size, { ...options, harmony: 'random' });
  }
};

export const generateGradientPalette = (startColor, endColor, steps = 5) => {
  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);

  return Array.from({ length: steps }, (_, i) => {
    const ratio = i / (steps - 1);
    return rgbToHex(
      Math.round(start.r + (end.r - start.r) * ratio),
      Math.round(start.g + (end.g - start.g) * ratio),
      Math.round(start.b + (end.b - start.b) * ratio)
    );
  });
};

export const generatePaletteFromImage = (imageData, numColors = 5) => {
  // This is a simplified version - in practice you'd want to use
  // a more sophisticated color quantization algorithm
  const pixels = [];
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels.push(rgbToHex(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]));
  }

  // Simple color frequency analysis
  const colorFrequency = pixels.reduce((acc, color) => {
    acc[color] = (acc[color] || 0) + 1;
    return acc;
  }, {});

  // Sort by frequency and take top colors
  return Object.entries(colorFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, numColors)
    .map(([color]) => color);
};

export const validatePalette = palette => {
  return palette.every(color => typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color));
};

/**
 * Color Theory Functions
 */
export const colorTheory = {
  // Color Temperature
  isWarmColor: hex => {
    const [hue] = hexToHsl(hex);
    return (hue >= 0 && hue < 60) || (hue >= 300 && hue <= 360);
  },

  isCoolColor: hex => {
    const [hue] = hexToHsl(hex);
    return hue >= 180 && hue < 300;
  },

  // Color Properties
  getLuminance: hex => {
    const { r, g, b } = hexToRgb(hex);
    const [rr, gg, bb] = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
  },

  getContrast: (color1, color2) => {
    const l1 = colorTheory.getLuminance(color1);
    const l2 = colorTheory.getLuminance(color2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Color Relationships
  getComplementaryColor: hex => {
    const [h, s, l] = hexToHsl(hex);
    return hslToHex((h + 180) % 360, s, l);
  },

  getSplitComplementaryColors: (hex, angle = 30) => {
    const [h, s, l] = hexToHsl(hex);
    const complement = (h + 180) % 360;
    return [
      hex,
      hslToHex((complement - angle + 360) % 360, s, l),
      hslToHex((complement + angle) % 360, s, l),
    ];
  },

  getAnalogousColors: (hex, angle = 30) => {
    const [h, s, l] = hexToHsl(hex);
    return [hslToHex((h - angle + 360) % 360, s, l), hex, hslToHex((h + angle) % 360, s, l)];
  },

  // Advanced Color Theory
  getColorHarmony: (hex, type = 'complementary') => {
    const [h, s, l] = hexToHsl(hex);

    switch (type) {
      case 'complementary':
        return [hex, hslToHex((h + 180) % 360, s, l)];

      case 'triadic':
        return [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];

      case 'tetradic':
        return [
          hex,
          hslToHex((h + 90) % 360, s, l),
          hslToHex((h + 180) % 360, s, l),
          hslToHex((h + 270) % 360, s, l),
        ];

      case 'square':
        return [
          hex,
          hslToHex((h + 90) % 360, s, l),
          hslToHex((h + 180) % 360, s, l),
          hslToHex((h + 270) % 360, s, l),
        ];

      case 'compound':
        return [
          hex,
          hslToHex((h + 150) % 360, s, l),
          hslToHex((h + 180) % 360, s, l),
          hslToHex((h + 210) % 360, s, l),
        ];

      default:
        return [hex];
    }
  },

  // Color Context & Interaction
  getColorContext: (backgroundColor, textColor) => {
    const contrast = colorTheory.getContrast(backgroundColor, textColor);
    return {
      contrast,
      isReadable: contrast >= 4.5,
      needsDarkText: colorTheory.getLuminance(backgroundColor) > 0.5,
      needsLightText: colorTheory.getLuminance(backgroundColor) <= 0.5,
      isAccessible: contrast >= 7,
    };
  },

  // Color Psychology
  getColorMood: hex => {
    const [_hue, saturation, lightness] = hexToHsl(hex);

    const moods = {
      warm: colorTheory.isWarmColor(hex),
      cool: colorTheory.isCoolColor(hex),
      vibrant: saturation > 70,
      muted: saturation < 30,
      light: lightness > 70,
      dark: lightness < 30,
      neutral: saturation < 15 || lightness > 90 || lightness < 10,
    };

    // Determine primary mood based on color properties
    if (moods.neutral) {
      return 'neutral';
    }
    if (moods.vibrant && moods.warm) {
      return 'energetic';
    }
    if (moods.vibrant && moods.cool) {
      return 'refreshing';
    }
    if (moods.muted && moods.warm) {
      return 'comfortable';
    }
    if (moods.muted && moods.cool) {
      return 'relaxing';
    }
    return 'balanced';
  },

  // Accessibility Functions
  ensureReadability: (backgroundColor, textColor, minContrast = 4.5) => {
    let adjustedTextColor = textColor;
    let contrast = colorTheory.getContrast(backgroundColor, adjustedTextColor);

    while (contrast < minContrast) {
      const [h, s, l] = hexToHsl(adjustedTextColor);
      const newL =
        colorTheory.getLuminance(backgroundColor) > 0.5 ? Math.max(0, l - 5) : Math.min(100, l + 5);

      adjustedTextColor = hslToHex(h, s, newL);
      contrast = colorTheory.getContrast(backgroundColor, adjustedTextColor);
    }

    return adjustedTextColor;
  },

  // Color Dominance
  getColorDominance: colors => {
    return colors.map(color => ({
      color,
      temperature: colorTheory.isWarmColor(color) ? 'warm' : 'cool',
      luminance: colorTheory.getLuminance(color),
      [color]: hexToHsl(color)[1], // saturation
    }));
  },
};

// Export individual functions for convenience
export const {
  isWarmColor,
  isCoolColor,
  getLuminance,
  getContrast,
  getComplementaryColor,
  getSplitComplementaryColors,
  getAnalogousColors,
  getColorHarmony,
  getColorContext,
  getColorMood,
  ensureReadability,
  getColorDominance,
} = colorTheory;

/**
 * Color Harmony Functions
 */
export const harmonies = {
  // Basic Harmonization
  harmonizePalette: (palette, intensity = 1.2, mode = 'saturation') => {
    const adjustColor = (r, g, b, intensity) => {
      switch (mode) {
        case 'saturation':
          return [r * intensity, g * intensity, b * intensity];
        case 'brightness': {
          const avg = (r + g + b) / 3;
          return [
            avg + (r - avg) * intensity,
            avg + (g - avg) * intensity,
            avg + (b - avg) * intensity,
          ];
        }
        case 'contrast':
          return [r * (1 + intensity), g * (1 + intensity), b * (1 + intensity)];
        case 'temperature':
          // Adjust color temperature while maintaining relative relationships
          return [r * (1 + intensity * 0.1), g, b * (1 - intensity * 0.1)];
        default:
          return [r, g, b];
      }
    };

    return palette.map(color => {
      const [r, g, b] = color
        .slice(1)
        .match(/.{2}/g)
        .map(hex => parseInt(hex, 16));

      const [newR, newG, newB] = adjustColor(r, g, b, intensity).map(val =>
        Math.min(255, Math.max(0, Math.round(val)))
      );

      return `#${[newR, newG, newB].map(val => val.toString(16).padStart(2, '0')).join('')}`;
    });
  },

  // Advanced Harmonization Functions
  balancePalette: palette => {
    const hslColors = palette.map(color => hexToHsl(color));

    // Calculate average luminance
    const avgLuminance = hslColors.reduce((sum, [, , l]) => sum + l, 0) / hslColors.length;

    // Balance colors around average luminance
    return hslColors.map(([h, s, l]) => {
      const luminanceDiff = avgLuminance - l;
      const newL = l + luminanceDiff * 0.5; // Adjust by 50% toward average
      return hslToHex(h, s, newL);
    });
  },

  distributeHues: (palette, _spacing = 30) => {
    const hslColors = palette.map(color => hexToHsl(color));

    // Sort by hue
    hslColors.sort(([h1], [h2]) => h1 - h2);

    // Distribute hues evenly
    return hslColors.map(([_h, s, l], i) => {
      const newHue = (360 / palette.length) * i;
      return hslToHex(newHue, s, l);
    });
  },

  normalizeContrast: (palette, targetContrast = 4.5) => {
    const adjustedPalette = [...palette];

    for (let i = 0; i < adjustedPalette.length - 1; i++) {
      for (let j = i + 1; j < adjustedPalette.length; j++) {
        const contrast = getContrast(adjustedPalette[i], adjustedPalette[j]);

        if (contrast < targetContrast) {
          // Adjust colors to increase contrast
          const [h1, s1, l1] = hexToHsl(adjustedPalette[i]);
          const [h2, s2, l2] = hexToHsl(adjustedPalette[j]);

          if (l1 > l2) {
            adjustedPalette[i] = hslToHex(h1, s1, Math.min(100, l1 + 5));
            adjustedPalette[j] = hslToHex(h2, s2, Math.max(0, l2 - 5));
          } else {
            adjustedPalette[i] = hslToHex(h1, s1, Math.max(0, l1 - 5));
            adjustedPalette[j] = hslToHex(h2, s2, Math.min(100, l2 + 5));
          }
        }
      }
    }

    return adjustedPalette;
  },

  harmonizeWithBase: (baseColor, colors, strength = 0.3) => {
    const [baseHue] = hexToHsl(baseColor);

    return colors.map(color => {
      const [h, s, l] = hexToHsl(color);
      // Pull hue slightly toward base color
      const newHue = h + (baseHue - h) * strength;
      return hslToHex(newHue, s, l);
    });
  },

  createHarmoniousGradient: (color, steps = 5, mode = 'analogous') => {
    const [hue, saturation, lightness] = hexToHsl(color);

    switch (mode) {
      case 'analogous':
        return Array.from({ length: steps }, (_, i) => {
          const step = (30 / (steps - 1)) * i - 15;
          return hslToHex((hue + step + 360) % 360, saturation, lightness);
        });

      case 'monochromatic':
        return Array.from({ length: steps }, (_, i) => {
          const lightnessStep = (40 / (steps - 1)) * i - 20;
          return hslToHex(hue, saturation, Math.max(0, Math.min(100, lightness + lightnessStep)));
        });

      case 'complementary':
        return Array.from({ length: steps }, (_, i) => {
          const hueDiff = (180 / (steps - 1)) * i;
          return hslToHex((hue + hueDiff) % 360, saturation, lightness);
        });

      default:
        return Array(steps).fill(color);
    }
  },

  findHarmoniousAccent: (colors, constraints = {}) => {
    const {
      minContrast = 4.5,
      temperature = 'neutral',
      saturationRange = [30, 80],
      lightnessRange = [20, 80],
    } = constraints;

    const averageHue =
      colors.reduce((sum, color) => {
        const [h] = hexToHsl(color);
        return sum + h;
      }, 0) / colors.length;

    let bestAccent = null;
    let bestScore = -1;

    // Test potential accent colors
    for (let h = 0; h < 360; h += 5) {
      for (let s = saturationRange[0]; s <= saturationRange[1]; s += 10) {
        for (let l = lightnessRange[0]; l <= lightnessRange[1]; l += 10) {
          const testColor = hslToHex(h, s, l);
          let score = 0;

          // Check contrast with all colors
          const hasGoodContrast = colors.every(
            color => getContrast(testColor, color) >= minContrast
          );

          if (!hasGoodContrast) {
            continue;
          }

          // Score based on temperature preference
          if (temperature === 'warm' && isWarmColor(testColor)) {
            score += 2;
          }
          if (temperature === 'cool' && isCoolColor(testColor)) {
            score += 2;
          }
          if (temperature === 'neutral') {
            score += 1;
          }

          // Score based on hue difference from average
          const hueDiff = Math.abs(h - averageHue);
          score += Math.min(hueDiff, 360 - hueDiff) / 360;

          if (score > bestScore) {
            bestScore = score;
            bestAccent = testColor;
          }
        }
      }
    }

    return bestAccent;
  },
};

// Export individual functions for convenience
export const {
  harmonizePalette,
  balancePalette,
  distributeHues,
  normalizeContrast,
  harmonizeWithBase,
  createHarmoniousGradient,
  findHarmoniousAccent,
} = harmonies;

/**
 * Advanced Palette Generation
 */
export const advancedPalettes = {
  // Mood-based Palette Generation
  generateMoodPalette: (mood, options = {}) => {
    const { baseHue = Math.random() * 360, colorCount = 5, includeNeutral = true } = options;

    const moodSettings = {
      calm: {
        hueRange: [180, 240],
        saturationRange: [20, 50],
        lightnessRange: [60, 90],
        spacing: 30,
      },
      energetic: {
        hueRange: [0, 60],
        saturationRange: [70, 100],
        lightnessRange: [45, 65],
        spacing: 45,
      },
      professional: {
        hueRange: [200, 240],
        saturationRange: [15, 45],
        lightnessRange: [40, 80],
        spacing: 20,
      },
      playful: {
        hueRange: [0, 360],
        saturationRange: [60, 100],
        lightnessRange: [50, 70],
        spacing: 60,
      },
      sophisticated: {
        hueRange: [270, 330],
        saturationRange: [20, 40],
        lightnessRange: [20, 60],
        spacing: 15,
      },
      natural: {
        hueRange: [60, 150],
        saturationRange: [30, 70],
        lightnessRange: [40, 80],
        spacing: 25,
      },
    };

    const settings = moodSettings[mood] || moodSettings.professional;
    const colors = [];

    // Generate main colors
    for (let i = 0; i < colorCount; i++) {
      const hue = (baseHue + i * settings.spacing) % 360;
      const saturation =
        settings.saturationRange[0] +
        Math.random() * (settings.saturationRange[1] - settings.saturationRange[0]);
      const lightness =
        settings.lightnessRange[0] +
        Math.random() * (settings.lightnessRange[1] - settings.lightnessRange[0]);

      colors.push(hslToHex(hue, saturation, lightness));
    }

    // Add neutral color if requested
    if (includeNeutral) {
      const neutralLightness = (settings.lightnessRange[0] + settings.lightnessRange[1]) / 2;
      colors.push(hslToHex(0, 0, neutralLightness));
    }

    return harmonies.harmonizePalette(colors);
  },

  // Brand-focused Palette Generation
  generateBrandPalette: (primaryColor, options = {}) => {
    const { variation = 'standard', shades = 5, accents = 2 } = options;

    const palette = {
      primary: primaryColor,
      shades: generateShades(primaryColor, shades),
      tints: generateTints(primaryColor, shades),
    };

    switch (variation) {
      case 'monochromatic':
        palette.accents = generateMonochromatic(primaryColor, accents);
        break;

      case 'complementary': {
        const complement = getComplementaryColor(primaryColor);
        palette.accents = [complement, ...generateTints(complement, accents - 1)];
        break;
      }

      case 'analogous':
        palette.accents = getAnalogousColors(primaryColor).slice(1);
        break;

      case 'triadic':
        palette.accents = getColorHarmony(primaryColor, 'triadic').slice(1);
        break;

      default:
        palette.accents = getSplitComplementaryColors(primaryColor).slice(1);
    }

    return palette;
  },

  // Color Scheme Generation with Semantic Meaning
  generateSemanticPalette: baseColor => {
    const [baseHue, baseSat, baseLight] = hexToHsl(baseColor);

    return {
      primary: baseColor,
      success: hslToHex((baseHue + 120) % 360, Math.min(baseSat + 20, 100), baseLight),
      warning: hslToHex((baseHue + 30) % 360, Math.min(baseSat + 10, 100), baseLight),
      danger: hslToHex((baseHue + 180) % 360, Math.min(baseSat + 20, 100), baseLight),
      info: hslToHex((baseHue + 210) % 360, baseSat, baseLight),
      neutral: hslToHex(baseHue, Math.max(baseSat - 50, 0), baseLight),
    };
  },

  // Generate UI-focused Color Palette
  generateUIPalette: (baseColor, options = {}) => {
    const { darkMode = false, accessibility = 'AA' } = options;

    const [baseHue, baseSat] = hexToHsl(baseColor);
    const contrastRatios = {
      AA: 4.5,
      AAA: 7,
      standard: 3,
    };

    const targetContrast = contrastRatios[accessibility] || contrastRatios.standard;
    const baseBg = darkMode ? '#1a1a1a' : '#ffffff';

    const palette = {
      background: baseBg,
      surface: darkMode ? '#2d2d2d' : '#f5f5f5',
      primary: baseColor,
      text: {
        primary: ensureReadability(baseBg, darkMode ? '#ffffff' : '#000000', targetContrast),
        secondary: ensureReadability(
          baseBg,
          darkMode ? '#cccccc' : '#666666',
          targetContrast * 0.8
        ),
      },
      border: darkMode ? '#404040' : '#e0e0e0',
      hover: hslToHex(baseHue, Math.min(baseSat + 10, 100), darkMode ? 40 : 60),
      active: hslToHex(baseHue, Math.min(baseSat + 20, 100), darkMode ? 30 : 50),
      disabled: darkMode ? '#666666' : '#cccccc',
    };

    // Add semantic colors
    const semanticPalette = generateSemanticPalette(baseColor);
    return { ...palette, ...semanticPalette };
  },

  // Generate Accessible Color Combinations
  generateAccessibleCombinations: (baseColor, options = {}) => {
    const { targetContrast = 4.5, variations = 3 } = options;

    const combinations = [];
    const [baseHue, baseSat, _baseLight] = hexToHsl(baseColor);

    for (let i = 0; i < variations; i++) {
      const backgroundLight = (100 / variations) * i;
      const background = hslToHex(baseHue, Math.min(baseSat, 30), backgroundLight);

      let foreground = baseColor;
      while (getContrast(background, foreground) < targetContrast) {
        const [h, s, l] = hexToHsl(foreground);
        foreground = hslToHex(h, s, l > 50 ? l + 5 : l - 5);
      }

      combinations.push({
        background,
        foreground,
        contrast: getContrast(background, foreground),
      });
    }

    return combinations;
  },
};

// Export individual functions for convenience
export const {
  generateMoodPalette,
  generateBrandPalette,
  generateSemanticPalette,
  generateUIPalette,
  generateAccessibleCombinations,
} = advancedPalettes;

/**
 * Color Management Functions
 */
export const colorManagement = {
  // Color Storage and History
  ColorHistory: class {
    constructor(maxSize = 50) {
      this.history = [];
      this.maxSize = maxSize;
      this.currentIndex = -1;
    }

    add(color) {
      // Remove forward history if we're not at the end
      if (this.currentIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.currentIndex + 1);
      }

      // Add new color
      this.history.push(color);

      // Maintain max size
      if (this.history.length > this.maxSize) {
        this.history.shift();
      }

      this.currentIndex = this.history.length - 1;
    }

    undo() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        return this.history[this.currentIndex];
      }
      return null;
    }

    redo() {
      if (this.currentIndex < this.history.length - 1) {
        this.currentIndex++;
        return this.history[this.currentIndex];
      }
      return null;
    }

    getCurrentColor() {
      return this.history[this.currentIndex] || null;
    }

    getHistory() {
      return [...this.history];
    }
  },

  // Color Collections Management
  ColorCollection: class {
    constructor(name) {
      this.name = name;
      this.colors = new Map();
      this.tags = new Set();
    }

    addColor(name, color, tags = []) {
      this.colors.set(name, {
        value: color,
        tags: new Set(tags),
        timestamp: Date.now(),
      });
      tags.forEach(tag => this.tags.add(tag));
    }

    removeColor(name) {
      this.colors.delete(name);
      // Cleanup orphaned tags
      this.refreshTags();
    }

    getColor(name) {
      return this.colors.get(name)?.value || null;
    }

    getAllColors() {
      return Array.from(this.colors.entries()).map(([name, data]) => ({
        name,
        ...data,
        tags: Array.from(data.tags),
      }));
    }

    findByTag(tag) {
      return this.getAllColors().filter(color => color.tags.includes(tag));
    }

    refreshTags() {
      const activeTags = new Set();
      this.colors.forEach(color => {
        color.tags.forEach(tag => activeTags.add(tag));
      });
      this.tags = activeTags;
    }
  },

  // Color Validation and Normalization
  validateColor: color => {
    if (typeof color !== 'string') {
      return false;
    }

    // Check hex format
    if (color.startsWith('#')) {
      return /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);
    }

    // Check rgb/rgba format
    if (color.startsWith('rgb')) {
      const values = color.match(/\d+/g);
      if (!values) {
        return false;
      }

      if (color.startsWith('rgba')) {
        return (
          values.length === 4 &&
          values.slice(0, 3).every(v => v >= 0 && v <= 255) &&
          parseFloat(values[3]) >= 0 &&
          parseFloat(values[3]) <= 1
        );
      }

      return values.length === 3 && values.every(v => v >= 0 && v <= 255);
    }

    return false;
  },

  normalizeColor: color => {
    if (!color) {
      return null;
    }

    // If already hex, ensure uppercase
    if (color.startsWith('#')) {
      const normalized = color.toUpperCase();
      // Convert shorthand
      if (normalized.length === 4) {
        return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
      }
      return normalized;
    }

    // Convert rgb/rgba to hex
    if (color.startsWith('rgb')) {
      const values = color.match(/\d+/g);
      if (!values) {
        return null;
      }

      const [r, g, b] = values.map(Number);
      return rgbToHex(r, g, b);
    }

    return null;
  },

  // Color Export and Import
  exportPalette: (palette, format = 'hex') => {
    switch (format.toLowerCase()) {
      case 'hex':
        return palette;

      case 'rgb':
        return palette.map(color => {
          const { r, g, b } = hexToRgb(color);
          return `rgb(${r}, ${g}, ${b})`;
        });

      case 'hsl':
        return palette.map(color => {
          const [h, s, l] = hexToHsl(color);
          return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
        });

      case 'json':
        return JSON.stringify(
          palette.map(color => ({
            hex: color,
            rgb: hexToRgb(color),
            hsl: hexToHsl(color),
          }))
        );

      case 'css':
        return palette.map((color, index) => `--color-${index + 1}: ${color};`).join('\n');

      default:
        return palette;
    }
  },

  importPalette: (input, format = 'auto') => {
    const detectFormat = str => {
      if (str.startsWith('#')) {
        return 'hex';
      }
      if (str.startsWith('rgb')) return 'rgb';
      if (str.startsWith('hsl')) return 'hsl';
      if (str.startsWith('{') || str.startsWith('[')) return 'json';
      if (str.includes('--color')) return 'css';
      return null;
    };

    const actualFormat = format === 'auto' ? detectFormat(input) : format;

    switch (actualFormat) {
      case 'hex':
        return input.split(/[,\s]+/).filter(color => colorManagement.validateColor(color));

      case 'rgb':
        return (
          input.match(/rgb\([^)]+\)/g)?.map(color => {
            const [r, g, b] = color.match(/\d+/g).map(Number);
            return rgbToHex(r, g, b);
          }) || []
        );

      case 'hsl':
        return (
          input.match(/hsl\([^)]+\)/g)?.map(color => {
            const [h, s, l] = color.match(/\d+/g).map(Number);
            return hslToHex(h, s, l);
          }) || []
        );

      case 'json':
        try {
          const parsed = JSON.parse(input);
          return Array.isArray(parsed)
            ? parsed.map(color => color.hex || color)
            : Object.values(parsed);
        } catch {
          return [];
        }

      case 'css':
        return (
          input
            .match(/:[^;]+/g)
            ?.map(color => color.trim().replace(':', ''))
            .filter(color => colorManagement.validateColor(color)) || []
        );

      default:
        return [];
    }
  },
};

// Export individual classes and functions
export const {
  ColorHistory,
  ColorCollection,
  validateColor,
  normalizeColor,
  exportPalette,
  importPalette,
} = colorManagement;

/**
 * Preset Data and Configurations
 */
export const colorPresets = {
  // Standard Color Palettes
  palettes: {
    material: {
      red: [
        '#FFEBEE',
        '#FFCDD2',
        '#EF9A9A',
        '#E57373',
        '#EF5350',
        '#F44336',
        '#E53935',
        '#D32F2F',
        '#C62828',
        '#B71C1C',
      ],
      blue: [
        '#E3F2FD',
        '#BBDEFB',
        '#90CAF9',
        '#64B5F6',
        '#42A5F5',
        '#2196F3',
        '#1E88E5',
        '#1976D2',
        '#1565C0',
        '#0D47A1',
      ],
      green: [
        '#E8F5E9',
        '#C8E6C9',
        '#A5D6A7',
        '#81C784',
        '#66BB6A',
        '#4CAF50',
        '#43A047',
        '#388E3C',
        '#2E7D32',
        '#1B5E20',
      ],
      purple: [
        '#F3E5F5',
        '#E1BEE7',
        '#CE93D8',
        '#BA68C8',
        '#AB47BC',
        '#9C27B0',
        '#8E24AA',
        '#7B1FA2',
        '#6A1B9A',
        '#4A148C',
      ],
      orange: [
        '#FFF3E0',
        '#FFE0B2',
        '#FFCC80',
        '#FFB74D',
        '#FFA726',
        '#FF9800',
        '#FB8C00',
        '#F57C00',
        '#EF6C00',
        '#E65100',
      ],
    },

    // Nature-inspired palettes
    nature: {
      forest: ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50'],
      ocean: ['#01579B', '#0277BD', '#0288D1', '#039BE5', '#03A9F4'],
      sunset: ['#BF360C', '#D84315', '#E64A19', '#F4511E', '#FF5722'],
      earth: ['#3E2723', '#4E342E', '#5D4037', '#6D4C41', '#795548'],
    },

    // Semantic color sets
    semantic: {
      success: ['#E8F5E9', '#C8E6C9', '#81C784', '#4CAF50', '#2E7D32'],
      warning: ['#FFF3E0', '#FFE0B2', '#FFB74D', '#FF9800', '#E65100'],
      error: ['#FFEBEE', '#FFCDD2', '#EF5350', '#F44336', '#C62828'],
      info: ['#E3F2FD', '#BBDEFB', '#64B5F6', '#2196F3', '#1565C0'],
    },
  },

  // Color Combinations for Different Purposes
  combinations: {
    ui: {
      light: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#FF4081',
        error: '#F44336',
        text: {
          primary: 'rgba(0, 0, 0, 0.87)',
          secondary: 'rgba(0, 0, 0, 0.54)',
          disabled: 'rgba(0, 0, 0, 0.38)',
        },
      },
      dark: {
        background: '#121212',
        surface: '#1E1E1E',
        primary: '#90CAF9',
        secondary: '#B0BEC5',
        accent: '#FF80AB',
        error: '#EF5350',
        text: {
          primary: 'rgba(255, 255, 255, 0.87)',
          secondary: 'rgba(255, 255, 255, 0.60)',
          disabled: 'rgba(255, 255, 255, 0.38)',
        },
      },
    },
    brand: {
      primary: ['#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6'],
      secondary: ['#424242', '#616161', '#757575', '#9E9E9E', '#BDBDBD'],
      accent: ['#FF4081', '#FF80AB', '#FF80AB', '#FF80AB', '#FF80AB'],
    },
  },

  // Configuration Settings
  config: {
    // Contrast ratios for accessibility
    contrast: {
      AA: {
        normal: 4.5,
        large: 3,
      },
      AAA: {
        normal: 7,
        large: 4.5,
      },
    },

    // Default color generation settings
    defaults: {
      saturationRange: [30, 80],
      lightnessRange: [20, 80],
      alphaRange: [0.1, 1],
      steps: 5,
    },

    // Harmonic ratios for color relationships
    harmonicRatios: {
      complementary: 180,
      triadic: 120,
      tetradic: 90,
      analogous: 30,
      splitComplementary: 150,
    },

    // Color theory settings
    theory: {
      warmColors: [0, 60],
      coolColors: [180, 300],
      neutralColors: [0, 360, 0, 15], // [hueStart, hueEnd, satStart, satEnd]
    },
  },

  // Color Naming System
  naming: {
    // Basic color names
    basic: {
      '#FF0000': 'red',
      '#00FF00': 'green',
      '#0000FF': 'blue',
      '#FFFF00': 'yellow',
      '#FF00FF': 'magenta',
      '#00FFFF': 'cyan',
      '#000000': 'black',
      '#FFFFFF': 'white',
    },

    // Modifier prefixes and suffixes
    modifiers: {
      light: { luminance: 0.7 },
      dark: { luminance: 0.3 },
      bright: { saturation: 1 },
      muted: { saturation: 0.3 },
      deep: { saturation: 0.8, luminance: 0.3 },
    },

    // Name generation patterns
    patterns: {
      standard: '{modifier}-{color}',
      detailed: '{color}-{lightness}-{saturation}',
    },
  },

  // Export/Import Formats
  formats: {
    hex: {
      validate: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      parse: color => color,
      stringify: color => color.toUpperCase(),
    },
    rgb: {
      validate: /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/,
      parse: color => {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        return rgbToHex(r, g, b);
      },
      stringify: color => {
        const { r, g, b } = hexToRgb(color);
        return `rgb(${r}, ${g}, ${b})`;
      },
    },
    hsl: {
      validate: /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/,
      parse: color => {
        const [h, s, l] = color.match(/\d+/g).map(Number);
        return hslToHex(h, s, l);
      },
      stringify: color => {
        const [h, s, l] = hexToHsl(color);
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
      },
    },
  },
};

// Export individual preset categories
export const { palettes, combinations, config, naming, formats } = colorPresets;
