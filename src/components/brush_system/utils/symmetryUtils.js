/**
 * Symmetry Utility Functions
 * This file contains utility functions for handling symmetry operations
 * in the brush system.
 */
import { SYMMETRY_MODES } from '../BrushManager';

/**
 * Apply symmetry to the provided cells
 * @param {Array} cells - Original brush cells
 * @param {string} symmetryMode - Current symmetry mode
 * @param {number} gridSize - Size of the grid
 * @returns {Array} Additional cells based on symmetry
 */
export const applySymmetry = (cells, symmetryMode, gridSize) => {
  const symmetryCells = [];

  if (symmetryMode === SYMMETRY_MODES.NONE) return symmetryCells;

  for (const cell of cells) {
    switch (symmetryMode) {
      case SYMMETRY_MODES.HORIZONTAL:
        symmetryCells.push({ ...cell, x: gridSize - 1 - cell.x });
        break;
      case SYMMETRY_MODES.VERTICAL:
        symmetryCells.push({ ...cell, y: gridSize - 1 - cell.y });
        break;
      case SYMMETRY_MODES.QUAD:
        symmetryCells.push({ ...cell, x: gridSize - 1 - cell.x });
        symmetryCells.push({ ...cell, y: gridSize - 1 - cell.y });
        symmetryCells.push({
          ...cell,
          x: gridSize - 1 - cell.x,
          y: gridSize - 1 - cell.y,
        });
        break;
      case SYMMETRY_MODES.RADIAL: {
        // 8-way radial symmetry
        const centerX = gridSize / 2;
        const centerY = gridSize / 2;
        const dx = cell.x - centerX;
        const dy = cell.y - centerY;

        for (let i = 1; i < 8; i++) {
          const angle = (Math.PI / 4) * i;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const rotatedX = Math.round(dx * cos - dy * sin + centerX);
          const rotatedY = Math.round(dx * sin + dy * cos + centerY);

          if (rotatedX >= 0 && rotatedX < gridSize && rotatedY >= 0 && rotatedY < gridSize) {
            symmetryCells.push({
              ...cell,
              x: rotatedX,
              y: rotatedY,
            });
          }
        }
        break;
      }
      case SYMMETRY_MODES.MIRROR: {
        // Mirror across specified axis
        const centerXMirror = gridSize / 2;
        const centerYMirror = gridSize / 2;

        // Mirror across both axes
        symmetryCells.push({
          ...cell,
          x: centerXMirror - (cell.x - centerXMirror),
          y: cell.y,
        });

        symmetryCells.push({
          ...cell,
          x: cell.x,
          y: centerYMirror - (cell.y - centerYMirror),
        });

        symmetryCells.push({
          ...cell,
          x: centerXMirror - (cell.x - centerXMirror),
          y: centerYMirror - (cell.y - centerYMirror),
        });
        break;
      }
      default:
        // No transformation for unknown modes
        break;
    }
  }

  return symmetryCells;
};

/**
 * Applies symmetry to stroke coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} symmetryMode - Current symmetry mode
 * @param {number} gridSize - Size of the grid
 * @returns {Array} Array of points with symmetry applied
 */
export const applyCoordinateSymmetry = (x, y, symmetryMode, gridSize) => {
  const points = [{ x, y }];
  const centerX = gridSize / 2;
  const centerY = gridSize / 2;

  switch (symmetryMode) {
    case SYMMETRY_MODES.HORIZONTAL:
      points.push({ x: gridSize - x - 1, y });
      break;
    case SYMMETRY_MODES.VERTICAL:
      points.push({ x, y: gridSize - y - 1 });
      break;
    case SYMMETRY_MODES.QUAD:
      points.push(
        { x: gridSize - x - 1, y },
        { x, y: gridSize - y - 1 },
        { x: gridSize - x - 1, y: gridSize - y - 1 }
      );
      break;
    case SYMMETRY_MODES.RADIAL: {
      const angle = Math.atan2(y - centerY, x - centerX);
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      for (let i = 1; i < 8; i++) {
        const newAngle = angle + (Math.PI / 4) * i;
        points.push({
          x: Math.round(centerX + distance * Math.cos(newAngle)),
          y: Math.round(centerY + distance * Math.sin(newAngle)),
        });
      }
      break;
    }
    default:
      // No transformation for unknown modes
      break;
  }

  return points;
};
