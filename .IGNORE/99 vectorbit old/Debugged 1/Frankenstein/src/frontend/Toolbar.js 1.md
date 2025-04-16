
import React, { useState } from "react";
import "./Toolbar.css";

const Toolbar = ({
  setActiveTool,
  setActiveColor,
  brushSize,
  setBrushSize,
  saveProject,
  loadProject,
  exportToImage,
  defaultFormat,
  setDefaultFormat,
  saveDefaultFormat,
  handleGridResize,
  exportToSVG,
  exportToPNG,
  exportToJPG,
  undo,
  redo,
  opacity,
  setOpacity,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [brushType, setBrushType] = useState("filled");

  return (
    <div className="toolbar">
      {/* Tool Buttons */}
      <div className="tool-buttons">
        <button onClick={() => setActiveTool("brush")}>Brush</button>
        <button onClick={() => setActiveTool("eraser")}>Eraser</button>
        <button onClick={() => setActiveTool("bucket")}>Bucket Fill</button>
        <button onClick={() => setActiveTool("rectangle")}>Rectangle</button>
        <button onClick={() => setActiveTool("ellipse")}>Ellipse</button>
        <button onClick={() => setActiveTool("freehand")}>Freehand</button>
      </div>

      {/* Brush Type */}
      <div className="brush-type">
        <label>Brush Type:</label>
        <select value={brushType} onChange={(e) => setBrushType(e.target.value)}>
          <option value="filled">Filled</option>
          <option value="outline">Outline</option>
          <option value="patterned">Patterned</option>
        </select>
      </div>

      {/* Color Picker */}
      <div className="color-picker">
        <label htmlFor="colorPicker">Color:</label>
        <input
          id="colorPicker"
          type="color"
          onChange={(e) => setActiveColor(e.target.value)}
          title="Color Picker"
        />
      </div>

      {/* Brush Size */}
      <div className="brush-size">
        <label>Brush Size:</label>
        <input
          type="number"
          value={brushSize}
          min="1"
          max="10"
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
        />
      </div>

      {/* Opacity Control */}
      <div className="opacity-control">
        <label>Opacity:</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
        />
      </div>

      {/* Undo/Redo */}
      <div className="history-controls">
        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
      </div>

      {/* Project Management */}
      <div className="project-management">
        <button onClick={saveProject}>Save Project</button>
        <input
          type="file"
          onChange={loadProject}
          title="Load Project"
          style={{ display: "inline" }}
        />
      </div>

      {/* Export Options */}
      <div className="export-options">
        <button onClick={exportToSVG}>Export to SVG</button>
        <button onClick={exportToPNG}>Export to PNG</button>
        <button onClick={exportToJPG}>Export to JPG</button>
      </div>

      {/* Default Export Format */}
      <div className="settings">
        <h3>Default Export Format</h3>
        <select
          value={defaultFormat}
          onChange={(e) => setDefaultFormat(e.target.value)}
        >
          <option value="svg">SVG</option>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
        </select>
        <button onClick={saveDefaultFormat}>Save Format</button>
      </div>

      {/* Grid Settings */}
      <div className="menu">
        <span
          onClick={() => setDropdownVisible(!dropdownVisible)}
          className="menu-toggle"
        >
          Grid Settings
        </span>
        {dropdownVisible && (
          <div className="dropdown">
            <button onClick={() => handleGridResize(8)}>8x8</button>
            <button onClick={() => handleGridResize(16)}>16x16</button>
            <button onClick={() => handleGridResize(32)}>32x32</button>
            <button onClick={() => handleGridResize(64)}>64x64</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
