/**
 * Utility functions for applying brush strokes
 */

/**
 * Creates a function to apply brush strokes with the current settings
 *
 * @param {object} options - Brush options
 * @param {string} options.activeColor - Current active color
 * @param {string} options.blendMode - Current blend mode
 * @param {string} options.brushShape - Current brush shape
 * @param {number} options.brushSize - Current brush size
 * @param {string} options.brushType - Current brush type
 * @param {function} options.determineCellColor - Function to determine the cell color
 * @param {object} options.gradientSettings - Current gradient settings
 * @param {number} options.gridSize - Size of the grid
 * @param {string} options.layerId - Target layer ID
 * @param {function} options.onStroke - Callback when stroke is applied
 * @param {number} options.opacity - Current opacity
 * @param {object} options.patternCache - Cache for patterns
 * @param {object} options.patternSettings - Current pattern settings
 * @param {number} options.pressure - Current pressure
 * @param {function} options.generatePattern - Function to generate patterns
 * @param {function} options.applySymmetry - Function to apply symmetry
 * @param {string} options.symmetryMode - Current symmetry mode
 * @returns {function} The brush application function
 */
import { isPositionInBrush } from './brushUtils';

export const createApplyBrushFunction = ({
  activeColor,
  blendMode,
  brushShape,
  brushSize,
  brushType,
  determineCellColor,
  generatePattern,
  gradientSettings,
  gridSize,
  layerId,
  onStroke,
  opacity,
  patternCache,
  patternSettings,
  pressure,
  applySymmetry,
  symmetryMode,
}) => {
  return (x, y) => {
    if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return null;

    // Calculate full brush area based on size
    const cells = [];
    const halfSize = Math.floor(brushSize / 2);

    for (let offsetY = -halfSize; offsetY <= halfSize; offsetY++) {
      for (let offsetX = -halfSize; offsetX <= halfSize; offsetX++) {
        const targetX = x + offsetX;
        const targetY = y + offsetY;

        // Skip if outside grid
        if (targetX < 0 || targetY < 0 || targetX >= gridSize || targetY >= gridSize) continue;

        // Determine if current offset is inside the brush shape
        if (isPositionInBrush(offsetX, offsetY, brushSize, brushShape)) {
          // Apply current brush settings to determine color
          const colorSettings = {
            brushType,
            activeColor,
            gridSize,
            patternSettings,
            gradientSettings,
            brushSize,
            patternCache: patternCache.current,
            generatePattern,
          };
          const color = determineCellColor(targetX, targetY, colorSettings);

          if (color) {
            cells.push({
              x: targetX,
              y: targetY,
              color,
              blendMode,
              opacity: opacity * pressure,
              layerId,
            });
          }
        }
      }
    }

    // Add symmetry if enabled
    const symmetryCells = applySymmetry(cells, symmetryMode, gridSize);
    cells.push(...symmetryCells);

    // Notify parent of stroke
    if (cells.length > 0 && onStroke) {
      onStroke(cells);
    }

    return cells;
  };
};
