import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';

import useBrushPreview from './hooks/useBrushPreview';
import './BrushPreview.css';

/**
 * BrushPreview Component
 * Shows a live preview of the brush shape, size, and pattern near the cursor
 */
const BrushPreview = ({
  brushSettings,
  activeColor,
  // eslint-disable-next-line no-unused-vars
  gridSize,
  cursorPosition,
  isDrawing = false,
}) => {
  const previewRef = useRef(null);
  // Use our custom hook for brush preview functionality
  const { previewCells, visible, cellSize, previewSize } = useBrushPreview({
    brushSettings,
    activeColor,
    cursorPosition,
    isDrawing,
  });

  // Position the preview near the cursor
  useEffect(() => {
    if (!previewRef.current || !cursorPosition) return;

    const { x, y } = cursorPosition;
    const previewElement = previewRef.current;
    const previewWidth = previewElement.offsetWidth;

    // Position the preview at an offset from the cursor
    // so it doesn't obscure what the user is drawing
    const offsetX = 20;
    const offsetY = 20;

    // Check if the preview would go off-screen and adjust position if needed
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let finalX = x + offsetX;
    let finalY = y + offsetY;

    if (finalX + previewWidth > windowWidth) {
      finalX = x - previewWidth - offsetX;
    }

    if (finalY + previewWidth > windowHeight) {
      finalY = y - previewWidth - offsetY;
    }

    previewElement.style.left = `${finalX}px`;
    previewElement.style.top = `${finalY}px`;
  }, [cursorPosition]);

  // Don't render if no brush settings or no preview cells
  if (!brushSettings || previewCells.length === 0 || !visible) {
    return null;
  }

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
