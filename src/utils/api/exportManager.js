
/**
 * Export grid data to SVG format.
 * Generates a scalable vector graphics (SVG) file representing the grid.
 *
 * @param {number} gridSize - The size of the grid (e.g., 16x16).
 * @param {Array<string|null>} cellColors - Array of cell colors (HEX or null).
 * @param {Object} options - Additional options for the SVG export.
 * @param {number} options.width - SVG width (default: 1024).
 * @param {number} options.height - SVG height (default: 1024).
 * @returns {string} - SVG content as a string.
 */
export const exportToSVG = (gridSize, cellColors, options = {}) => {
  // Import from svgExportUtility to use the optimized SVG export function
  const { exportToSVGOptimized } = require('./svgExportUtility');
  return exportToSVGOptimized(gridSize, cellColors, options);
};

/**
 * Export grid data to PNG format.
 * Generates a PNG image representing the grid using an HTML canvas.
 *
 * @param {number} gridSize - The size of the grid (e.g., 16x16).
 * @param {Array<string|null>} cellColors - Array of cell colors (HEX or null).
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef - Reference to the canvas element.
 * @param {Object} options - Additional options for the PNG export.
 * @param {number} options.scale - Scaling factor for the canvas (default: 64).
 * @returns {string} - Data URL of the PNG image.
 */
export const exportToPNG = (gridSize, cellColors, canvasRef, options = {}) => {
  const { scale = 64 } = options; // Default scale makes 16x16 grid render as 1024x1024

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  const canvasSize = gridSize * scale;
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  cellColors.forEach((color, index) => {
    if (color) {
      const x = index % gridSize;
      const y = Math.floor(index / gridSize);
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  });

  return canvas.toDataURL("image/png");
};

/**
 * Export grid data to JSON format.
 * Creates a downloadable JSON file containing grid data and metadata.
 *
 * @param {Object} gridData - Grid data including colors and metadata.
 * @param {string} fileName - Name of the exported JSON file (default: "gridData.json").
 */
export const exportToJSON = (gridData, fileName = "gridData.json") => {
  const dataStr = JSON.stringify(gridData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

/**
 * Export grid data to CSV format.
 * Converts grid data into a comma-separated values (CSV) file for spreadsheets.
 *
 * @param {Array<string|null>} cellColors - Array of cell colors (HEX or null).
 * @param {number} gridSize - The size of the grid (e.g., 16x16).
 * @param {string} fileName - Name of the exported CSV file (default: "gridData.csv").
 */
export const exportToCSV = (cellColors, gridSize, fileName = "gridData.csv") => {
  let csvContent = "row,col,color\n";

  cellColors.forEach((color, index) => {
    if (color) {
      const col = index % gridSize;
      const row = Math.floor(index / gridSize);
      csvContent += `${row},${col},${color}\n`;
    }
  });

  const blob = new Blob([csvContent], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
};

/**
 * Save an exported file to a backend API.
 * Uploads exported data to the server for storage or sharing.
 *
 * @param {string} endpoint - API endpoint for file uploads.
 * @param {Blob} fileBlob - Blob containing file data.
 * @param {string} fileName - Name of the file being uploaded.
 * @param {Object} metadata - Optional metadata for the file.
 * @returns {Promise<Object>} - Response data from the server.
 */
export const saveExportToAPI = async (endpoint, fileBlob, fileName, metadata = {}) => {
  try {
    const formData = new FormData();
    formData.append("file", fileBlob, fileName);
    formData.append("metadata", JSON.stringify(metadata));

    const response = await axios.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("File uploaded successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading file to API:", error);
    throw error;
  }
};

/**
 * Export to multiple formats at once.
 * Generates multiple export formats and downloads them.
 *
 * @param {number} gridSize - The size of the grid (e.g., 16x16).
 * @param {Array<string|null>} cellColors - Array of cell colors (HEX or null).
 * @param {React.RefObject<HTMLCanvasElement>} canvasRef - Reference to the canvas element.
 * @param {Object} gridData - Full grid data for JSON export.
 * @param {Array} layers - Optional array of layer objects for advanced SVG export.
 */
export const exportAllFormats = (gridSize, cellColors, canvasRef, gridData, layers = null) => {
  // Export to PNG
  const pngDataUrl = exportToPNG(gridSize, cellColors, canvasRef);
  const pngLink = document.createElement("a");
  pngLink.href = pngDataUrl;
  pngLink.download = "artwork.png";
  pngLink.click();

  // Export to SVG - use layers if available for advanced export
  let svgContent;
  if (layers && layers.length > 0) {
    // Use the advanced SVG export with full vector support if layers are provided
    const { exportLayersToSVG } = require('./svgExportUtility');
    svgContent = exportLayersToSVG(gridSize, layers);
  } else {
    // Fall back to basic SVG export
    svgContent = exportToSVG(gridSize, cellColors);
  }
  
  const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
  const svgLink = document.createElement("a");
  svgLink.href = URL.createObjectURL(svgBlob);
  svgLink.download = "artwork.svg";
  svgLink.click();

  // Export to JSON
  exportToJSON(gridData);

  // Export to CSV
  exportToCSV(cellColors, gridSize);
};
