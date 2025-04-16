
/**
 * Harmonize a palette by adjusting its color intensity.
 * Supports multiple harmonization modes for greater flexibility.
 *
 * @param {Array<string>} palette - Array of color codes (e.g., ["#FF0000", "#00FF00", "#0000FF"]).
 * @param {number} intensity - Intensity multiplier for color adjustments (default: 1.2).
 * @param {string} mode - Harmonization mode: "saturation", "brightness", or "contrast" (default: "saturation").
 * @returns {Array<string>} - Array of harmonized color codes.
 */
export const harmonizePalette = (palette, intensity = 1.2, mode = "saturation") => {
  const adjustColor = (r, g, b, intensity) => {
    switch (mode) {
      case "saturation":
        return [r * intensity, g * intensity, b * intensity];
      case "brightness":
        const avg = (r + g + b) / 3;
        return [avg + (r - avg) * intensity, avg + (g - avg) * intensity, avg + (b - avg) * intensity];
      case "contrast":
        return [r * (1 + intensity), g * (1 + intensity), b * (1 + intensity)];
      default:
        console.warn(`Unknown harmonization mode: ${mode}`);
        return [r, g, b];
    }
  };

  return palette.map((color) => {
    const [r, g, b] = color
      .slice(1)
      .match(/.{2}/g)
      .map((hex) => parseInt(hex, 16));

    const [newR, newG, newB] = adjustColor(r, g, b, intensity).map((val) =>
      Math.min(255, Math.max(0, Math.round(val)))
    );

    return `#${[newR, newG, newB]
      .map((val) => val.toString(16).padStart(2, "0"))
      .join("")}`;
  });
};

/**
 * Apply a uniform harmony effect to a single color.
 *
 * @param {string} color - Hexadecimal color code (e.g., "#FF0000").
 * @param {number} intensity - Intensity multiplier for color adjustments (default: 1.2).
 * @param {string} mode - Harmonization mode: "saturation", "brightness", or "contrast" (default: "saturation").
 * @returns {string} - Harmonized color code.
 */
export const harmonizeColor = (color, intensity = 1.2, mode = "saturation") => {
  const [r, g, b] = color
    .slice(1)
    .match(/.{2}/g)
    .map((hex) => parseInt(hex, 16));

  const adjustColor = (r, g, b, intensity) => {
    switch (mode) {
      case "saturation":
        return [r * intensity, g * intensity, b * intensity];
      case "brightness":
        const avg = (r + g + b) / 3;
        return [avg + (r - avg) * intensity, avg + (g - avg) * intensity, avg + (b - avg) * intensity];
      case "contrast":
        return [r * (1 + intensity), g * (1 + intensity), b * (1 + intensity)];
      default:
        console.warn(`Unknown harmonization mode: ${mode}`);
        return [r, g, b];
    }
  };

  const [newR, newG, newB] = adjustColor(r, g, b, intensity).map((val) =>
    Math.min(255, Math.max(0, Math.round(val)))
  );

  return `#${[newR, newG, newB]
    .map((val) => val.toString(16).padStart(2, "0"))
    .join("")}`;
};
