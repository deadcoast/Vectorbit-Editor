// File: src/components/ColorPicker/ColorWheel.js
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import React, { useContext, useState, useCallback, useRef, useMemo } from 'react';
import { SketchPicker } from 'react-color';

import { ColorContext } from './ColorContext';
import './ColorWheel.css';

const ColorWheel = ({ onAddToPalette, onAssignToAnchor, allowDynamicSelection = false }) => {
  const { activeColor, setActiveColor, recentColors, addToRecentColors } = useContext(ColorContext);
  const [showAdvancedPicker, setShowAdvancedPicker] = useState(false);
  const [gradientStops, setGradientStops] = useState([0, 100]); // Positions for gradient stops
  const gradientPreviewRef = useRef(null);
  const [gradientHistory, setGradientHistory] = useState([]);
  const [gradientIndex, setGradientIndex] = useState(-1);

  // Debounced color change handler for smoother UI
  const debouncedColorChange = useCallback(
    debounce(color => setActiveColor(color), 300),
    []
  );

  const handleColorChange = color => {
    const hexColor = color.hex || color;
    setActiveColor(hexColor);
    addToRecentColors(hexColor);
  };

  // Handle dragging gradient stops
  const snapToGrid = (value, step = 5) => Math.round(value / step) * step;

  const handleGradientDrag = (index, event) => {
    const rect = gradientPreviewRef.current.getBoundingClientRect();
    const percentage = snapToGrid(((event.clientX - rect.left) / rect.width) * 100);
    setGradientStops(stops =>
      stops.map((stop, i) => (i === index ? Math.min(Math.max(percentage, 0), 100) : stop))
    );
  };

  // Add or remove gradient stops
  const addGradientStop = () => {
    setGradientStops([...gradientStops, 50]); // Add a stop at the center
  };

  const removeGradientStop = index => {
    setGradientStops(stops => stops.filter((_, i) => i !== index));
  };

  // Gradient history management
  const addGradientToHistory = gradient => {
    const newHistory = [...gradientHistory.slice(0, gradientIndex + 1), gradient];
    setGradientHistory(newHistory);
    setGradientIndex(newHistory.length - 1);
  };

  const undoGradient = () => {
    if (gradientIndex > 0) {
      setGradientIndex(gradientIndex - 1);
      const previousGradient = gradientHistory[gradientIndex - 1];
      setGradientStops(previousGradient || [0, 100]);
    }
  };

  const redoGradient = () => {
    if (gradientIndex < gradientHistory.length - 1) {
      setGradientIndex(gradientIndex + 1);
      const nextGradient = gradientHistory[gradientIndex + 1];
      setGradientStops(nextGradient || [0, 100]);
    }
  };

  // Handle toggling the color picker type
  const togglePicker = () => {
    setShowAdvancedPicker(!showAdvancedPicker);
  };

  // Apply gradient preset
  const gradientPresets = [
    'linear-gradient(to right, #ff7e5f, #feb47b)',
    'linear-gradient(to right, #6a11cb, #2575fc)',
  ];

  const applyGradientPreset = preset => {
    const stops = [0, 100]; // Example, based on preset
    setGradientStops(stops);
  };

  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops
      .map(stop => `${activeColor} ${stop}%`)
      .join(', ')})`,
  };

  const renderedRecentColors = useMemo(
    () =>
      recentColors.map((color, index) => (
        <div
          key={index}
          aria-label={`Select color ${color}`}
          className="recent-color"
          role="button"
          style={{ backgroundColor: color }}
          tabIndex={0}
          title={color}
          onClick={() => handleColorChange({ hex: color })}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleColorChange({ hex: color });
            }
          }}
        />
      )),
    [recentColors]
  );

  return (
    <div className="color-wheel">
      {/* Current Color Preview */}
      <div className="color-preview" title="Current selected color">
        <span style={{ backgroundColor: activeColor }} />
        <span>{activeColor}</span>
      </div>

      {/* Color Picker */}
      <div className="color-picker-container">
        {showAdvancedPicker ? (
          <SketchPicker
            color={activeColor}
            title="Advanced Color Picker"
            onChangeComplete={handleColorChange}
          />
        ) : (
          <input
            title="Basic Color Picker"
            type="color"
            value={activeColor}
            onChange={e => handleColorChange({ hex: e.target.value })}
          />
        )}
        <button title="Toggle Picker" onClick={togglePicker}>
          {showAdvancedPicker ? 'Basic Picker' : 'Advanced Picker'}
        </button>
      </div>

      {/* Gradient Editor */}
      <div className="gradient-generator">
        <h4>Gradient Editor</h4>
        <div ref={gradientPreviewRef} className="gradient-preview" style={gradientStyle}>
          {gradientStops.map((stop, index) => (
            <div
              key={index}
              aria-label={`Gradient stop at ${stop}%`}
              aria-valuemax="100"
              aria-valuemin="0"
              aria-valuenow={stop}
              className="gradient-stop"
              role="slider"
              style={{ left: `${stop}%` }}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'ArrowLeft') {
                  const newValue = Math.max(0, stop - 5);
                  setGradientStops(stops => stops.map((s, i) => (i === index ? newValue : s)));
                } else if (e.key === 'ArrowRight') {
                  const newValue = Math.min(100, stop + 5);
                  setGradientStops(stops => stops.map((s, i) => (i === index ? newValue : s)));
                }
              }}
              onMouseDown={e => {
                const onMouseMove = ev => handleGradientDrag(index, ev);
                const onMouseUp = () => {
                  window.removeEventListener('mousemove', onMouseMove);
                  window.removeEventListener('mouseup', onMouseUp);
                };
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
              }}
            />
          ))}
        </div>
        <button title="Add Gradient Stop" onClick={addGradientStop}>
          Add Stop
        </button>
        <button title="Remove Gradient Stop" onClick={removeGradientStop}>
          Remove Stop
        </button>
        <button title="Undo Gradient" onClick={undoGradient}>
          Undo
        </button>
        <button title="Redo Gradient" onClick={redoGradient}>
          Redo
        </button>
      </div>

      {/* Recent Colors */}
      <div className="recent-colors">
        <h4 title="Recently used colors">Recent Colors</h4>
        <div className="recent-colors-grid">{renderedRecentColors}</div>
      </div>

      {/* Actions */}
      <div className="actions">
        <button title="Add current color to palette" onClick={() => onAddToPalette(activeColor)}>
          Add to Palette
        </button>
        <button
          title="Assign current color to an anchor"
          onClick={() => onAssignToAnchor(activeColor)}
        >
          Assign to Anchor
        </button>
      </div>
    </div>
  );
};

ColorWheel.propTypes = {
  allowDynamicSelection: PropTypes.bool,
  onAddToPalette: PropTypes.func.isRequired,
  onAssignToAnchor: PropTypes.func.isRequired,
};

ColorWheel.defaultProps = {
  allowDynamicSelection: false,
};

export default React.memo(ColorWheel);
