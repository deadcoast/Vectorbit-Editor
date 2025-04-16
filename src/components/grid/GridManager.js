
/**
 * Resizes the grid while maintaining existing colors.
 *
 * @param {number} newSize - The new size of the grid.
 * @param {number} oldGridSize - The size of the old grid.
 * @param {Array} oldCellColors - The array of cell colors from the old grid.
 * @param {Function} setCellColors - State setter for the new cell colors.
 */
export const resizeGrid = (newSize, oldGridSize, oldCellColors, setCellColors) => {
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
 *
 * @param {number} x - X-coordinate of the cell.
 * @param {number} y - Y-coordinate of the cell.
 * @param {string|null} color - The new color for the cell (null to erase).
 * @param {number} gridSize - The size of the grid.
 * @param {Function} setLayers - State setter for the grid layers.
 * @param {Array} layers - Current array of grid layers.
 * @param {number} activeLayer - The ID of the active layer.
 */
export const updateCell = (x, y, color, gridSize, setLayers, layers, activeLayer) => {
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
};

/**
 * Initializes a blank grid with a specified size and default color.
 *
 * @param {number} gridSize - The size of the grid.
 * @param {Function} setCellColors - State setter for the cell colors.
 * @param {string} defaultColor - Default color for new cells (default: #FFFFFF).
 */
export const initializeGrid = (gridSize, setCellColors, defaultColor = "#FFFFFF") => {
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
export const clearGrid = (gridSize, setCellColors, defaultColor = "#FFFFFF") => {
  const clearedGrid = Array(gridSize * gridSize).fill(defaultColor);
  setCellColors(clearedGrid);
};

/**
 * Fills an entire region (connected cells) with the specified color using flood fill.
 *
 * @param {number} x - Starting X-coordinate.
 * @param {number} y - Starting Y-coordinate.
 * @param {string} targetColor - Original color of the region to be replaced.
 * @param {string} fillColor - New color for the region.
 * @param {Array} cellColors - The current grid of cell colors.
 * @param {number} gridSize - The size of the grid.
 * @param {Function} setCellColors - State setter for the grid colors.
 */
export const floodFill = (x, y, targetColor, fillColor, cellColors, gridSize, setCellColors) => {
  if (targetColor === fillColor) {
    return;
  }

  const queue = [[x, y]];
  const updatedColors = [...cellColors];

  while (queue.length) {
    const [currentX, currentY] = queue.pop();
    const index = currentY * gridSize + currentX;

    if (
      currentX >= 0 &&
      currentX < gridSize &&
      currentY >= 0 &&
      currentY < gridSize &&
      updatedColors[index] === targetColor
    ) {
      updatedColors[index] = fillColor;

      queue.push([currentX - 1, currentY], [currentX + 1, currentY], [currentX, currentY - 1], [currentX, currentY + 1]);
    }
  }

  setCellColors(updatedColors);
};

/**
 * Applies a grid overlay for better pixel alignment.
 *
 * @param {boolean} showGrid - Whether to show the grid overlay.
 * @param {Function} setGridOverlay - State setter for grid overlay visibility.
 */
export const toggleGridOverlay = (showGrid, setGridOverlay) => {
  setGridOverlay(showGrid);
};
