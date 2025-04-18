import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';

import Toolbar from './toolbar';
import ColorWheel from '../ColorWheel/ColorWheel';

describe('Toolbar Component', () => {
  const mockSetActiveTool = jest.fn();
  const mockSetActiveColor = jest.fn();
  const mockOnAddToPalette = jest.fn();
  const mockOnAssignToAnchor = jest.fn();
  const mockSetBrushSize = jest.fn();
  const mockSaveProject = jest.fn();
  const mockLoadProject = jest.fn();
  const mockHandleGridResize = jest.fn();
  const mockSetDefaultFormat = jest.fn();
  const mockSaveDefaultFormat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tool buttons', () => {
    render(
      <Toolbar
        handleGridResize={mockHandleGridResize}
        loadProject={mockLoadProject}
        saveDefaultFormat={mockSaveDefaultFormat}
        saveProject={mockSaveProject}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setBrushSize={mockSetBrushSize}
        setDefaultFormat={mockSetDefaultFormat}
        onAddToPalette={mockOnAddToPalette}
        onAssignToAnchor={mockOnAssignToAnchor}
      />
    );

    expect(screen.getByText('Brush')).toBeInTheDocument();
    expect(screen.getByText('Eraser')).toBeInTheDocument();
    expect(screen.getByText('Bucket Fill')).toBeInTheDocument();
    expect(screen.getByText('Rectangle')).toBeInTheDocument();
    expect(screen.getByText('Ellipse')).toBeInTheDocument();
    expect(screen.getByText('Freehand')).toBeInTheDocument();
  });

  it('calls setActiveTool when a tool button is clicked', () => {
    render(
      <Toolbar
        handleGridResize={mockHandleGridResize}
        loadProject={mockLoadProject}
        saveDefaultFormat={mockSaveDefaultFormat}
        saveProject={mockSaveProject}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setBrushSize={mockSetBrushSize}
        setDefaultFormat={mockSetDefaultFormat}
        onAddToPalette={mockOnAddToPalette}
        onAssignToAnchor={mockOnAssignToAnchor}
      />
    );

    fireEvent.click(screen.getByText('Brush'));
    expect(mockSetActiveTool).toHaveBeenCalledWith('brush');

    fireEvent.click(screen.getByText('Eraser'));
    expect(mockSetActiveTool).toHaveBeenCalledWith('eraser');
  });

  it('integrates the ColorWheel component', () => {
    render(
      <Toolbar
        handleGridResize={mockHandleGridResize}
        loadProject={mockLoadProject}
        saveDefaultFormat={mockSaveDefaultFormat}
        saveProject={mockSaveProject}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setBrushSize={mockSetBrushSize}
        setDefaultFormat={mockSetDefaultFormat}
        onAddToPalette={mockOnAddToPalette}
        onAssignToAnchor={mockOnAssignToAnchor}
      />
    );

    expect(screen.getByTitle('Color Picker')).toBeInTheDocument();
  });

  it('calls setBrushSize on brush size input change', () => {
    render(
      <Toolbar
        handleGridResize={mockHandleGridResize}
        loadProject={mockLoadProject}
        saveDefaultFormat={mockSaveDefaultFormat}
        saveProject={mockSaveProject}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setBrushSize={mockSetBrushSize}
        setDefaultFormat={mockSetDefaultFormat}
        onAddToPalette={mockOnAddToPalette}
        onAssignToAnchor={mockOnAssignToAnchor}
      />
    );

    const brushSizeInput = screen.getByLabelText('Brush Size:');
    fireEvent.change(brushSizeInput, { target: { value: '5' } });

    expect(mockSetBrushSize).toHaveBeenCalledWith(5);
  });

  it('calls saveProject on save project button click', () => {
    render(
      <Toolbar
        handleGridResize={mockHandleGridResize}
        loadProject={mockLoadProject}
        saveDefaultFormat={mockSaveDefaultFormat}
        saveProject={mockSaveProject}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setBrushSize={mockSetBrushSize}
        setDefaultFormat={mockSetDefaultFormat}
        onAddToPalette={mockOnAddToPalette}
        onAssignToAnchor={mockOnAssignToAnchor}
      />
    );

    fireEvent.click(screen.getByText('Save Project'));
    expect(mockSaveProject).toHaveBeenCalled();
  });

  it('calls handleGridResize with correct size on grid resize button click', () => {
    render(
      <Toolbar
        handleGridResize={mockHandleGridResize}
        loadProject={mockLoadProject}
        saveDefaultFormat={mockSaveDefaultFormat}
        saveProject={mockSaveProject}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setBrushSize={mockSetBrushSize}
        setDefaultFormat={mockSetDefaultFormat}
        onAddToPalette={mockOnAddToPalette}
        onAssignToAnchor={mockOnAssignToAnchor}
      />
    );

    fireEvent.click(screen.getByText('8x8'));
    expect(mockHandleGridResize).toHaveBeenCalledWith(8);

    fireEvent.click(screen.getByText('16x16'));
    expect(mockHandleGridResize).toHaveBeenCalledWith(16);
  });

  it('calls setDefaultFormat when changing export format', () => {
    render(
      <Toolbar
        handleGridResize={mockHandleGridResize}
        loadProject={mockLoadProject}
        saveDefaultFormat={mockSaveDefaultFormat}
        saveProject={mockSaveProject}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setBrushSize={mockSetBrushSize}
        setDefaultFormat={mockSetDefaultFormat}
        onAddToPalette={mockOnAddToPalette}
        onAssignToAnchor={mockOnAssignToAnchor}
      />
    );

    const exportSelect = screen.getByDisplayValue('SVG');
    fireEvent.change(exportSelect, { target: { value: 'png' } });

    expect(mockSetDefaultFormat).toHaveBeenCalledWith('png');
  });

  it('renders and interacts with ColorWheel', () => {
    render(
      <Toolbar
        handleGridResize={mockHandleGridResize}
        loadProject={mockLoadProject}
        saveDefaultFormat={mockSaveDefaultFormat}
        saveProject={mockSaveProject}
        setActiveColor={mockSetActiveColor}
        setActiveTool={mockSetActiveTool}
        setBrushSize={mockSetBrushSize}
        setDefaultFormat={mockSetDefaultFormat}
        onAddToPalette={mockOnAddToPalette}
        onAssignToAnchor={mockOnAssignToAnchor}
      />
    );

    expect(screen.getByTitle('Color Picker')).toBeInTheDocument();

    fireEvent.change(screen.getByTitle('Color Picker'), {
      target: { value: '#ff0000' },
    });

    expect(mockSetActiveColor).toHaveBeenCalledWith('#ff0000');
  });
});
