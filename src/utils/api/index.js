/**
 * Centralized API and Export Utilities
 * 
 * This module consolidates export and import functionality to prevent duplication and ensure
 * consistent implementation across the application.
 */

// Re-export all functions from exportManager.js
export * from './exportManager';

// Re-export all functions from svgExportUtility.js
export * from './svgExportUtility';

// Re-export all functions from svgImportUtility.js
export * from './svgImportUtility';

// Specialized export utilities that may be used across components
export const downloadFile = (content, fileName, fileType) => {
  const blob = new Blob([content], { type: fileType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  
  // Clean up the URL object after the download starts
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
  }, 100);
};

// Standard file types and extensions for exports
export const FILE_TYPES = {
  JSON: 'application/json',
  PNG: 'image/png',
  SVG: 'image/svg+xml',
  CSV: 'text/csv',
  XML: 'application/xml'
};

// Helper for creating a canvas from grid data (used in multiple export functions)
export const createCanvasFromGrid = (gridSize, cellColors, scale = 1) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const canvasSize = gridSize * scale;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  
  // Set background to white for better visualization
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // Draw each colored cell
  cellColors.forEach((color, index) => {
    if (color) {
      const x = index % gridSize;
      const y = Math.floor(index / gridSize);
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  });
  
  return canvas;
};

// Error handling wrapper for export operations
export const safeExport = async (exportFn, ...args) => {
  try {
    return await exportFn(...args);
  } catch (error) {
    console.error('Export operation failed:', error);
    throw new Error(`Export failed: ${error.message}`);
  }
};
