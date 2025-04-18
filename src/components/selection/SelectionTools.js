/**
 * Selection Tools Component
 * Provides functionality for selecting areas of artwork and applying transformations
 */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SelectionTools.css';

// Transformation types
export const TRANSFORM_TYPES = {
  SCALE: 'scale',
  ROTATE: 'rotate',
  FLIP_HORIZONTAL: 'flip_horizontal',
  FLIP_VERTICAL: 'flip_vertical',
  MOVE: 'move',
};

// Selection modes
export const SELECTION_MODES = {
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  LASSO: 'lasso',
  MAGIC_WAND: 'magic_wand',
  COLOR_RANGE: 'color_range',
};

const SelectionTools = ({
  gridSize,
  layerData,
  activeLayer,
  onSelectionChange,
  onTransformApply,
}) => {
  // Selection state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(SELECTION_MODES.RECTANGLE);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [selectedCells, setSelectedCells] = useState([]);

  // Transform state
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformType, setTransformType] = useState(TRANSFORM_TYPES.MOVE);
  const [transformOrigin, setTransformOrigin] = useState({ x: 0, y: 0 });
  const [transformParams, setTransformParams] = useState({
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
  });

  // History for undo/redo
  const selectionHistory = useRef([]);

  // Canvas refs for rendering
  const selectionCanvasRef = useRef(null);
  const transformPreviewRef = useRef(null);

  // Handle selection mode change
  const handleSelectionModeChange = mode => {
    setSelectionMode(mode);
    clearSelection();
  };

  // Clear the current selection
  const clearSelection = () => {
    setSelectedCells([]);
    setSelectionStart({ x: 0, y: 0 });
    setSelectionEnd({ x: 0, y: 0 });
    setIsSelecting(false);

    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  // Start selection process
  const startSelection = (x, y) => {
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
  };

  // Update selection as mouse moves
  const updateSelection = (x, y) => {
    if (!isSelecting) return;

    setSelectionEnd({ x, y });

    // Calculate selected cells based on selection mode
    const cells = calculateSelectedCells();
    setSelectedCells(cells);

    if (onSelectionChange) {
      onSelectionChange(cells);
    }
  };

  // End selection process
  const endSelection = () => {
    if (!isSelecting) return;

    setIsSelecting(false);

    // Save selection to history
    selectionHistory.current.push([...selectedCells]);

    // If no cells selected, clear selection
    if (selectedCells.length === 0) {
      clearSelection();
    }
  };

  // Calculate which cells are selected based on the current mode and selection area
  const calculateSelectedCells = () => {
    if (!isSelecting || !layerData || !activeLayer) return [];

    const cells = [];
    const { x: startX, y: startY } = selectionStart;
    const { x: endX, y: endY } = selectionEnd;

    // Normalize coordinates so start is always top-left
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);

    // Filter cells based on selection mode
    switch (selectionMode) {
      case SELECTION_MODES.RECTANGLE: {
        // Select all cells within rectangle
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            if (x >= 0 && y >= 0 && x < gridSize && y < gridSize) {
              // Get cell from the active layer
              const cell = layerData.find(
                cell => cell.layerId === activeLayer && cell.x === x && cell.y === y
              );

              if (cell) {
                cells.push(cell);
              }
            }
          }
        }
        break;
      }

      case SELECTION_MODES.ELLIPSE: {
        // Select cells within ellipse
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const radiusX = (maxX - minX) / 2;
        const radiusY = (maxY - minY) / 2;

        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            if (x >= 0 && y >= 0 && x < gridSize && y < gridSize) {
              // Ellipse formula: (x-h)²/a² + (y-k)²/b² <= 1
              const normalizedX = (x - centerX) / radiusX;
              const normalizedY = (y - centerY) / radiusY;
              const distance = normalizedX * normalizedX + normalizedY * normalizedY;

              if (distance <= 1) {
                const cell = layerData.find(
                  cell => cell.layerId === activeLayer && cell.x === x && cell.y === y
                );

                if (cell) {
                  cells.push(cell);
                }
              }
            }
          }
        }
        break;
      }

      case SELECTION_MODES.MAGIC_WAND: {
        // Implement flood fill algorithm based on color similarity
        if (
          selectionStart.x >= 0 &&
          selectionStart.y >= 0 &&
          selectionStart.x < gridSize &&
          selectionStart.y < gridSize
        ) {
          const targetCell = layerData.find(
            cell =>
              cell.layerId === activeLayer &&
              cell.x === selectionStart.x &&
              cell.y === selectionStart.y
          );

          if (targetCell) {
            const targetColor = targetCell.color;
            const tolerance = 0.1; // Adjustable tolerance for similar colors

            // Flood fill with queue
            const queue = [{ x: selectionStart.x, y: selectionStart.y }];
            const visited = new Set();

            while (queue.length > 0) {
              const { x, y } = queue.shift();
              const key = `${x},${y}`;

              if (visited.has(key)) continue;
              visited.add(key);

              const cell = layerData.find(
                cell => cell.layerId === activeLayer && cell.x === x && cell.y === y
              );

              if (cell && isColorSimilar(cell.color, targetColor, tolerance)) {
                cells.push(cell);

                // Add neighbors to queue
                if (x > 0) queue.push({ x: x - 1, y });
                if (x < gridSize - 1) queue.push({ x: x + 1, y });
                if (y > 0) queue.push({ x, y: y - 1 });
                if (y < gridSize - 1) queue.push({ x, y: y + 1 });
              }
            }
          }
        }
        break;
      }

      case SELECTION_MODES.LASSO: {
        // For lasso, we'd need to track the full path drawn
        // This is a simplified implementation - would need a proper point-in-polygon test
        // Just matching rectangle behavior for now
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            if (x >= 0 && y >= 0 && x < gridSize && y < gridSize) {
              const cell = layerData.find(
                cell => cell.layerId === activeLayer && cell.x === x && cell.y === y
              );

              if (cell) {
                cells.push(cell);
              }
            }
          }
        }
        break;
      }

      case SELECTION_MODES.COLOR_RANGE: {
        // Select all cells with similar color to the start cell
        if (
          selectionStart.x >= 0 &&
          selectionStart.y >= 0 &&
          selectionStart.x < gridSize &&
          selectionStart.y < gridSize
        ) {
          const targetCell = layerData.find(
            cell =>
              cell.layerId === activeLayer &&
              cell.x === selectionStart.x &&
              cell.y === selectionStart.y
          );

          if (targetCell) {
            const targetColor = targetCell.color;
            const tolerance = Math.max(0.1, Math.abs(maxX - minX) / gridSize); // Adjustable based on drag distance

            layerData.forEach(cell => {
              if (
                cell.layerId === activeLayer &&
                isColorSimilar(cell.color, targetColor, tolerance)
              ) {
                cells.push(cell);
              }
            });
          }
        }
        break;
      }

      default:
        break;
    }

    return cells;
  };

  // Check if two colors are similar within a tolerance
  const isColorSimilar = (color1, color2, tolerance) => {
    if (!color1 || !color2) return false;

    // Convert hex to RGB
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return false;

    // Calculate color distance (simplified)
    const distance =
      Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2)
      ) / 442; // Normalize by max possible distance in RGB space

    return distance <= tolerance;
  };

  // Convert hex color to RGB object
  const hexToRgb = hex => {
    if (!hex || typeof hex !== 'string') return null;

    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse hex values
    const bigint = parseInt(hex, 16);

    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // Start transformation process
  const startTransform = type => {
    if (selectedCells.length === 0) return;

    setIsTransforming(true);
    setTransformType(type);

    // Calculate transform origin (center of selection)
    const { minX, minY, maxX, maxY } = getSelectionBounds();
    setTransformOrigin({
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    });

    // Reset transform parameters
    setTransformParams({
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0,
    });
  };

  // Update transformation as mouse moves
  const updateTransform = (x, y) => {
    if (!isTransforming || selectedCells.length === 0) return;

    const { x: originX, y: originY } = transformOrigin;
    const deltaX = x - originX;
    const deltaY = y - originY;

    // Update transform parameters based on transform type
    switch (transformType) {
      case TRANSFORM_TYPES.MOVE:
        setTransformParams({
          ...transformParams,
          translateX: deltaX,
          translateY: deltaY,
        });
        break;

      case TRANSFORM_TYPES.SCALE: {
        // Calculate scale factors based on distance from origin
        const initialDistance = Math.sqrt(
          Math.pow(selectionStart.x - originX, 2) + Math.pow(selectionStart.y - originY, 2)
        );

        const currentDistance = Math.sqrt(Math.pow(x - originX, 2) + Math.pow(y - originY, 2));

        const scaleFactor = initialDistance === 0 ? 1 : currentDistance / initialDistance;

        setTransformParams({
          ...transformParams,
          scaleX: scaleFactor,
          scaleY: scaleFactor,
        });
        break;
      }

      case TRANSFORM_TYPES.ROTATE: {
        // Calculate rotation angle based on vectors
        const initialAngle = Math.atan2(selectionStart.y - originY, selectionStart.x - originX);
        const currentAngle = Math.atan2(y - originY, x - originX);

        setTransformParams({
          ...transformParams,
          rotation: currentAngle - initialAngle,
        });
        break;
      }

      case TRANSFORM_TYPES.FLIP_HORIZONTAL: {
        setTransformParams({
          ...transformParams,
          scaleX: deltaX < 0 ? -1 : 1,
        });
        break;
      }

      case TRANSFORM_TYPES.FLIP_VERTICAL: {
        setTransformParams({
          ...transformParams,
          scaleY: deltaY < 0 ? -1 : 1,
        });
        break;
      }

      default: {
        break;
      }
    }
  };

  const applyTransform = () => {
    if (!isTransforming || selectedCells.length === 0) return;

    const { scaleX, scaleY, rotation, translateX, translateY } = transformParams;
    const { x: originX, y: originY } = transformOrigin;

    // Copy selected cells to avoid mutation
    const transformedCells = selectedCells.map(cell => ({ ...cell }));

    // Apply transformations
    transformedCells.forEach(cell => {
      // Translate cell coordinates to origin
      let x = cell.x - originX;
      let y = cell.y - originY;

      // Apply scale
      x *= scaleX;
      y *= scaleY;

      // Apply rotation
      if (rotation !== 0) {
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const newX = x * cos - y * sin;
        const newY = x * sin + y * cos;
        x = newX;
        y = newY;
      }

      // Apply translation and convert back from origin-centered coordinates
      cell.x = Math.round(x + originX + translateX);
      cell.y = Math.round(y + originY + translateY);

      // Ensure coordinates are within grid bounds
      cell.x = Math.max(0, Math.min(gridSize - 1, cell.x));
      cell.y = Math.max(0, Math.min(gridSize - 1, cell.y));
    });

    // Notify parent component of transformation
    if (onTransformApply) {
      onTransformApply(selectedCells, transformedCells);
    }

    // Reset transform state
    setIsTransforming(false);
    setTransformParams({
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0,
    });

    // Clear selection after transform
    clearSelection();
  };

  // Cancel transformation
  const cancelTransform = () => {
    setIsTransforming(false);
    setTransformParams({
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      translateX: 0,
      translateY: 0,
    });
  };

  // Get bounds of the current selection
  const getSelectionBounds = () => {
    if (selectedCells.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedCells.forEach(cell => {
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    });

    return { minX, minY, maxX, maxY };
  };

  // Render selection overlay on canvas
  useEffect(() => {
    const canvas = selectionCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw selection rectangle during selection
    if (isSelecting) {
      const { x: startX, y: startY } = selectionStart;
      const { x: endX, y: endY } = selectionEnd;

      ctx.strokeStyle = 'rgba(0, 120, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      const width = endX - startX;
      const height = endY - startY;

      if (selectionMode === SELECTION_MODES.RECTANGLE) {
        ctx.strokeRect(startX, startY, width, height);
      } else if (selectionMode === SELECTION_MODES.ELLIPSE) {
        ctx.beginPath();
        ctx.ellipse(
          startX + width / 2,
          startY + height / 2,
          Math.abs(width) / 2,
          Math.abs(height) / 2,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }

    // Highlight selected cells
    ctx.fillStyle = 'rgba(0, 120, 255, 0.3)';
    ctx.strokeStyle = 'rgba(0, 120, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    selectedCells.forEach(cell => {
      ctx.fillRect(cell.x, cell.y, 1, 1);
      ctx.strokeRect(cell.x, cell.y, 1, 1);
    });

    // Draw transform handles if cells are selected
    if (selectedCells.length > 0 && !isTransforming) {
      const { minX, minY, maxX, maxY } = getSelectionBounds();

      // Draw selection boundary
      ctx.strokeStyle = 'rgba(0, 150, 255, 1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(minX - 0.5, minY - 0.5, maxX - minX + 1, maxY - minY + 1);

      // Draw control handles
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(0, 150, 255, 1)';

      // Corner handles
      [
        { x: minX - 0.5, y: minY - 0.5 },
        { x: maxX + 0.5, y: minY - 0.5 },
        { x: maxX + 0.5, y: maxY + 0.5 },
        { x: minX - 0.5, y: maxY + 0.5 },
      ].forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Mid-edge handles
      [
        { x: (minX + maxX) / 2, y: minY - 0.5 },
        { x: (minX + maxX) / 2, y: maxY + 0.5 },
        { x: minX - 0.5, y: (minY + maxY) / 2 },
        { x: maxX + 0.5, y: (minY + maxY) / 2 },
      ].forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Rotation handle
      ctx.beginPath();
      ctx.moveTo((minX + maxX) / 2, minY - 0.5);
      ctx.lineTo((minX + maxX) / 2, minY - 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc((minX + maxX) / 2, minY - 2, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Draw transform preview
    if (isTransforming) {
      const previewCanvas = transformPreviewRef.current;
      if (!previewCanvas) return;

      const previewCtx = previewCanvas.getContext('2d');
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      const { scaleX, scaleY, rotation, translateX, translateY } = transformParams;
      const { x: originX, y: originY } = transformOrigin;

      previewCtx.save();

      // Set transform origin
      previewCtx.translate(originX, originY);

      // Apply transformations
      previewCtx.rotate(rotation);
      previewCtx.scale(scaleX, scaleY);

      // Draw cells
      previewCtx.fillStyle = 'rgba(0, 120, 255, 0.5)';
      previewCtx.strokeStyle = 'rgba(0, 120, 255, 0.8)';
      previewCtx.lineWidth = 1 / Math.max(Math.abs(scaleX), Math.abs(scaleY));

      selectedCells.forEach(cell => {
        const x = cell.x - originX;
        const y = cell.y - originY;
        previewCtx.fillRect(x, y, 1, 1);
        previewCtx.strokeRect(x, y, 1, 1);
      });

      previewCtx.restore();

      // Draw translated version
      if (translateX !== 0 || translateY !== 0) {
        previewCtx.fillStyle = 'rgba(0, 200, 100, 0.5)';
        previewCtx.strokeStyle = 'rgba(0, 200, 100, 0.8)';

        selectedCells.forEach(cell => {
          const x = cell.x + translateX;
          const y = cell.y + translateY;
          previewCtx.fillRect(x, y, 1, 1);
          previewCtx.strokeRect(x, y, 1, 1);
        });
      }
    }
  }, [
    isSelecting,
    selectionStart,
    selectionEnd,
    selectedCells,
    selectionMode,
    isTransforming,
    transformParams,
  ]);

  // Return the component UI
  return (
    <div className="selection-tools">
      <div className="selection-controls">
        <h4>Selection Mode</h4>
        <div className="selection-mode-buttons">
          {Object.entries(SELECTION_MODES).map(([key, value]) => (
            <button
              key={key}
              className={selectionMode === value ? 'active' : ''}
              title={key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
              onClick={() => handleSelectionModeChange(value)}
            >
              {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
            </button>
          ))}
        </div>

        {selectedCells.length > 0 && (
          <div className="transform-controls">
            <h4>Transform</h4>
            <div className="transform-buttons">
              {Object.entries(TRANSFORM_TYPES).map(([key, value]) => (
                <button
                  key={key}
                  className={transformType === value && isTransforming ? 'active' : ''}
                  title={key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                  onClick={() => startTransform(value)}
                >
                  {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                </button>
              ))}
            </div>

            {isTransforming && (
              <div className="transform-actions">
                <button className="apply-button" onClick={applyTransform}>
                  Apply
                </button>
                <button className="cancel-button" onClick={cancelTransform}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        <button
          className="clear-selection-button"
          disabled={selectedCells.length === 0}
          onClick={clearSelection}
        >
          Clear Selection
        </button>
      </div>

      <canvas
        ref={selectionCanvasRef}
        className="selection-canvas"
        height={gridSize}
        width={gridSize}
      />

      <canvas
        ref={transformPreviewRef}
        className="transform-preview"
        height={gridSize}
        style={{ display: isTransforming ? 'block' : 'none' }}
        width={gridSize}
      />
    </div>
  );
};

SelectionTools.propTypes = {
  gridSize: PropTypes.number.isRequired,
  layerData: PropTypes.array.isRequired,
  activeLayer: PropTypes.string.isRequired,
  onSelectionChange: PropTypes.func,
  onTransformApply: PropTypes.func,
};

export default SelectionTools;
