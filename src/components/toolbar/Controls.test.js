import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import Controls from './Controls';

describe('Controls Component', () => {
  const mockToggleGrid = jest.fn();
  const mockSetGridSize = jest.fn();
  const mockSetActiveTool = jest.fn();
  const mockSetActiveColor = jest.fn();
  const mockHandleNewFile = jest.fn();
  const mockHandleOpenFile = jest.fn();
  const mockHandleSaveFile = jest.fn();

  it('renders all controls', () => {
    const { getByText } = render(
      <Controls
        handleNewFile={mockHandleNewFile}
        handleOpenFile={mockHandleOpenFile}
        handleSaveFile={mockHandleSaveFile}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setGridSize={mockSetGridSize}
        toggleGrid={mockToggleGrid}
      />
    );

    // Verify menus
    expect(getByText('File')).toBeInTheDocument();
    expect(getByText('Settings')).toBeInTheDocument();

    // Verify toolbar buttons
    expect(getByText('Brush')).toBeInTheDocument();
    expect(getByText('Eraser')).toBeInTheDocument();
  });

  it("calls handleNewFile when 'New' is clicked", () => {
    const { getByText } = render(
      <Controls
        handleNewFile={mockHandleNewFile}
        handleOpenFile={mockHandleOpenFile}
        handleSaveFile={mockHandleSaveFile}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setGridSize={mockSetGridSize}
        toggleGrid={mockToggleGrid}
      />
    );

    fireEvent.click(getByText('New'));
    expect(mockHandleNewFile).toHaveBeenCalled();
  });

  it("calls handleOpenFile when 'Open' is clicked", () => {
    const { getByText } = render(
      <Controls
        handleNewFile={mockHandleNewFile}
        handleOpenFile={mockHandleOpenFile}
        handleSaveFile={mockHandleSaveFile}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setGridSize={mockSetGridSize}
        toggleGrid={mockToggleGrid}
      />
    );

    fireEvent.click(getByText('Open'));
    expect(mockHandleOpenFile).toHaveBeenCalled();
  });

  it("calls handleSaveFile when 'Save' is clicked", () => {
    const { getByText } = render(
      <Controls
        handleNewFile={mockHandleNewFile}
        handleOpenFile={mockHandleOpenFile}
        handleSaveFile={mockHandleSaveFile}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setGridSize={mockSetGridSize}
        toggleGrid={mockToggleGrid}
      />
    );

    fireEvent.click(getByText('Save'));
    expect(mockHandleSaveFile).toHaveBeenCalled();
  });

  it('calls setGridSize when a grid size button is clicked', () => {
    const { getByText } = render(
      <Controls
        handleNewFile={mockHandleNewFile}
        handleOpenFile={mockHandleOpenFile}
        handleSaveFile={mockHandleSaveFile}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setGridSize={mockSetGridSize}
        toggleGrid={mockToggleGrid}
      />
    );

    fireEvent.click(getByText('Grid: 16x16'));
    expect(mockSetGridSize).toHaveBeenCalledWith(16);

    fireEvent.click(getByText('Grid: 32x32'));
    expect(mockSetGridSize).toHaveBeenCalledWith(32);
  });

  it("calls toggleGrid when 'Toggle Grid' is clicked", () => {
    const { getByText } = render(
      <Controls
        handleNewFile={mockHandleNewFile}
        handleOpenFile={mockHandleOpenFile}
        handleSaveFile={mockHandleSaveFile}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setGridSize={mockSetGridSize}
        toggleGrid={mockToggleGrid}
      />
    );

    fireEvent.click(getByText('Toggle Grid'));
    expect(mockToggleGrid).toHaveBeenCalled();
  });

  it('calls setActiveTool when a tool button is clicked', () => {
    const { getByText } = render(
      <Controls
        handleNewFile={mockHandleNewFile}
        handleOpenFile={mockHandleOpenFile}
        handleSaveFile={mockHandleSaveFile}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setGridSize={mockSetGridSize}
        toggleGrid={mockToggleGrid}
      />
    );

    fireEvent.click(getByText('Brush'));
    expect(mockSetActiveTool).toHaveBeenCalledWith('brush');

    fireEvent.click(getByText('Eraser'));
    expect(mockSetActiveTool).toHaveBeenCalledWith('eraser');
  });

  it('calls setActiveColor when a color is selected', () => {
    const { getByLabelText } = render(
      <Controls
        handleNewFile={mockHandleNewFile}
        handleOpenFile={mockHandleOpenFile}
        handleSaveFile={mockHandleSaveFile}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setGridSize={mockSetGridSize}
        toggleGrid={mockToggleGrid}
      />
    );

    const colorInput = getByLabelText('Color:');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect(mockSetActiveColor).toHaveBeenCalledWith('#ff0000');
  });
});
