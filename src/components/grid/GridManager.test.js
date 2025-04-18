// GridManager.test.js
import { resizeGrid, initializeGrid, updateGridCell, clearGrid } from './GridManager';

it('updates the correct cell in the active layer', () => {
  const mockSetLayers = jest.fn();
  const layers = [
    { id: 1, gridData: {} },
    { id: 2, gridData: {} },
  ];
  updateCell(0, 0, '#FF0000', 16, mockSetLayers, layers, 1);
  expect(mockSetLayers).toHaveBeenCalledWith([
    { id: 1, gridData: { '0,0': '#FF0000' } },
    { id: 2, gridData: {} },
  ]);
});

describe('GridManager Utility Functions', () => {
  it('should initialize the grid with the correct size and default color', () => {
    const mockSetCellColors = jest.fn();
    const gridSize = 4;
    const defaultColor = '#FF0000';

    initializeGrid(gridSize, mockSetCellColors, defaultColor);

    const expectedGrid = Array(gridSize * gridSize).fill(defaultColor);
    expect(mockSetCellColors).toHaveBeenCalledWith(expectedGrid);
  });

  it('should resize the grid and retain existing colors', () => {
    const oldGridSize = 2;
    const newSize = 4;
    const oldCellColors = ['#000000', '#111111', '#222222', '#333333'];
    const mockSetCellColors = jest.fn();

    resizeGrid(newSize, oldGridSize, oldCellColors, mockSetCellColors);

    const expectedGrid = [
      '#000000',
      '#000000',
      '#111111',
      '#111111',
      '#000000',
      '#000000',
      '#111111',
      '#111111',
      '#222222',
      '#222222',
      '#333333',
      '#333333',
      '#222222',
      '#222222',
      '#333333',
      '#333333',
    ];

    expect(mockSetCellColors).toHaveBeenCalledWith(expectedGrid);
  });

  it('should update a specific cell with the provided color', () => {
    const gridSize = 4;
    const initialColors = Array(gridSize * gridSize).fill('#FFFFFF');
    const mockSetCellColors = jest.fn(updater => updater(initialColors));
    const x = 1;
    const y = 1;
    const color = '#FF0000';

    updateGridCell(x, y, color, gridSize, mockSetCellColors);

    const updatedColors = [...initialColors];
    updatedColors[y * gridSize + x] = color;

    expect(mockSetCellColors).toHaveBeenCalledWith(expect.any(Function));
    expect(mockSetCellColors.mock.calls[0][0](initialColors)).toEqual(updatedColors);
  });

  it('should clear the grid to the default color', () => {
    const gridSize = 4;
    const mockSetCellColors = jest.fn();
    const defaultColor = '#000000';

    clearGrid(gridSize, mockSetCellColors, defaultColor);

    const expectedGrid = Array(gridSize * gridSize).fill(defaultColor);
    expect(mockSetCellColors).toHaveBeenCalledWith(expectedGrid);
  });

  it('should not update a cell if the index is out of bounds', () => {
    const gridSize = 4;
    const initialColors = Array(gridSize * gridSize).fill('#FFFFFF');
    const mockSetCellColors = jest.fn(updater => updater(initialColors));
    const x = 5; // Out of bounds
    const y = 5; // Out of bounds
    const color = '#FF0000';

    updateGridCell(x, y, color, gridSize, mockSetCellColors);

    expect(mockSetCellColors).toHaveBeenCalledWith(expect.any(Function));
    expect(mockSetCellColors.mock.calls[0][0](initialColors)).toEqual(initialColors);
  });
});
