// src/components/color_picker/AdvancedColorWheel.js
import PropTypes from 'prop-types';
import { useRef, useEffect, useState, useContext } from 'react';

import { ColorContext } from './ColorContext';
import './ColorWheel.css';

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
  useEffect(() => {
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
  }, [size]);

  // Handle color selection from canvas
  const handleColorSelection = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const color = `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;

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
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleColorSelection(x, y);
  };

  const handleMouseMove = e => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleColorSelection(x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Handle color selection on keyboard interaction
      // This could be refined for better keyboard navigation
      const canvas = canvasRef.current;
      if (!canvas) return;
      handleColorSelection(canvas.width / 2, canvas.height / 2);
    }
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
      {/* Color selection indicator */}
      {currentPoint.x > 0 && (
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
      )}
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
