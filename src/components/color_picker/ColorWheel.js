
// File: src/components/ColorPicker/ColorWheel.js
import React, { useContext, useState, useCallback, useRef, useMemo } from "react";
import { SketchPicker } from "react-color";
import debounce from "lodash.debounce";
import { ColorContext } from "../state/ColorContext";
import "./ColorWheel.css";

const ColorWheel = ({ onAddToPalette, onAssignToAnchor, allowDynamicSelection = false }) => {
  const { activeColor, setActiveColor, recentColors, addToRecentColors } = useContext(ColorContext);
  const [showAdvancedPicker, setShowAdvancedPicker] = useState(false);
  const [gradientStops, setGradientStops] = useState([0, 100]); // Positions for gradient stops
  const gradientPreviewRef = useRef(null);
  const [gradientHistory, setGradientHistory] = useState([]);
  const [gradientIndex, setGradientIndex] = useState(-1);

  // Debounced color change handler for smoother UI
  const debouncedColorChange = useCallback(
    debounce((color) => setActiveColor(color), 300),
    []
  );

  const handleColorChange = (color) => {
    const hexColor = color.hex || color;
    setActiveColor(hexColor);
    addToRecentColors(hexColor);
  };

  // Handle dragging gradient stops
  const snapToGrid = (value, step = 5) => Math.round(value / step) * step;

  const handleGradientDrag = (index, event) => {
    const rect = gradientPreviewRef.current.getBoundingClientRect();
    const percentage = snapToGrid(((event.clientX - rect.left) / rect.width) * 100);
    setGradientStops((stops) =>
      stops.map((stop, i) => (i === index ? Math.min(Math.max(percentage, 0), 100) : stop))
    );
  };

  // Add or remove gradient stops
  const addGradientStop = () => {
    setGradientStops([...gradientStops, 50]); // Add a stop at the center
  };

  const removeGradientStop = (index) => {
    setGradientStops((stops) => stops.filter((_, i) => i !== index));
  };

  // Gradient history management
  const addGradientToHistory = (gradient) => {
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
    "linear-gradient(to right, #ff7e5f, #feb47b)",
    "linear-gradient(to right, #6a11cb, #2575fc)",
  ];

  const applyGradientPreset = (preset) => {
    const stops = [0, 100]; // Example, based on preset
    setGradientStops(stops);
  };

  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops
      .map((stop) => `${activeColor} ${stop}%`)
      .join(", ")})`,
  };

  const renderedRecentColors = useMemo(
    () =>
      recentColors.map((color, index) => (
        <div
          key={index}
          className="recent-color"
          style={{ backgroundColor: color }}
          onClick={() => handleColorChange({ hex: color })}
          title={color}
        ></div>
      )),
    [recentColors]
  );

  return (
    <div className="color-wheel">
      {/* Current Color Preview */}
      <div className="color-preview" title="Current selected color">
        <span style={{ backgroundColor: activeColor }}></span>
        <span>{activeColor}</span>
      </div>

      {/* Color Picker */}
      <div className="color-picker-container">
        {showAdvancedPicker ? (
          <SketchPicker
            color={activeColor}
            onChangeComplete={handleColorChange}
            title="Advanced Color Picker"
          />
        ) : (
          <input
            type="color"
            value={activeColor}
            onChange={(e) => handleColorChange({ hex: e.target.value })}
            title="Basic Color Picker"
          />
        )}
        <button onClick={togglePicker} title="Toggle Picker">
          {showAdvancedPicker ? "Basic Picker" : "Advanced Picker"}
        </button>
      </div>

      {/* Gradient Editor */}
      <div className="gradient-generator">
        <h4>Gradient Editor</h4>
        <div className="gradient-preview" ref={gradientPreviewRef} style={gradientStyle}>
          {gradientStops.map((stop, index) => (
            <div
              key={index}
              className="gradient-stop"
              style={{ left: `${stop}%` }}
              onMouseDown={(e) => {
                const onMouseMove = (ev) => handleGradientDrag(index, ev);
                const onMouseUp = () => {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                };
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
              }}
            ></div>
          ))}
        </div>
        <button onClick={addGradientStop} title="Add Gradient Stop">
          Add Stop
        </button>
        <button onClick={removeGradientStop} title="Remove Gradient Stop">
          Remove Stop
        </button>
        <button onClick={undoGradient} title="Undo Gradient">
          Undo
        </button>
        <button onClick={redoGradient} title="Redo Gradient">
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
        <button onClick={handleAddToPalette} title="Add current color to palette">
          Add to Palette
        </button>
        <button onClick={handleAssignToAnchor} title="Assign current color to an anchor">
          Assign to Anchor
        </button>
      </div>
    </div>
  );
};

export default React.memo(ColorWheel);
