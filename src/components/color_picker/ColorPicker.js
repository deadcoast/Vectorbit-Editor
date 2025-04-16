
// File: src/components/ColorPicker/ColorPicker.js
import React, { useContext, useState, useRef } from "react";
import { SketchPicker } from "react-color";
import { ColorContext } from "../state/ColorContext";
import "./ColorPicker.css";

const ColorPicker = ({ onAddToPalette, onAssignToAnchor, gridRef }) => {
  const { activeColor, setActiveColor, recentColors, addToRecentColors } = useContext(ColorContext);
  const [gradientStops, setGradientStops] = useState([0, 100]); // Gradient stop positions
  const [savedPalettes, setSavedPalettes] = useState({}); // Store saved palettes
  const [paletteName, setPaletteName] = useState(""); // Name for saved palettes
  const gradientPreviewRef = useRef(null);
  const [gradientStart, setGradientStart] = useState("#ffffff");
  const [gradientEnd, setGradientEnd] = useState("#000000");
  const [eyeDropperActive, setEyeDropperActive] = useState(false);

  // Add a new recent color
  const addRecentColor = (color) => {
    if (!recentColors.includes(color)) {
      addToRecentColors(color);
    }
  };

  // Handle color change
  const handleColorChange = (color) => {
    const hexColor = color.hex || color;
    setActiveColor(hexColor);
    addRecentColor(hexColor);
  };

  // Toggle Eye Dropper Tool
  const handleEyeDropperToggle = () => {
    setEyeDropperActive(!eyeDropperActive);
  };

  // Handle Eye Dropper Activation
  const handleEyeDropper = (event) => {
    if (!gridRef?.current) {
      return;
    }
    const canvas = gridRef.current.querySelector("canvas");
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    const x = Math.floor(event.clientX - rect.left);
    const y = Math.floor(event.clientY - rect.top);
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const rgbaColor = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
    handleColorChange({ hex: rgbaColor });
  };

  // Save Gradient
  const handleGradientSave = () => {
    const gradient = `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`;
    onAddToPalette(gradient);
  };

  // Drag Gradient Stops
  const handleGradientDrag = (index, event) => {
    const preview = gradientPreviewRef.current;
    const rect = preview.getBoundingClientRect();
    const percentage = ((event.clientX - rect.left) / rect.width) * 100;
    setGradientStops((stops) =>
      stops.map((stop, i) => (i === index ? Math.min(Math.max(percentage, 0), 100) : stop))
    );
  };

  // Save Current Palette
  const handleSavePalette = () => {
    if (paletteName.trim() && !savedPalettes[paletteName]) {
      setSavedPalettes({
        ...savedPalettes,
        [paletteName]: [...recentColors],
      });
      setPaletteName(""); // Reset input
    } else {
      alert("Palette name is invalid or already exists.");
    }
  };

  // Load Saved Palette
  const handleLoadPalette = (name) => {
    const palette = savedPalettes[name];
    if (palette) {
      palette.forEach((color) => addToRecentColors(color));
    }
  };

  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops
      .map((stop) => `${activeColor} ${stop}%`)
      .join(", ")})`,
  };

  return (
    <div className="color-picker">
      <SketchPicker color={activeColor} onChangeComplete={handleColorChange} />
      <div className="gradient-generator">
        <h4>Gradient Generator</h4>
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
        <input
          type="color"
          value={gradientStart}
          onChange={(e) => setGradientStart(e.target.value)}
          title="Set gradient start color"
        />
        <input
          type="color"
          value={gradientEnd}
          onChange={(e) => setGradientEnd(e.target.value)}
          title="Set gradient end color"
        />
        <button onClick={handleGradientSave} title="Save Gradient">
          Save Gradient
        </button>
      </div>
      <div className="color-history">
        <h4>Recent Colors</h4>
        <div className="color-history-grid">
          {recentColors.map((color, index) => (
            <div
              key={index}
              className="color-history-item"
              style={{ backgroundColor: color }}
              onClick={() => handleColorChange({ hex: color })}
              data-hex={color}
              title={color}
            ></div>
          ))}
        </div>
      </div>
      <div className="palette-management">
        <input
          type="text"
          value={paletteName}
          onChange={(e) => setPaletteName(e.target.value)}
          placeholder="Enter palette name"
          title="Save palette with a name"
        />
        <button onClick={handleSavePalette} title="Save current palette">
          Save Palette
        </button>
        <select onChange={(e) => handleLoadPalette(e.target.value)} title="Load a saved palette">
          <option value="">Load Palette</option>
          {Object.keys(savedPalettes).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      {gridRef && (
        <button
          className="eyedropper-button"
          onMouseDown={handleEyeDropper}
          title="Activate Eye Dropper Tool"
        >
          Eye Dropper
        </button>
      )}
      <button onClick={handleEyeDropperToggle}>
        {eyeDropperActive ? "Deactivate Eye Dropper" : "Activate Eye Dropper"}
      </button>
      <div className="actions">
        <button onClick={() => onAddToPalette(activeColor)} title="Add current color to palette">
          Add to Palette
        </button>
        <button onClick={() => onAssignToAnchor(activeColor)} title="Assign current color to an anchor">
          Assign to Anchor
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
