/**
 * SVG Import Utility
 * Provides functionality for importing SVG files and converting them to the application's layer structure
 */

import { v4 as uuidv4 } from 'uuid';
import { colorToHex } from '../color/colorCore';

/**
 * Parse an SVG string and convert it to application layers
 * @param {string} svgString - SVG content as string
 * @param {number} gridSize - Size of the grid to map SVG to
 * @param {Object} options - Import options
 * @returns {Object} Object containing layers and metadata
 */
export const parseSVGToLayers = (svgString, gridSize, options = {}) => {
  try {
    // Create a parser and parse the SVG string
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    
    // Check for parsing errors
    const parserError = svgDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('SVG parsing error: ' + parserError.textContent);
    }
    
    // Get the root SVG element
    const svgElement = svgDoc.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found');
    }
    
    // Extract viewBox or width/height information
    const viewBox = svgElement.getAttribute('viewBox');
    let width = parseFloat(svgElement.getAttribute('width') || 0);
    let height = parseFloat(svgElement.getAttribute('height') || 0);
    
    // Parse viewBox if available
    let viewBoxValues = [];
    if (viewBox) {
      viewBoxValues = viewBox.split(/\s+/).map(value => parseFloat(value));
      if (viewBoxValues.length === 4) {
        // viewBox format: min-x min-y width height
        if (!width) width = viewBoxValues[2];
        if (!height) height = viewBoxValues[3];
      }
    }
    
    // If no dimensions found, use defaults
    if (!width || !height) {
      width = width || 100;
      height = height || 100;
    }
    
    // Calculate scale factors to map SVG to grid
    const scaleX = gridSize / width;
    const scaleY = gridSize / height;
    
    // Extract elements and create layers
    const layers = extractLayersFromSVG(svgElement, {
      scaleX, 
      scaleY, 
      gridSize,
      ...options
    });
    
    return {
      layers,
      metadata: {
        originalWidth: width,
        originalHeight: height,
        title: svgElement.getAttribute('title') || 'Imported SVG',
        description: svgElement.querySelector('desc')?.textContent || '',
      }
    };
  } catch (error) {
    console.error('Error parsing SVG:', error);
    throw error;
  }
};

/**
 * Extract layers from an SVG element
 * @param {SVGElement} svgElement - The SVG element to process
 * @param {Object} options - Processing options including scale factors
 * @returns {Array} Array of layer objects
 */
const extractLayersFromSVG = (svgElement, options) => {
  const { scaleX, scaleY, gridSize, preserveGroups = true, flattenGroups = false } = options;
  const layers = [];
  
  // Get all visual elements from the SVG
  const processElement = (element, parentLayer = null) => {
    const tagName = element.tagName.toLowerCase();
    
    // Handle groups as separate layers if preserveGroups is true
    if (tagName === 'g' && preserveGroups && !flattenGroups) {
      const groupId = element.getAttribute('id') || `group-${uuidv4().substring(0, 8)}`;
      const groupName = element.getAttribute('inkscape:label') || element.getAttribute('data-name') || groupId;
      const opacity = parseFloat(element.getAttribute('opacity') || 1);
      
      const groupLayer = {
        id: groupId,
        name: groupName,
        type: 'group',
        visible: !(element.getAttribute('display') === 'none'),
        opacity,
        cells: [],
        children: []
      };
      
      // Process child elements
      Array.from(element.children).forEach(child => {
        processElement(child, groupLayer);
      });
      
      // Only add non-empty groups
      if (groupLayer.cells.length > 0 || groupLayer.children.length > 0) {
        if (parentLayer) {
          parentLayer.children.push(groupLayer);
        } else {
          layers.push(groupLayer);
        }
      }
      
      return;
    }
    
    // Handle visual elements
    if (['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon'].includes(tagName)) {
      const elementCells = convertElementToCells(element, { scaleX, scaleY, gridSize });
      
      if (elementCells.length > 0) {
        const elementId = element.getAttribute('id') || `element-${uuidv4().substring(0, 8)}`;
        const elementName = element.getAttribute('data-name') || tagName;
        const opacity = parseFloat(element.getAttribute('opacity') || 1);
        
        if (flattenGroups) {
          // Add cells directly to the parent layer
          if (parentLayer) {
            parentLayer.cells.push(...elementCells);
          } else {
            // Create a new layer for the element
            layers.push({
              id: elementId,
              name: elementName,
              type: 'vector',
              visible: true,
              opacity,
              cells: elementCells,
              children: []
            });
          }
        } else {
          // Create a new layer for the element
          const elementLayer = {
            id: elementId,
            name: elementName,
            type: 'vector',
            visible: !(element.getAttribute('display') === 'none'),
            opacity,
            cells: elementCells,
            children: []
          };
          
          if (parentLayer) {
            parentLayer.children.push(elementLayer);
          } else {
            layers.push(elementLayer);
          }
        }
      }
    }
    
    // Process child elements for non-group elements
    if (tagName !== 'g') {
      Array.from(element.children).forEach(child => {
        processElement(child, parentLayer);
      });
    }
  };
  
  // Process all direct children of the SVG element
  Array.from(svgElement.children).forEach(child => {
    processElement(child);
  });
  
  return layers;
};

/**
 * Convert an SVG element to grid cells
 * @param {SVGElement} element - The SVG element to convert
 * @param {Object} options - Conversion options
 * @returns {Array} Array of cell objects with coordinates and colors
 */
const convertElementToCells = (element, options) => {
  const { scaleX, scaleY, gridSize } = options;
  const cells = [];
  
  try {
    // Get element styles
    const computedStyle = getElementComputedStyle(element);
    const fillColor = computedStyle.fill !== 'none' ? computedStyle.fill : null;
    const strokeColor = computedStyle.stroke !== 'none' ? computedStyle.stroke : null;
    const strokeWidth = parseFloat(computedStyle.strokeWidth) || 0;
    
    // Create an SVG path from the element for consistent rendering
    const path = convertToPath(element);
    if (!path) return cells;
    
    // Create a temporary SVG to render the path for pixel extraction
    const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tempSvg.setAttribute('width', gridSize);
    tempSvg.setAttribute('height', gridSize);
    tempSvg.setAttribute('viewBox', `0 0 ${gridSize} ${gridSize}`);
    
    // Clone the path and apply scaling
    const scaledPath = path.cloneNode(true);
    scaledPath.setAttribute('transform', `scale(${scaleX}, ${scaleY})`);
    
    // Apply styles to the path
    if (fillColor) scaledPath.setAttribute('fill', fillColor);
    if (strokeColor) {
      scaledPath.setAttribute('stroke', strokeColor);
      scaledPath.setAttribute('stroke-width', strokeWidth * Math.min(scaleX, scaleY));
    }
    
    tempSvg.appendChild(scaledPath);
    document.body.appendChild(tempSvg);
    
    // Create a canvas to render the SVG
    const canvas = document.createElement('canvas');
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext('2d');
    
    // Draw the SVG onto the canvas
    const svgURL = new XMLSerializer().serializeToString(tempSvg);
    const img = new Image();
    
    // Use a promise to handle the async image loading
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        
        // Extract pixel data
        const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
        const { data } = imageData;
        
        // Convert pixel data to cells
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const pixelIndex = (y * gridSize + x) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            const a = data[pixelIndex + 3];
            
            // Only create cells for non-transparent pixels
            if (a > 10) { // Threshold for transparency
              const color = colorToHex({ r, g, b });
              cells.push({ x, y, color, opacity: a / 255 });
            }
          }
        }
        
        // Clean up
        document.body.removeChild(tempSvg);
        
        resolve(cells);
      };
      
      img.onerror = () => {
        document.body.removeChild(tempSvg);
        resolve([]);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgURL);
    });
  } catch (error) {
    console.error('Error converting element to cells:', error);
    return [];
  }
};

/**
 * Get computed styles for an SVG element
 * @param {SVGElement} element - The SVG element
 * @returns {Object} Object containing computed style properties
 */
const getElementComputedStyle = (element) => {
  // Default styles
  const defaultStyles = {
    fill: '#000000',
    stroke: 'none',
    strokeWidth: 0,
    opacity: 1
  };
  
  try {
    // Get inline styles
    let fill = element.getAttribute('fill');
    let stroke = element.getAttribute('stroke');
    let strokeWidth = element.getAttribute('stroke-width');
    let opacity = element.getAttribute('opacity');
    
    // Get style attribute
    const styleAttr = element.getAttribute('style');
    if (styleAttr) {
      const styleProps = styleAttr.split(';').reduce((acc, prop) => {
        const [key, value] = prop.split(':').map(item => item.trim());
        if (key && value) {
          // Convert kebab-case to camelCase
          const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          acc[camelKey] = value;
        }
        return acc;
      }, {});
      
      // Override with style properties
      if (styleProps.fill) fill = styleProps.fill;
      if (styleProps.stroke) stroke = styleProps.stroke;
      if (styleProps.strokeWidth) strokeWidth = styleProps.strokeWidth;
      if (styleProps.opacity) opacity = styleProps.opacity;
    }
    
    // Merge with defaults
    return {
      fill: fill || defaultStyles.fill,
      stroke: stroke || defaultStyles.stroke,
      strokeWidth: strokeWidth || defaultStyles.strokeWidth,
      opacity: opacity || defaultStyles.opacity
    };
  } catch (error) {
    console.error('Error getting element styles:', error);
    return defaultStyles;
  }
};

/**
 * Convert any SVG shape element to a path element
 * @param {SVGElement} element - The SVG element to convert
 * @returns {SVGPathElement|null} Equivalent path element or null if conversion failed
 */
const convertToPath = (element) => {
  const tagName = element.tagName.toLowerCase();
  
  try {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Copy common attributes
    ['id', 'class', 'style', 'transform'].forEach(attr => {
      if (element.hasAttribute(attr)) {
        path.setAttribute(attr, element.getAttribute(attr));
      }
    });
    
    let d = '';
    
    switch (tagName) {
      case 'path':
        // Just use the existing path data
        d = element.getAttribute('d') || '';
        break;
        
      case 'rect':
        const x = parseFloat(element.getAttribute('x') || 0);
        const y = parseFloat(element.getAttribute('y') || 0);
        const width = parseFloat(element.getAttribute('width') || 0);
        const height = parseFloat(element.getAttribute('height') || 0);
        const rectRx = parseFloat(element.getAttribute('rx') || 0);
        const rectRy = parseFloat(element.getAttribute('ry') || rectRx || 0);
        
        if (rectRx === 0 && rectRy === 0) {
          // Simple rectangle
          d = `M${x},${y} h${width} v${height} h${-width} z`;
        } else {
          // Rectangle with rounded corners
          d = `M${x + rectRx},${y} h${width - 2 * rectRx} a${rectRx},${rectRy} 0 0 1 ${rectRx},${rectRy} v${height - 2 * rectRy} a${rectRx},${rectRy} 0 0 1 ${-rectRx},${rectRy} h${2 * rectRx - width} a${rectRx},${rectRy} 0 0 1 ${-rectRx},${-rectRy} v${2 * rectRy - height} a${rectRx},${rectRy} 0 0 1 ${rectRx},${-rectRy} z`;
        }
        break;
        
      case 'circle':
        const cx = parseFloat(element.getAttribute('cx') || 0);
        const cy = parseFloat(element.getAttribute('cy') || 0);
        const r = parseFloat(element.getAttribute('r') || 0);
        
        d = `M${cx - r},${cy} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 z`;
        break;
        
      case 'ellipse':
        const ecx = parseFloat(element.getAttribute('cx') || 0);
        const ecy = parseFloat(element.getAttribute('cy') || 0);
        const ellipseRx = parseFloat(element.getAttribute('rx') || 0);
        const ellipseRy = parseFloat(element.getAttribute('ry') || 0);
        
        d = `M${ecx - ellipseRx},${ecy} a${ellipseRx},${ellipseRy} 0 1,0 ${2 * ellipseRx},0 a${ellipseRx},${ellipseRy} 0 1,0 ${-2 * ellipseRx},0 z`;
        break;
        
      case 'line':
        const x1 = parseFloat(element.getAttribute('x1') || 0);
        const y1 = parseFloat(element.getAttribute('y1') || 0);
        const x2 = parseFloat(element.getAttribute('x2') || 0);
        const y2 = parseFloat(element.getAttribute('y2') || 0);
        
        d = `M${x1},${y1} L${x2},${y2}`;
        break;
        
      case 'polyline':
      case 'polygon':
        const points = element.getAttribute('points');
        if (points) {
          const pointsArray = points.trim().split(/\s+|,/).map(parseFloat);
          
          if (pointsArray.length >= 2) {
            d = `M${pointsArray[0]},${pointsArray[1]}`;
            
            for (let i = 2; i < pointsArray.length; i += 2) {
              if (i + 1 < pointsArray.length) {
                d += ` L${pointsArray[i]},${pointsArray[i + 1]}`;
              }
            }
            
            if (tagName === 'polygon') {
              d += ' z';
            }
          }
        }
        break;
        
      default:
        return null;
    }
    
    path.setAttribute('d', d);
    return path;
  } catch (error) {
    console.error(`Error converting ${tagName} to path:`, error);
    return null;
  }
};

/**
 * Import SVG from a file input
 * @param {File} file - The SVG file to import
 * @param {number} gridSize - Size of the grid to map SVG to
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Promise resolving to layers and metadata
 */
export const importSVGFromFile = (file, gridSize, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    
    if (!file.type.includes('svg')) {
      reject(new Error('File is not an SVG'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const svgString = event.target.result;
        const result = parseSVGToLayers(svgString, gridSize, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading SVG file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Import SVG from a URL
 * @param {string} url - URL to the SVG file
 * @param {number} gridSize - Size of the grid to map SVG to
 * @param {Object} options - Import options
 * @returns {Promise<Object>} Promise resolving to layers and metadata
 */
export const importSVGFromURL = (url, gridSize, options = {}) => {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
      }
      return response.text();
    })
    .then(svgString => parseSVGToLayers(svgString, gridSize, options));
};

/**
 * Optimize SVG layers by combining adjacent cells with the same color
 * @param {Array} layers - Array of layer objects with cells
 * @returns {Array} Optimized layers with reduced cell count
 */
export const optimizeSVGLayers = (layers) => {
  return layers.map(layer => {
    // If this is a group layer, optimize its children recursively
    if (layer.children && layer.children.length > 0) {
      return {
        ...layer,
        children: optimizeSVGLayers(layer.children)
      };
    }
    
    // Skip optimization for non-vector layers or layers with no cells
    if (layer.type !== 'vector' || !layer.cells || layer.cells.length === 0) {
      return layer;
    }
    
    // Group cells by color and opacity
    const cellGroups = {};
    
    layer.cells.forEach(cell => {
      const key = `${cell.color}-${cell.opacity || 1}`;
      if (!cellGroups[key]) {
        cellGroups[key] = {
          color: cell.color,
          opacity: cell.opacity || 1,
          cells: []
        };
      }
      cellGroups[key].cells.push({ x: cell.x, y: cell.y });
    });
    
    // Optimize each group by combining adjacent cells
    const optimizedCells = [];
    
    Object.values(cellGroups).forEach(group => {
      const { color, opacity, cells } = group;
      
      // Find adjacent cells that can be combined into rectangles
      const rectangles = findRectangles(cells);
      
      // Convert rectangles back to cells with optimized data
      rectangles.forEach(rect => {
        optimizedCells.push({
          ...rect,
          color,
          opacity
        });
      });
    });
    
    return {
      ...layer,
      cells: optimizedCells
    };
  });
};

/**
 * Find rectangles from a set of cells to optimize SVG generation
 * @param {Array} cells - Array of {x, y} coordinates
 * @returns {Array} Array of rectangle objects
 */
const findRectangles = (cells) => {
  if (cells.length === 0) return [];
  
  // Create a grid to mark cell positions
  const grid = {};
  cells.forEach(cell => {
    if (!grid[cell.y]) grid[cell.y] = {};
    grid[cell.y][cell.x] = true;
  });
  
  const rectangles = [];
  const processed = {};
  
  cells.forEach(cell => {
    const key = `${cell.x},${cell.y}`;
    if (processed[key]) return;
    
    // Try to expand as a rectangle
    const rect = expandRectangle(cell.x, cell.y, grid, processed);
    if (rect) {
      rectangles.push(rect);
    }
  });
  
  return rectangles;
};

/**
 * Expand a cell into the largest possible rectangle
 * @param {number} startX - X coordinate of the starting cell
 * @param {number} startY - Y coordinate of the starting cell
 * @param {Object} grid - Grid of cell positions
 * @param {Object} processed - Map of processed cells
 * @returns {Object|null} Rectangle object or null if can't expand
 */
const expandRectangle = (startX, startY, grid, processed) => {
  // Mark the starting cell as processed
  processed[`${startX},${startY}`] = true;
  
  // Find maximum width
  let width = 1;
  while (grid[startY][startX + width]) {
    processed[`${startX + width},${startY}`] = true;
    width++;
  }
  
  // Find maximum height (that maintains the width)
  let height = 1;
  let canExpand = true;
  
  while (canExpand && grid[startY + height]) {
    
    // Check if all cells in the next row are filled
    for (let x = 0; x < width; x++) {
      if (!grid[startY + height][startX + x]) {
        canExpand = false;
        break;
      }
    }
    
    if (canExpand) {
      // Mark all cells in this row as processed
      for (let x = 0; x < width; x++) {
        processed[`${startX + x},${startY + height}`] = true;
      }
      height++;
    }
  }
  
  return {
    x: startX,
    y: startY,
    width,
    height,
    type: 'rect'
  };
};
