/**
 * Advanced Snap to Grid with Support for Rotated or Non-Uniform Grids
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} gridSize - Number of cells in the grid.
 * @param {number} canvasSize - Size of the canvas in pixels.
 * @param {number} rotation - Rotation angle of the grid in degrees (default: 0).
 * @returns {Object} - Snapped coordinates { x, y }.
 */
export const advancedSnapToGrid = (x, y, gridSize, canvasSize, rotation = 0) => {
  const cellSize = canvasSize / gridSize;

  // Apply grid rotation using rotation matrix
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const rotatedX = cos * x - sin * y;
  const rotatedY = sin * x + cos * y;

  const snappedX = Math.round(rotatedX / cellSize) * cellSize;
  const snappedY = Math.round(rotatedY / cellSize) * cellSize;

  // Reverse rotation
  const finalX = cos * snappedX + sin * snappedY;
  const finalY = -sin * snappedX + cos * snappedY;

  return { x: finalX, y: finalY };
};

/**
 * Export grid data to JSON.
 * @param {Array} gridData - Array of grid cell data (e.g., colors, coordinates).
 * @param {string} fileName - File name for the exported JSON file (default: "gridData").
 */
export const exportGridDataAsJson = (gridData, fileName = "gridData") => {
  const dataStr = JSON.stringify(gridData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.json`;
  link.click();
};

/**
 * Import grid data from a JSON file.
 * @param {File} file - JSON file containing grid data.
 * @param {Function} callback - Callback function to process imported grid data.
 */
export const importGridDataFromJson = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const gridData = JSON.parse(event.target.result);
      callback(gridData);
    } catch (err) {
      console.error("Invalid JSON file:", err);
      alert("Failed to load grid data. Please ensure the file is valid.");
    }
  };
  reader.readAsText(file);
};

/**
 * Dynamic fallback for grid initialization when no JSON data is provided.
 * @param {number} gridSize - Size of the grid (e.g., 16x16, 32x32).
 * @param {string} defaultColor - Default color for uninitialized grid cells.
 * @returns {Array} - Initialized grid data as an array.
 */
export const initializeGridData = (gridSize, defaultColor = "#FFFFFF") => {
  return Array(gridSize * gridSize).fill(defaultColor);
};

/**
 * Procedural Pattern Fill for Grid Cells
 * Generates Perlin noise-based textures for artistic effects.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
 * @param {number} gridSize - Number of cells in the grid.
 * @param {number} canvasSize - Size of the canvas in pixels.
 * @param {Object} options - Noise generation options.
 */
export const proceduralFill = (ctx, gridSize, canvasSize, options = {}) => {
  const cellSize = canvasSize / gridSize;
  const { noiseScale = 0.1, baseColor = "#FFFFFF" } = options;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const noise = perlinNoise(col * noiseScale, row * noiseScale);
      const color = adjustColor(baseColor, noise);

      ctx.fillStyle = color;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }
};

/**
 * Perlin Noise Algorithm for Generating Patterns
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @returns {number} - Noise value (0-1).
 */
const perlinNoise = (x, y) => {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

/**
 * Adjust Color Based on Noise Value
 * @param {string} color - Base HEX color.
 * @param {number} factor - Noise factor (0-1).
 * @returns {string} - Adjusted HEX color.
 */
const adjustColor = (color, factor) => {
  const { r, g, b } = hexToRgb(color);
  const newR = Math.min(255, Math.floor(r * factor));
  const newG = Math.min(255, Math.floor(g * factor));
  const newB = Math.min(255, Math.floor(b * factor));
  return rgbToHex(newR, newG, newB);
};

/**
 * Helper: Convert HEX to RGB.
 * @param {string} hex - HEX color code.
 * @returns {Object} - RGB object with properties { r, g, b }.
 */
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
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
  const toHex = (value) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Snap a value to the nearest grid cell.
 * Ensures precise alignment of coordinates to the grid.
 *
 * @param {number} value - The input coordinate (e.g., x or y).
 * @param {number} gridSize - Number of cells in the grid.
 * @param {number} canvasSize - Size of the canvas in pixels.
 * @returns {number} - Snapped coordinate.
 */
export const snapToGrid = (value, gridSize, canvasSize) => {
  const cellSize = canvasSize / gridSize;
  return Math.round(value / cellSize) * cellSize;
};

/**
 * Export the canvas content to an image file.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to export.
 * @param {string} format - Image format ("png", "jpeg", etc.).
 * @param {string} fileName - File name for the exported image (default: "export").
 */
export const exportCanvasToImage = (canvas, format = "png", fileName = "export") => {
  const link = document.createElement("a");
  link.href = canvas.toDataURL(`image/${format}`);
  link.download = `${fileName}.${format}`;
  link.click();
};

/**
 * Calculate the dimensions of a grid cell based on canvas size and grid resolution.
 *
 * @param {number} gridSize - Number of cells in the grid.
 * @param {number} canvasSize - Size of the canvas in pixels.
 * @returns {number} - Size of each grid cell in pixels.
 */
export const calculateCellSize = (gridSize, canvasSize) => {
  return canvasSize / gridSize;
};

/**
 * Get the grid cell index for a given canvas coordinate.
 *
 * @param {number} x - X coordinate on the canvas.
 * @param {number} y - Y coordinate on the canvas.
 * @param {number} gridSize - Number of cells in the grid.
 * @param {number} canvasSize - Size of the canvas in pixels.
 * @returns {Object} - Object containing the grid indices { row, col }.
 */
export const getGridCellIndex = (x, y, gridSize, canvasSize) => {
  const cellSize = calculateCellSize(gridSize, canvasSize);
  return {
    col: Math.floor(x / cellSize),
    row: Math.floor(y / cellSize),
  };
};

/**
 * Render a grid overlay on the canvas.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
 * @param {number} gridSize - Number of cells in the grid.
 * @param {number} canvasSize - Size of the canvas in pixels.
 * @param {string} gridColor - Color of the grid lines (default: "rgba(0, 0, 0, 0.1)").
 */
export const renderGridOverlay = (ctx, gridSize, canvasSize, gridColor = "rgba(0, 0, 0, 0.1)") => {
  const cellSize = calculateCellSize(gridSize, canvasSize);

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;

  for (let i = 0; i <= gridSize; i++) {
    const position = i * cellSize;

    // Draw vertical lines
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvasSize);
    ctx.stroke();

    // Draw horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvasSize, position);
    ctx.stroke();
  }
};

/**
 * Fill a grid cell with a specified color.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
 * @param {number} col - Column index of the cell.
 * @param {number} row - Row index of the cell.
 * @param {number} gridSize - Number of cells in the grid.
 * @param {number} canvasSize - Size of the canvas in pixels.
 * @param {string} fillColor - Fill color for the cell.
 */
export const fillGridCell = (ctx, col, row, gridSize, canvasSize, fillColor) => {
  const cellSize = calculateCellSize(gridSize, canvasSize);
  ctx.fillStyle = fillColor;
  ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
};

/**
 * Clear a specific grid cell.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
 * @param {number} col - Column index of the cell.
 * @param {number} row - Row index of the cell.
 * @param {number} gridSize - Number of cells in the grid.
 * @param {number} canvasSize - Size of the canvas in pixels.
 */
export const clearGridCell = (ctx, col, row, gridSize, canvasSize) => {
  fillGridCell(ctx, col, row, gridSize, canvasSize, "transparent");
};
