/**
 * Resizes the grid while maintaining existing colors.
 *
 * @param {number} newSize - The new size of the grid.
 * @param {number} oldGridSize - The size of the old grid.
 * @param {Array} oldCellColors - The array of cell colors from the old grid.
 * @param {Function} setCellColors - State setter for the new cell colors.
 */
export const resizeGrid = (
  newSize,
  oldGridSize,
  oldCellColors,
  setCellColors
) => {
  const scale = newSize / oldGridSize;
  const resizedGrid = Array(newSize * newSize).fill("#FFFFFF");

  for (let y = 0; y < oldGridSize; y++) {
    for (let x = 0; x < oldGridSize; x++) {
      const oldIndex = y * oldGridSize + x;
      const newX = Math.floor(x * scale);
      const newY = Math.floor(y * scale);
      const newIndex = newY * newSize + newX;

      resizedGrid[newIndex] = oldCellColors[oldIndex];
    }
  }

  setCellColors(resizedGrid);
};

/**
 * Updates a single cell in the grid with a specified color.
 *
 * @param {number} x - X-coordinate of the cell.
 * @param {number} y - Y-coordinate of the cell.
 * @param {string} color - The new color for the cell.
 * @param {number} gridSize - The size of the grid.
 * @param {Function} setCellColors - State setter for the cell colors.
 */
export const updateGridCell = (x, y, color, gridSize, setCellColors) => {
  setCellColors((prev) => {
    const updatedColors = [...prev];
    const index = y * gridSize + x;

    if (index >= 0 && index < updatedColors.length) {
      updatedColors[index] = color;
    }

    return updatedColors;
  });
};

/**
 * Updates a cell for the active layer in a multi-layer grid system.
 * Checks if the layer is locked before making changes.
 *
 * @param {number} x - X-coordinate of the cell.
 * @param {number} y - Y-coordinate of the cell.
 * @param {string|null} color - The new color for the cell (null to erase).
 * @param {number} gridSize - The size of the grid.
 * @param {Function} setLayers - State setter for the grid layers.
 * @param {Array} layers - Current array of grid layers.
 * @param {number} activeLayer - The ID of the active layer.
 * @returns {boolean} - Whether the update was successful (false if layer was locked)
 */
export const updateCell = (
  x,
  y,
  color,
  gridSize,
  setLayers,
  layers,
  activeLayer
) => {
  // Find the active layer
  const activeLayerObj = layers.find((layer) => layer.id === activeLayer);

  // Check if the layer is locked or not visible
  if (!activeLayerObj || activeLayerObj.locked || !activeLayerObj.visible) {
    console.warn("Cannot edit: layer is locked, hidden, or does not exist");
    return false;
  }

  const updatedLayers = layers.map((layer) =>
    layer.id === activeLayer
      ? {
          ...layer,
          gridData: {
            ...layer.gridData,
            [`${x},${y}`]: color,
          },
        }
      : layer
  );

  setLayers(updatedLayers);
  return true;
};

/**
 * Initializes a blank grid with a specified size and default color.
 *
 * @param {number} gridSize - The size of the grid.
 * @param {Function} setCellColors - State setter for the cell colors.
 * @param {string} defaultColor - Default color for new cells (default: #FFFFFF).
 */
export const initializeGrid = (
  gridSize,
  setCellColors,
  defaultColor = "#FFFFFF"
) => {
  const initialGrid = Array(gridSize * gridSize).fill(defaultColor);
  setCellColors(initialGrid);
};

/**
 * Clears the entire grid by setting all cells to the default color.
 *
 * @param {number} gridSize - The size of the grid.
 * @param {Function} setCellColors - State setter for the cell colors.
 * @param {string} defaultColor - Default color for cleared cells (default: #FFFFFF).
 */
export const clearGrid = (
  gridSize,
  setCellColors,
  defaultColor = "#FFFFFF"
) => {
  const clearedGrid = Array(gridSize * gridSize).fill(defaultColor);
  setCellColors(clearedGrid);
};

/**
 * Fills an entire region (connected cells) with the specified color using flood fill.
 * Checks if the layer is locked before making changes.
 *
 * @param {number} x - Starting X-coordinate.
 * @param {number} y - Starting Y-coordinate.
 * @param {string} targetColor - Original color of the region to be replaced.
 * @param {string} fillColor - New color for the region.
 * @param {Array} cellColors - The current grid of cell colors.
 * @param {number} gridSize - The size of the grid.
 * @param {Function} setCellColors - State setter for the grid colors.
 * @param {boolean} respectLock - Whether to respect layer locking (default: true)
 * @returns {boolean} - Whether the flood fill was successful (false if layer was locked)
 */
export const floodFill = (
  x,
  y,
  targetColor,
  fillColor,
  cellColors,
  gridSize,
  setCellColors,
  respectLock = true
) => {
  // If target color is the same as fill color, no need to fill
  if (targetColor === fillColor) {
    return false;
  }

  // For layered implementation when checking locked status
  if (
    typeof cellColors === "object" &&
    "locked" in cellColors &&
    respectLock &&
    (cellColors.locked || !cellColors.visible)
  ) {
    console.warn("Cannot edit: layer is locked or hidden");
    return false;
  }

  const visited = {};
  const queue = [];
  queue.push([x, y]);

  const updatedColors = { ...cellColors };
  let changes = 0;

  while (queue.length > 0) {
    const [currentX, currentY] = queue.shift();
    const key = `${currentX},${currentY}`;

    if (
      visited[key] ||
      currentX < 0 ||
      currentX >= gridSize ||
      currentY < 0 ||
      currentY >= gridSize ||
      updatedColors[key] !== targetColor
    ) {
      continue;
    }

    visited[key] = true;
    updatedColors[key] = fillColor;
    changes++;

    // Add adjacent cells to the queue (4-way connectivity)
    queue.push([currentX + 1, currentY]);
    queue.push([currentX - 1, currentY]);
    queue.push([currentX, currentY + 1]);
    queue.push([currentX, currentY - 1]);
  }

  if (changes > 0) {
    setCellColors(updatedColors);
    return true;
  }

  return false;
};

/**
 * Applies a grid overlay for better pixel alignment.
 *
 * @param {boolean} showGrid - Whether to show the grid overlay.
 * @param {Function} setGridOverlay - State setter for grid overlay visibility.
 */
/**
 * Toggles the grid overlay visibility for better pixel alignment.
 *
 * @param {boolean} showGrid - Whether to show the grid overlay.
 * @param {Function} setGridOverlay - State setter for grid overlay visibility.
 */
export const toggleGridOverlay = (showGrid, setGridOverlay) => {
  setGridOverlay(showGrid);
};

/**
 * Renders all visible layers with proper blending and opacity.
 *
 * @param {Array} layers - Array of layer objects with gridData, blendMode, and opacity
 * @param {string} gridSize - Size of the grid
 * @param {HTMLCanvasElement} canvas - Canvas element to render on
 */
export const renderLayers = (layers, gridSize, canvas) => {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const cellSize = canvas.width / gridSize;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Import dynamically to avoid circular dependencies
  import("../utils/blend/BlendModeProcessor.js").then(
    ({ getCompositePixelColor }) => {
      // Filter visible layers
      const visibleLayers = layers.filter((layer) => layer.visible);

      // Render each cell with proper blending
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const cellKey = `${x},${y}`;

          // Get the composite color for this cell across all layers
          const compositeColor = getCompositePixelColor(visibleLayers, x, y);

          if (compositeColor) {
            ctx.fillStyle = compositeColor;
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  );
};

/**
 * Locks or unlocks a layer to prevent edits.
 *
 * @param {string} layerId - ID of the layer to lock/unlock
 * @param {boolean} locked - Whether to lock (true) or unlock (false) the layer
 * @param {Array} layers - Current array of layers
 * @param {Function} setLayers - State setter for the layers
 */
export const setLayerLock = (layerId, locked, layers, setLayers) => {
  const updatedLayers = layers.map((layer) =>
    layer.id === layerId ? { ...layer, locked } : layer
  );
  setLayers(updatedLayers);
};

/**
 * Sets the opacity of a layer.
 *
 * @param {string} layerId - ID of the layer
 * @param {number} opacity - Opacity value between 0 and 1
 * @param {Array} layers - Current array of layers
 * @param {Function} setLayers - State setter for the layers
 */
export const setLayerOpacity = (layerId, opacity, layers, setLayers) => {
  const clampedOpacity = Math.min(1, Math.max(0, opacity));
  const updatedLayers = layers.map((layer) =>
    layer.id === layerId ? { ...layer, opacity: clampedOpacity } : layer
  );
  setLayers(updatedLayers);
};

/**
 * Sets the blend mode of a layer.
 *
 * @param {string} layerId - ID of the layer
 * @param {string} blendMode - Blend mode to apply
 * @param {Array} layers - Current array of layers
 * @param {Function} setLayers - State setter for the layers
 */
export const setLayerBlendMode = (layerId, blendMode, layers, setLayers) => {
  const updatedLayers = layers.map((layer) =>
    layer.id === layerId ? { ...layer, blendMode } : layer
  );
  setLayers(updatedLayers);
};
