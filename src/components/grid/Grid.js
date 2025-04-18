import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

import './Grid.css';
import { updateCell, floodFill, toggleGridOverlay } from './GridManager';

const Grid = ({
  gridSize,
  layers,
  activeLayer,
  setLayers,
  activeTool,
  activeColor,
  gridOverlay,
  setGridOverlay,
}) => {
  const gridRef = useRef();
  const canvasRef = useRef();
  const [hoveredCell, setHoveredCell] = useState(null); // For cell preview functionality
  const [cellColors, setCellColors] = useState({});
  const [_isDrawing, _setIsDrawing] = useState(false); // For tracking drawing state
  const [_startIndex, _setStartIndex] = useState(null); // For line tool
  const [hoverIndex, setHoverIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // History management
  const updateHistory = newState => {
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Handle individual cell click based on active tool
  const handleCellClick = (x, y) => {
    if (activeTool === 'brush') {
      updateCell(x, y, activeColor, gridSize, setLayers, layers, activeLayer);
    } else if (activeTool === 'eraser') {
      updateCell(x, y, null, gridSize, setLayers, layers, activeLayer);
    } else if (activeTool === 'fill') {
      const currentLayer = layers.find(layer => layer.id === activeLayer);
      const targetColor = currentLayer?.gridData?.[`${x},${y}`] || 'transparent';
      floodFill(x, y, targetColor, activeColor, currentLayer.gridData, gridSize, updatedColors => {
        setLayers(prevLayers =>
          prevLayers.map(layer =>
            layer.id === activeLayer ? { ...layer, gridData: updatedColors } : layer
          )
        );
      });
    }
  };

  // Handle mouse hover for cell preview
  const handleCellHover = (x, y) => {
    setHoveredCell({ x, y });
  };

  // Advanced drawing functions from the second implementation
  const handleCellClickIndex = (index, endIndex = null) => {
    const updatedColors = { ...cellColors };

    if (activeTool === 'brush') {
      updatedColors[index] = activeColor;
    } else if (activeTool === 'eraser') {
      delete updatedColors[index];
    } else if (activeTool === 'rectangle' && endIndex !== null) {
      drawRectangle(index, endIndex);
    } else if (activeTool === 'line' && endIndex !== null) {
      drawLine(index, endIndex);
    } else if (activeTool === 'bucket') {
      floodFillIndex(index, cellColors[index] || '#f9f9f9', activeColor);
    }

    setCellColors(updatedColors);
    updateHistory(updatedColors);
  };

  const drawRectangle = (startIndex, endIndex) => {
    const updatedColors = { ...cellColors };
    const [startX, startY] = [startIndex % gridSize, Math.floor(startIndex / gridSize)];
    const [endX, endY] = [endIndex % gridSize, Math.floor(endIndex / gridSize)];
    const [minX, maxX] = [Math.min(startX, endX), Math.max(startX, endX)];
    const [minY, maxY] = [Math.min(startY, endY), Math.max(startY, endY)];

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        updatedColors[y * gridSize + x] = activeColor;
      }
    }
    setCellColors(updatedColors);
  };

  const drawLine = (startIndex, endIndex) => {
    const updatedColors = { ...cellColors };
    const [startX, startY] = [startIndex % gridSize, Math.floor(startIndex / gridSize)];
    const [endX, endY] = [endIndex % gridSize, Math.floor(endIndex / gridSize)];
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = startX < endX ? 1 : -1;
    const sy = startY < endY ? 1 : -1;
    let err = dx - dy;

    let x = startX;
    let y = startY;

    // Draw until we reach the end point
    while (x !== endX || y !== endY) {
      updatedColors[y * gridSize + x] = activeColor;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    // Ensure the end point is colored (needed after switching from while(true) loop)
    updatedColors[endY * gridSize + endX] = activeColor;

    setCellColors(updatedColors);
  };

  const floodFillIndex = (index, targetColor, fillColor) => {
    if (targetColor === fillColor) return;

    const updatedColors = { ...cellColors };
    const queue = [index];

    while (queue.length > 0) {
      const currentIndex = queue.shift();
      const currentColor = updatedColors[currentIndex] || '#f9f9f9';

      if (currentColor === targetColor) {
        updatedColors[currentIndex] = fillColor;

        const neighbors = [
          currentIndex - 1,
          currentIndex + 1,
          currentIndex - gridSize,
          currentIndex + gridSize,
        ];

        neighbors.forEach(neighbor => {
          if (neighbor >= 0 && neighbor < gridSize * gridSize && !queue.includes(neighbor)) {
            queue.push(neighbor);
          }
        });
      }
    }
    setCellColors(updatedColors);
  };

  // History navigation
  const undo = () => {
    if (historyIndex > 0) {
      setCellColors(history[historyIndex - 1]);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setCellColors(history[historyIndex + 1]);
      setHistoryIndex(historyIndex + 1);
    }
  };

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
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const currentLayer = layers.find(layer => layer.id === activeLayer);
          const isActiveCell = currentLayer?.gridData?.[`${x},${y}`];

          return (
            <div
              key={index}
              className="grid-cell"
              aria-label={`Grid cell at row ${Math.floor(index / gridSize) + 1}, column ${(index % gridSize) + 1}`}
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
                border: hoverIndex === index ? '1px solid red' : '1px solid var(--border-color)',
              }}
              tabIndex="0"
              onClick={() => {
                handleCellClick(x, y);
                handleCellClickIndex(index);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleCellClick(x, y);
                  handleCellClickIndex(index);
                }
              }}
              onMouseEnter={() => {
                handleCellHover(x, y);
                setHoverIndex(index);
              }}
              onMouseLeave={() => setHoverIndex(null)}
            />
          );
        })}
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

// Helper function to determine cell background color without nested ternaries
const getCellBackgroundColor = (hoveredCell, x, y, activeTool, activeColor, isActiveCell) => {
  // Cell is currently being hovered over
  if (hoveredCell?.x === x && hoveredCell?.y === y) {
    if (activeTool === 'brush') {
      return activeColor;
    }
    if (activeTool === 'eraser') {
      return 'transparent';
    }
    return isActiveCell || 'transparent';
  }
  // Cell is not being hovered over
  return isActiveCell || 'transparent';
};

Grid.propTypes = {
  activeColor: PropTypes.string.isRequired,
  activeLayer: PropTypes.string.isRequired,
  activeTool: PropTypes.string.isRequired,
  gridOverlay: PropTypes.bool.isRequired,
  gridSize: PropTypes.number.isRequired,
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      blendMode: PropTypes.string,
      gridData: PropTypes.object,
      id: PropTypes.string.isRequired,
      locked: PropTypes.bool,
      name: PropTypes.string,
      opacity: PropTypes.number,
      visible: PropTypes.bool,
    })
  ).isRequired,
  setGridOverlay: PropTypes.func.isRequired,
  setLayers: PropTypes.func.isRequired,
};

export default Grid;
