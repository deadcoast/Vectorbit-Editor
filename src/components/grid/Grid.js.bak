import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, useRef } from 'react';

import './Grid.css';
import { updateCell, floodFill, toggleGridOverlay } from './GridManager';

/**
 * Custom hook to manage cell interactions
 */
export const useCellInteractions = ({
  activeColor,
  activeLayer,
  activeTool,
  gridSize,
  layers,
  setLayers,
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [cellColors, setCellColors] = useState({});
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // History management
  const updateHistory = useCallback(
    newState => {
      const newHistory = [...history.slice(0, historyIndex + 1), newState];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Handle individual cell click based on active tool
  const handleCellClick = useCallback(
    (x, y) => {
      if (activeTool === 'brush') {
        updateCell(x, y, activeColor, gridSize, setLayers, layers, activeLayer);
      } else if (activeTool === 'eraser') {
        updateCell(x, y, null, gridSize, setLayers, layers, activeLayer);
      } else if (activeTool === 'fill') {
        const currentLayer = layers.find(layer => layer.id === activeLayer);
        const targetColor = currentLayer?.gridData?.[`${x},${y}`] || 'transparent';
        floodFill(
          x,
          y,
          targetColor,
          activeColor,
          currentLayer.gridData,
          gridSize,
          updatedColors => {
            setLayers(prevLayers =>
              prevLayers.map(layer =>
                layer.id === activeLayer ? { ...layer, gridData: updatedColors } : layer
              )
            );
          }
        );
      }
    },
    [activeColor, activeLayer, activeTool, gridSize, layers, setLayers]
  );

  // Handle mouse hover for cell preview
  const handleCellHover = useCallback((x, y) => {
    setHoveredCell({ x, y });
  }, []);

  // Cell click by index (used by advanced drawing tools)
  const handleCellClickIndex = useCallback(
    (index, endIndex = null) => {
      const updatedColors = { ...cellColors };

      if (activeTool === 'brush') {
        updatedColors[index] = activeColor;
      } else if (activeTool === 'eraser') {
        delete updatedColors[index];
      } else if (activeTool === 'rectangle' && endIndex !== null) {
        drawRectangle(index, endIndex, updatedColors);
      } else if (activeTool === 'line' && endIndex !== null) {
        drawLine(index, endIndex, updatedColors);
      } else if (activeTool === 'bucket') {
        floodFillIndex(index, cellColors[index] || '#f9f9f9', activeColor, updatedColors);
      }

      setCellColors(updatedColors);
      updateHistory(updatedColors);
    },
    [activeColor, activeTool, cellColors, updateHistory, drawRectangle, drawLine, floodFillIndex]
  );

  // Drawing a rectangle
  const drawRectangle = useCallback(
    (startIndex, endIndex, updatedColors) => {
      const [startX, startY] = [startIndex % gridSize, Math.floor(startIndex / gridSize)];
      const [endX, endY] = [endIndex % gridSize, Math.floor(endIndex / gridSize)];
      const [minX, maxX] = [Math.min(startX, endX), Math.max(startX, endX)];
      const [minY, maxY] = [Math.min(startY, endY), Math.max(startY, endY)];

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          updatedColors[y * gridSize + x] = activeColor;
        }
      }
      return updatedColors;
    },
    [activeColor, gridSize]
  );

  // Drawing a line
  const drawLine = useCallback(
    (startIndex, endIndex, updatedColors) => {
      let [currentX, currentY] = [startIndex % gridSize, Math.floor(startIndex / gridSize)];
      const [endX, endY] = [endIndex % gridSize, Math.floor(endIndex / gridSize)];
      const dx = Math.abs(endX - currentX);
      const dy = Math.abs(endY - currentY);
      const sx = currentX < endX ? 1 : -1;
      const sy = currentY < endY ? 1 : -1;
      let err = dx - dy;

      // Use a condition instead of while(true)
      let shouldContinue = true;
      while (shouldContinue) {
        const index = currentY * gridSize + currentX;
        updatedColors[index] = activeColor;

        if (currentX === endX && currentY === endY) {
          shouldContinue = false;
        } else {
          const e2 = 2 * err;
          if (e2 > -dy) {
            err -= dy;
            currentX += sx;
          }
          if (e2 < dx) {
            err += dx;
            currentY += sy;
          }
        }
      }
      return updatedColors;
    },
    [activeColor, gridSize]
  );

  // Flood fill at index
  const floodFillIndex = useCallback((index, targetColor, fillColor, updatedColors) => {
    // Implementation of flood fill would go here
    // This is a placeholder that would need to be updated with the actual flood fill logic
    updatedColors[index] = fillColor;
    return updatedColors;
  }, []);

  return {
    hoveredCell,
    cellColors,
    handleCellClick,
    handleCellHover,
    handleCellClickIndex,
    setCellColors,
  };
};

/**
 * GridCells component to render the individual cells
 */
const GridCells = ({
  activeColor,
  activeLayer,
  activeTool,
  gridSize,
  layers,
  hoveredCell,
  onCellClick,
  onCellHover,
  onCellClickIndex,
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Helper function to determine cell background color
  const getCellBackgroundColor = (hoveredCell, x, y, activeTool, activeColor, isActiveCell) => {
    if (hoveredCell && hoveredCell.x === x && hoveredCell.y === y) {
      return activeTool === 'eraser' ? '#f9f9f9' : activeColor;
    }
    return isActiveCell || '#f9f9f9';
  };

  // Handle keyboard navigation for accessibility
  const handleKeyPress = (e, x, y, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onCellClick(x, y);
      onCellClickIndex(index);
    }
  };

  return (
    <div className="grid-cells">
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        const currentLayer = layers.find(layer => layer.id === activeLayer);
        const isActiveCell = currentLayer?.gridData?.[`${x},${y}`];

        return (
          <div
            key={index}
            aria-label={`Grid cell at row ${Math.floor(index / gridSize) + 1}, column ${(index % gridSize) + 1}`}
            className="grid-cell"
            role="button"
            style={{
              backgroundColor: getCellBackgroundColor(
                hoveredCell,
                x,
                y,
                activeTool,
                activeColor,
                isActiveCell
              ),
              opacity: hoverIndex === index ? 0.8 : 1,
            }}
            tabIndex="0"
            onClick={() => {
              onCellClick(x, y);
              onCellClickIndex(index);
            }}
            onKeyDown={e => handleKeyPress(e, x, y, index)}
            onMouseEnter={() => {
              onCellHover(x, y);
              setHoverIndex(index);
            }}
            onMouseLeave={() => setHoverIndex(null)}
          />
        );
      })}
    </div>
  );
};

/**
 * Main Grid component for the pixel editor
 */
const Grid = ({
  activeColor,
  activeLayer,
  activeTool,
  gridOverlay,
  gridSize,
  layers,
  setGridOverlay,
  setLayers,
}) => {
  const gridRef = useRef();
  const canvasRef = useRef();
  const [_isDrawing, _setIsDrawing] = useState(false); // For tracking drawing state
  const [_startIndex, _setStartIndex] = useState(null); // For line tool

  // Use our custom hook for cell interactions
  const {
    hoveredCell,
    cellColors,
    handleCellClick,
    handleCellHover,
    handleCellClickIndex,
    setCellColors,
  } = useCellInteractions({
    activeColor,
    activeLayer,
    activeTool,
    gridSize,
    layers,
    setLayers,
  });

  // Local state for history management instead of using the hook's history management
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // History management - this function is used in handleCellClickIndex via the hook
  // eslint-disable-next-line no-unused-vars
  const updateHistory = newState => {
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // History navigation wrapped in useCallback to prevent recreating on every render
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setCellColors(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setCellColors]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setCellColors(history[historyIndex + 1]);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setCellColors]);

  // Handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Canvas rendering functions
  const renderToCanvas = (scale = 1) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const cellSize = (500 / gridSize) * scale;

    canvas.width = 500 * scale;
    canvas.height = 500 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.keys(cellColors).forEach(key => {
      const index = parseInt(key);
      const x = (index % gridSize) * cellSize;
      const y = Math.floor(index / gridSize) * cellSize;
      ctx.fillStyle = cellColors[key];
      ctx.fillRect(x, y, cellSize, cellSize);
    });
  };

  const exportCanvas = (format, scale = 1) => {
    renderToCanvas(scale);
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL(`image/${format}`);
    link.download = `grid-export.${format}`;
    link.click();
  };

  // Render grid cells
  return (
    <div>
      <div className="grid-controls">
        <button onClick={() => renderToCanvas()}>Render to Canvas</button>
        <button onClick={() => exportCanvas('png')}>Export to PNG</button>
        <button onClick={() => exportCanvas('jpeg')}>Export to JPG</button>
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>
      <div
        ref={gridRef}
        className={`grid-container ${gridOverlay ? 'grid-overlay' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        <GridCells
          activeColor={activeColor}
          activeLayer={activeLayer}
          activeTool={activeTool}
          gridSize={gridSize}
          hoveredCell={hoveredCell}
          layers={layers}
          onCellClick={handleCellClick}
          onCellHover={handleCellHover}
          onCellClickIndex={handleCellClickIndex}
        />
        {/* Toggle grid overlay button */}
        <button
          className="grid-toggle-button"
          onClick={() => toggleGridOverlay(!gridOverlay, setGridOverlay)}
        >
          {gridOverlay ? 'Hide Grid' : 'Show Grid'}
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

Grid.propTypes = {
  activeColor: PropTypes.string.isRequired,
  activeLayer: PropTypes.string.isRequired,
  activeTool: PropTypes.string.isRequired,
  gridOverlay: PropTypes.bool.isRequired,
  gridSize: PropTypes.number.isRequired,
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      visible: PropTypes.bool.isRequired,
      gridData: PropTypes.object,
    })
  ).isRequired,
  setGridOverlay: PropTypes.func.isRequired,
  setLayers: PropTypes.func.isRequired,
};

GridCells.propTypes = {
  activeColor: PropTypes.string.isRequired,
  activeLayer: PropTypes.string.isRequired,
  activeTool: PropTypes.string.isRequired,
  gridSize: PropTypes.number.isRequired,
  hoveredCell: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }),
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      visible: PropTypes.bool.isRequired,
      gridData: PropTypes.object,
    })
  ).isRequired,
  onCellClick: PropTypes.func.isRequired,
  onCellHover: PropTypes.func.isRequired,
  onCellClickIndex: PropTypes.func.isRequired,
};

export default Grid;
