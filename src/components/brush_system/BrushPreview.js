import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import './BrushPreview.css';

/**
 * BrushPreview Component
 * Shows a live preview of the brush shape, size, and pattern near the cursor
 */
const BrushPreview = ({
  brushSettings,
  activeColor,
  gridSize,
  cursorPosition,
  isDrawing = false,
}) => {
  const previewRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [previewCells, setPreviewCells] = useState([]);

  // Cell size in pixels for the preview
  const cellSize = 8;

  // Extract settings
  const { brushType, brushSize, brushShape, patternSettings, gradientSettings, symmetryMode } =
    brushSettings || {};

  // Generate brush preview data
  useEffect(() => {
    if (!brushSettings || !activeColor) {
      setPreviewCells([]);
      return;
    }

    // Generate preview cells array based on brush settings
    const cells = [];
    const halfSize = Math.floor(brushSize / 2);
    const previewGridSize = brushSize * 2; // Make the preview a bit bigger

    for (let y = -halfSize; y <= halfSize; y++) {
      for (let x = -halfSize; x <= halfSize; x++) {
        // Determine if position is within brush shape
        const isInBrush = isPositionInBrush(x, y, brushSize, brushShape);

        if (isInBrush) {
          // Calculate color based on brush type and settings
          const color = getPreviewColor(x, y, activeColor, brushSettings, previewGridSize);

          if (color) {
            cells.push({
              x: x + halfSize,
              y: y + halfSize,
              color,
            });
          }
        }
      }
    }

    // Add symmetry cells if enabled
    if (symmetryMode && symmetryMode !== 'none') {
      const symmetryCells = generateSymmetryCells(cells, symmetryMode, previewGridSize);
      cells.push(...symmetryCells);
    }

    setPreviewCells(cells);
  }, [
    brushSettings,
    activeColor,
    brushSize,
    brushShape,
    brushType,
    patternSettings,
    gradientSettings,
    symmetryMode,
  ]);

  // Position the preview near the cursor
  useEffect(() => {
    if (!previewRef.current || !cursorPosition) return;

    const { x, y } = cursorPosition;
    const previewElement = previewRef.current;
    const previewSize = previewElement.offsetWidth;

    // Position the preview at an offset from the cursor
    // so it doesn't obscure what the user is drawing
    const offsetX = 20;
    const offsetY = 20;

    // Check if the preview would go off-screen and adjust position if needed
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let finalX = x + offsetX;
    let finalY = y + offsetY;

    if (finalX + previewSize > windowWidth) {
      finalX = x - previewSize - offsetX;
    }

    if (finalY + previewSize > windowHeight) {
      finalY = y - previewSize - offsetY;
    }

    previewElement.style.left = `${finalX}px`;
    previewElement.style.top = `${finalY}px`;

    // Hide preview when drawing
    setVisible(!isDrawing);
  }, [cursorPosition, isDrawing]);

  // Helper function to determine if a position is within the brush shape
  const isPositionInBrush = (offsetX, offsetY, size, shape) => {
    // Default shape is square
    if (!shape || shape === 'square') {
      return Math.abs(offsetX) <= size / 2 && Math.abs(offsetY) <= size / 2;
    }

    // Circle shape
    if (shape === 'circle') {
      const radius = size / 2;
      return Math.sqrt(offsetX * offsetX + offsetY * offsetY) <= radius;
    }

    // Diamond shape
    if (shape === 'diamond') {
      return Math.abs(offsetX) + Math.abs(offsetY) <= size / 2;
    }

    // Custom shape
    if (Array.isArray(shape)) {
      const index =
        (offsetY + Math.floor(shape.length / 2)) * shape.length +
        (offsetX + Math.floor(shape[0].length / 2));
      return shape.flat()[index];
    }

    return false;
  };

  // Helper function to get color for a preview cell
  const getPreviewColor = (x, y, color, settings, previewSize) => {
    if (!settings) return color;

    const { brushType, patternSettings, gradientSettings } = settings;

    if (brushType === 'eraser') {
      return '#FFFFFF'; // Show eraser as white in preview
    }

    if (brushType === 'filled') {
      return color;
    }

    if (brushType === 'gradient' && gradientSettings) {
      const { startColor, endColor, type, angle } = gradientSettings;

      if (type === 'linear') {
        // Convert angle to radians
        const rad = (angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Project point onto gradient direction
        const normalizedX = (x + previewSize / 2) / previewSize;
        const normalizedY = (y + previewSize / 2) / previewSize;
        const projected = normalizedX * cos + normalizedY * sin;

        // Calculate blend ratio (0-1)
        const ratio = Math.max(0, Math.min(1, projected));

        // Blend colors
        return blendColors(startColor, endColor, ratio);
      } else if (type === 'radial') {
        // Radial gradient
        const centerX = 0;
        const centerY = 0;
        const maxDist = previewSize / 2;

        const dist = Math.sqrt(x * x + y * y);
        const ratio = Math.min(1, dist / maxDist);

        return blendColors(startColor, endColor, ratio);
      }

      return startColor;
    }

    if (brushType === 'patterned' && patternSettings) {
      // Simplified pattern preview - this could be enhanced
      // with actual pattern rendering if needed
      const { type, density } = patternSettings;

      // Checkerboard pattern as a simple example
      if (type === 'checker') {
        const cellX = Math.floor(x + previewSize / 2);
        const cellY = Math.floor(y + previewSize / 2);
        return (cellX + cellY) % 2 === 0 ? color : '#FFFFFF';
      }

      // Dot pattern
      if (type === 'dot') {
        const distance = Math.sqrt(x * x + y * y);
        const threshold = ((1 - density) * previewSize) / 4;
        return distance < threshold ? color : null;
      }

      // For other patterns, default to the active color
      return color;
    }

    return color;
  };

  // Helper function to generate symmetry cells for preview
  const generateSymmetryCells = (cells, mode, size) => {
    const symmetryCells = [];
    const centerX = size / 2;
    const centerY = size / 2;

    for (const cell of cells) {
      const { x, y } = cell;

      switch (mode) {
        case 'horizontal':
          symmetryCells.push({ ...cell, x: size - 1 - x });
          break;
        case 'vertical':
          symmetryCells.push({ ...cell, y: size - 1 - y });
          break;
        case 'quad':
          symmetryCells.push({ ...cell, x: size - 1 - x });
          symmetryCells.push({ ...cell, y: size - 1 - y });
          symmetryCells.push({ ...cell, x: size - 1 - x, y: size - 1 - y });
          break;
        case 'radial': {
          // 8-way radial symmetry (simplified for preview)
          const dx = x - centerX;
          const dy = y - centerY;

          for (let i = 1; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const rotatedX = Math.round(dx * cos - dy * sin + centerX);
            const rotatedY = Math.round(dx * sin + dy * cos + centerY);

            if (rotatedX >= 0 && rotatedX < size && rotatedY >= 0 && rotatedY < size) {
              symmetryCells.push({
                ...cell,
                x: rotatedX,
                y: rotatedY,
              });
            }
          }
          break;
        }
        case 'mirror':
          symmetryCells.push({
            ...cell,
            x: size - 1 - x,
            y: y,
          });

          symmetryCells.push({
            ...cell,
            x: x,
            y: size - 1 - y,
          });

          symmetryCells.push({
            ...cell,
            x: size - 1 - x,
            y: size - 1 - y,
          });
          break;
        default:
          // No symmetry transformation for unknown modes
          break;
      }
    }

    return symmetryCells;
  };

  // Helper function to blend colors
  const blendColors = (color1, color2, ratio) => {
    // Parse hex colors to RGB
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    // Blend colors
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

    // Convert back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Don't render if no brush settings or no preview cells
  if (!brushSettings || previewCells.length === 0 || !visible) {
    return null;
  }

  // Calculate preview size based on brush size
  const previewSize = brushSize * 2 * cellSize;

  return (
    <div
      ref={previewRef}
      className="brush-preview"
      style={{
        width: `${previewSize}px`,
        height: `${previewSize}px`,
      }}
    >
      {previewCells.map((cell, index) => (
        <div
          key={`${cell.x}-${cell.y}-${index}`}
          className="preview-cell"
          style={{
            left: `${cell.x * cellSize}px`,
            top: `${cell.y * cellSize}px`,
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            backgroundColor: cell.color || 'transparent',
          }}
        />
      ))}
    </div>
  );
};

// Define prop types for BrushPreview component
BrushPreview.propTypes = {
  brushSettings: PropTypes.shape({
    brushType: PropTypes.string,
    brushSize: PropTypes.number,
    brushShape: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    patternSettings: PropTypes.object,
    gradientSettings: PropTypes.object,
    symmetryMode: PropTypes.string,
  }),
  activeColor: PropTypes.string,
  gridSize: PropTypes.number,
  cursorPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  isDrawing: PropTypes.bool,
};

export default BrushPreview;
