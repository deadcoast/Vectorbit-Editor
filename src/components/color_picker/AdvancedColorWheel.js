// src/components/color_picker/AdvancedColorWheel.js
import PropTypes from 'prop-types';
import { useRef, useEffect, useState, useContext } from 'react';

import { ColorContext } from './ColorContext';
import './ColorWheel.css';

/**
 * Draws a color wheel on a canvas context
 */
const drawColorWheel = (canvasRef, size) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 5;

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Draw color wheel
  for (let angle = 0; angle < 360; angle++) {
    const startAngle = ((angle - 1) * Math.PI) / 180;
    const endAngle = ((angle + 1) * Math.PI) / 180;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();

    // Calculate color from angle
    const hue = angle;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fill();
  }

  // Draw inner brightness/saturation square if needed
  // ...
};

/**
 * Extracts the color from a canvas at the given x,y coordinates
 */
const getColorAtPoint = (canvasRef, x, y) => {
  const canvas = canvasRef.current;
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  return `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1]
    .toString(16)
    .padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
};

/**
 * Creates position coordinates from mouse event
 */
const getEventCoordinates = (canvasRef, e) => {
  const rect = canvasRef.current.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

/**
 * Hook to manage color wheel drawing
 */
const useColorWheelDrawing = (canvasRef, size) => {
  useEffect(() => {
    drawColorWheel(canvasRef, size);
  }, [canvasRef, size]);
};

/**
 * Advanced color wheel component with canvas-based color selection
 * @param {Object} props - Component props
 * @returns {JSX.Element} - Component JSX
 */
const AdvancedColorWheel = ({ onColorSelect, size = 200 }) => {
  const { activeColor, setActiveColor } = useContext(ColorContext);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 });

  // Draw the color wheel on the canvas
  useColorWheelDrawing(canvasRef, size);

  // Handle color selection from canvas
  const handleColorSelection = (x, y) => {
    const color = getColorAtPoint(canvasRef, x, y);
    if (!color) return;

    setActiveColor(color);
    if (onColorSelect) {
      onColorSelect(color);
    }

    // Update the indicator position
    setCurrentPoint({ x, y });
  };

  // Mouse event handlers
  const handleMouseDown = e => {
    setIsDragging(true);
    const { x, y } = getEventCoordinates(canvasRef, e);
    handleColorSelection(x, y);
  };

  const handleMouseMove = e => {
    if (!isDragging) return;
    const { x, y } = getEventCoordinates(canvasRef, e);
    handleColorSelection(x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Handle color selection on keyboard interaction
      const canvas = canvasRef.current;
      if (!canvas) return;
      handleColorSelection(canvas.width / 2, canvas.height / 2);
    }
  };

  // Rendering helpers
  const renderColorIndicator = () => {
    if (currentPoint.x <= 0) return null;

    return (
      <div
        className="color-selector-indicator"
        style={{
          left: `${currentPoint.x}px`,
          top: `${currentPoint.y}px`,
          backgroundColor: activeColor,
          border: '2px solid white',
          borderRadius: '50%',
          width: '10px',
          height: '10px',
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    );
  };

  return (
    <div className="advanced-color-wheel">
      <canvas
        ref={canvasRef}
        aria-label="Color wheel selector"
        className="color-wheel-canvas"
        height={size}
        role="img"
        tabIndex={0}
        width={size}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {renderColorIndicator()}
      <div className="selected-color-preview" style={{ backgroundColor: activeColor }}>
        <span>{activeColor}</span>
      </div>
    </div>
  );
};

AdvancedColorWheel.propTypes = {
  onColorSelect: PropTypes.func,
  size: PropTypes.number,
};

AdvancedColorWheel.defaultProps = {
  onColorSelect: () => {},
  size: 200,
};

export default AdvancedColorWheel;
