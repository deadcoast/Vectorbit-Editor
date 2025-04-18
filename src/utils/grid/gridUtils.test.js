// src/utils/grid/gridUtils.test.js
import { initializeGrid, updateGridCell } from './gridUtils';

describe('Grid Utilities', () => {
  it('initializes a grid with the correct size and default color', () => {
    const grid = initializeGrid(4, '#ffffff');
    expect(grid).toEqual(Array(16).fill('#ffffff'));
  });

  it('updates the correct cell in the grid', () => {
    const grid = initializeGrid(4, '#ffffff');
    const updatedGrid = updateGridCell(grid, 4, '#000000');
    expect(updatedGrid[4]).toBe('#000000');
  });

  it('throws an error for out-of-bound index', () => {
    const grid = initializeGrid(4, '#ffffff');
    expect(() => updateGridCell(grid, 20, '#000000')).toThrowError('Index out of bounds');
  });
});
