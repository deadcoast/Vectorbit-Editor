/**
 * Centralized Grid Utilities
 * 
 * This module consolidates all grid-related utilities to prevent duplication
 * and ensure consistent implementation across the application.
 */

// Re-export all functions from gridUtils.js
export * from './gridUtils';

// Additional grid utility functions
export const getGridCoordinates = (index, gridSize) => ({
  x: index % gridSize,
  y: Math.floor(index / gridSize)
});

export const getGridIndex = (x, y, gridSize) => {
  return y * gridSize + x;
};

export const isValidGridPosition = (x, y, gridSize) => {
  return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
};

// Advanced grid operations
export const getAdjacentCells = (x, y, gridSize) => {
  const positions = [
    { x: x + 1, y }, // right
    { x: x - 1, y }, // left
    { x, y + 1 },    // bottom
    { x, y - 1 }     // top
  ];
  
  return positions.filter(pos => isValidGridPosition(pos.x, pos.y, gridSize));
};

export const getAllAdjacentCells = (x, y, gridSize) => {
  const positions = [
    { x: x + 1, y },      // right
    { x: x - 1, y },      // left
    { x, y + 1 },         // bottom
    { x, y - 1 },         // top
    { x: x + 1, y + 1 },  // bottom-right
    { x: x - 1, y + 1 },  // bottom-left
    { x: x + 1, y - 1 },  // top-right
    { x: x - 1, y - 1 }   // top-left
  ];
  
  return positions.filter(pos => isValidGridPosition(pos.x, pos.y, gridSize));
};
