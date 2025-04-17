/**
 * SVG Export Utility
 * Advanced SVG export functionality with full vector support
 */

import { BLEND_MODES } from '../blend';
import { hexToRgb, rgbToHex } from '../color';

/**
 * SVG Helper Functions
 */

// Convert a blend mode to SVG filter equivalent
const blendModeToSVGFilter = (blendMode) => {
  const filterMap = {
    [BLEND_MODES.NORMAL]: '',
    [BLEND_MODES.MULTIPLY]: 'multiply',
    [BLEND_MODES.SCREEN]: 'screen',
    [BLEND_MODES.OVERLAY]: 'overlay',
    [BLEND_MODES.DARKEN]: 'darken',
    [BLEND_MODES.LIGHTEN]: 'lighten',
    [BLEND_MODES.COLOR_DODGE]: 'color-dodge',
    [BLEND_MODES.COLOR_BURN]: 'color-burn',
    [BLEND_MODES.HARD_LIGHT]: 'hard-light',
    [BLEND_MODES.SOFT_LIGHT]: 'soft-light',
    [BLEND_MODES.DIFFERENCE]: 'difference',
    [BLEND_MODES.EXCLUSION]: 'exclusion',
    [BLEND_MODES.HUE]: 'hue',
    [BLEND_MODES.SATURATION]: 'saturation',
    [BLEND_MODES.COLOR]: 'color',
    [BLEND_MODES.LUMINOSITY]: 'luminosity'
  };
  
  return filterMap[blendMode] || '';
};

// Generate SVG Filter Definitions for all blend modes used in the document
const generateSVGFilters = (usedBlendModes) => {
  let filterDefs = '';
  
  if (usedBlendModes.size === 0) return '';
  
  filterDefs = '<defs>';
  
  // Generate filter for each blend mode
  usedBlendModes.forEach(blendMode => {
    if (blendMode === BLEND_MODES.NORMAL) return;
    
    const filterMode = blendModeToSVGFilter(blendMode);
    if (!filterMode) return;
    
    filterDefs += `
      <filter id="filter-${filterMode}">
        <feBlend mode="${filterMode}" in="SourceGraphic" in2="BackgroundImage"/>
      </filter>
    `;
  });
  
  filterDefs += '</defs>';
  return filterDefs;
};

// Create SVG element attributes including styles for a cell
const createSVGElementAttributes = (x, y, width, height, color, opacity, blendMode) => {
  let attrs = `x="${x}" y="${y}" width="${width}" height="${height}"`;
  
  // Handle fill color
  attrs += ` fill="${color}"`;
  
  // Apply opacity if not 1
  if (opacity !== 1) {
    attrs += ` opacity="${opacity}"`;
  }
  
  // Apply filter for blend mode if not normal
  if (blendMode && blendMode !== BLEND_MODES.NORMAL) {
    const filterMode = blendModeToSVGFilter(blendMode);
    if (filterMode) {
      attrs += ` filter="url(#filter-${filterMode})"`;
    }
  }
  
  return attrs;
};

// Optimize cells to detect and group connected cells into larger rectangles
const optimizeCells = (gridSize, layerGridData) => {
  // Create a 2D representation of the grid for easier processing
  const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
  
  // Fill the grid with color data
  Object.entries(layerGridData).forEach(([key, color]) => {
    if (!color) return;
    
    const [x, y] = key.split(',').map(Number);
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      grid[y][x] = color;
    }
  });
  
  // Track cells that have been processed
  const processed = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
  
  // Find and create optimized rectangles
  const rectangles = [];
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (processed[y][x] || !grid[y][x]) continue;
      
      const color = grid[y][x];
      
      // Find maximum width (how far we can go to the right with the same color)
      let width = 1;
      while (x + width < gridSize && 
             grid[y][x + width] === color && 
             !processed[y][x + width]) {
        width++;
      }
      
      // Find maximum height (how far we can go down with the same color for all columns in our width)
      let height = 1;
      outerLoop: while (y + height < gridSize) {
        for (let dx = 0; dx < width; dx++) {
          if (grid[y + height][x + dx] !== color || 
              processed[y + height][x + dx]) {
            break outerLoop;
          }
        }
        height++;
      }
      
      // Mark all cells in this rectangle as processed
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          processed[y + dy][x + dx] = true;
        }
      }
      
      // Add this rectangle
      rectangles.push({ x, y, width, height, color });
    }
  }
  
  return rectangles;
};

/**
 * Export layers to SVG with full vector support
 * 
 * @param {number} gridSize - Size of the grid
 * @param {Array} layers - Array of layer objects with properties
 * @param {Object} options - SVG export options
 * @returns {string} - SVG content as string
 */
export const exportLayersToSVG = (gridSize, layers, options = {}) => {
  const { 
    width = 1024, 
    height = 1024,
    background = '#FFFFFF',
    includeLayerNames = true,
    optimizeRectangles = true
  } = options;
  
  // Calculate cell size based on viewport
  const cellSize = 1;
  
  // Track blend modes used for filter definitions
  const usedBlendModes = new Set();
  
  // Start building SVG document
  let svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${gridSize} ${gridSize}" 
  width="${width}" 
  height="${height}"
  version="1.1"
>`;
  
  // Add background if specified
  if (background) {
    svgContent += `
  <rect x="0" y="0" width="${gridSize}" height="${gridSize}" fill="${background}" />`;
  }
  
  // Process each visible layer from bottom to top
  const visibleLayers = layers.filter(layer => layer.visible);
  
  // Generate layer content
  const layerContent = visibleLayers.map(layer => {
    // Track this layer's blend mode
    if (layer.blendMode) {
      usedBlendModes.add(layer.blendMode);
    }
    
    // Start layer group
    let layerSVG = `
  <g id="layer-${layer.id}" opacity="${layer.opacity}"${layer.blendMode && layer.blendMode !== BLEND_MODES.NORMAL ? ` filter="url(#filter-${blendModeToSVGFilter(layer.blendMode)})"` : ''}>`;
    
    // Add layer name as a title if requested
    if (includeLayerNames && layer.name) {
      layerSVG += `
    <title>${layer.name}</title>`;
    }
    
    // Process grid data based on optimization setting
    if (optimizeRectangles) {
      // Generate optimized rectangles
      const rectangles = optimizeCells(gridSize, layer.gridData);
      
      // Add rectangles to SVG
      rectangles.forEach(rect => {
        layerSVG += `
    <rect ${createSVGElementAttributes(rect.x, rect.y, rect.width, rect.height, rect.color, 1, null)} />`;
      });
    } else {
      // Add individual cells without optimization
      Object.entries(layer.gridData).forEach(([key, color]) => {
        if (!color) return;
        
        const [x, y] = key.split(',').map(Number);
        layerSVG += `
    <rect ${createSVGElementAttributes(x, y, cellSize, cellSize, color, 1, null)} />`;
      });
    }
    
    // Close layer group
    layerSVG += `
  </g>`;
    
    return layerSVG;
  }).join('');
  
  // Add filter definitions if blend modes are used
  const filterDefs = generateSVGFilters(usedBlendModes);
  svgContent += filterDefs;
  
  // Add layer content
  svgContent += layerContent;
  
  // Close SVG document
  svgContent += `
</svg>`;
  
  return svgContent;
};

/**
 * Export grid data to optimized SVG format
 * Legacy function for backward compatibility
 * 
 * @param {number} gridSize - Size of the grid
 * @param {Array<string|null>} cellColors - Array of cell colors
 * @param {Object} options - SVG export options
 * @returns {string} - SVG content as string
 */
export const exportToSVGOptimized = (gridSize, cellColors, options = {}) => {
  // Create a layer-like object from flat cell colors array
  const fakeLayer = {
    id: 'single-layer',
    name: 'Artwork',
    visible: true,
    opacity: 1,
    blendMode: BLEND_MODES.NORMAL,
    gridData: {}
  };
  
  // Convert cellColors array to gridData object format
  cellColors.forEach((color, index) => {
    if (color) {
      const x = index % gridSize;
      const y = Math.floor(index / gridSize);
      fakeLayer.gridData[`${x},${y}`] = color;
    }
  });
  
  // Use the new export function with a single layer
  return exportLayersToSVG(gridSize, [fakeLayer], options);
};
