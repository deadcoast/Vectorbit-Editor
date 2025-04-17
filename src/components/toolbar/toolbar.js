// src/components/Toolbar/Toolbar.js
import React, { useState, useRef } from "react";
import "./toolbar.css";
import { exportToSVG, exportToPNG } from "../../utils/api/exportManager";
import ColorWheel from "../color_picker/ColorWheel";

const Toolbar = ({
  gridSize,
  cellColors,
  setCellColors,
  activeColor,
  setActiveColor,
  onAddToPalette,
  onAssignToAnchor,
  setActiveTool,
  brushSize,
  setBrushSize,
  saveProject,
  loadProject,
  handleGridResize,
  defaultFormat,
  setDefaultFormat,
  saveDefaultFormat,
  gridRef,
  openGradientEditor,
  openColorAnchors,
  activateEyeDropper,
  openPaletteManager,
}) => {
  const [brushType, setBrushType] = useState("filled");
  const [showAdvanced, setShowAdvanced] = useState(false); // Toggle for advanced tools
  const canvasRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState("");

  const handleToolSelect = (tool) => {
    setActiveTool(tool);
    setActiveFeature(tool);
  };

  const handleExportSVG = () => {
    const svgContent = exportToSVG(gridSize, cellColors);
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grid-art.svg";
    a.click();
  };

  const handleExportPNG = () => {
    const dataURL = exportToPNG(gridSize, cellColors, canvasRef);
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "grid-art.png";
    a.click();
  };

  return (
    <div className="toolbar">
      <h3>Toolbar</h3>

      {/* Tool Buttons */}
      <div className="tool-buttons">
        {["brush", "eraser", "bucket", "rectangle", "ellipse", "freehand"].map(
          (tool) => (
            <button
              key={tool}
              className={activeFeature === tool ? "active" : ""}
              onClick={() => handleToolSelect(tool)}
            >
              {tool.charAt(0).toUpperCase() + tool.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Advanced Tools Toggle */}
      <button
        className="advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? "Hide Advanced Tools" : "Show Advanced Tools"}
      </button>

      {showAdvanced && (
        <div className="advanced-tools">
          <button
            className={activeFeature === "Gradient Editor" ? "active" : ""}
            onClick={() => {
              openGradientEditor();
              setActiveFeature("Gradient Editor");
            }}
          >
            Gradient Editor
          </button>
          <button
            className={activeFeature === "Color Anchors" ? "active" : ""}
            onClick={() => {
              openColorAnchors();
              setActiveFeature("Color Anchors");
            }}
          >
            Color Anchors
          </button>
          <button
            className={activeFeature === "Eye Dropper" ? "active" : ""}
            onClick={() => {
              activateEyeDropper();
              setActiveFeature("Eye Dropper");
            }}
          >
            Eye Dropper
          </button>
          <button
            className={activeFeature === "Palette Manager" ? "active" : ""}
            onClick={() => {
              openPaletteManager();
              setActiveFeature("Palette Manager");
            }}
          >
            Palette Manager
          </button>
        </div>
      )}

      {/* Color Picker */}
      <div className="color-wheel-container">
        <ColorWheel
          activeColor={activeColor}
          setActiveColor={setActiveColor}
          onAddToPalette={onAddToPalette}
          onAssignToAnchor={onAssignToAnchor}
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
          onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
        />
      </div>

      {/* Brush Type */}
      <div className="brush-type">
        <label>Brush Type:</label>
        <select
          onChange={(e) => setBrushType(e.target.value)}
          value={brushType}
        >
          <option value="filled">Filled</option>
          <option value="outline">Outline</option>
          <option value="patterned">Patterned</option>
        </select>
      </div>

      {/* Project Management */}
      <div className="project-management">
        <button onClick={saveProject}>Save Project</button>
        <input type="file" onChange={loadProject} title="Load Project" />
      </div>

      {/* Export Options */}
      <div className="export-options">
        <button onClick={handleExportSVG}>Export to SVG</button>
        <button onClick={handleExportPNG}>Export to PNG</button>
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Grid Resize */}
      <div className="grid-resize">
        <h3>Grid Resize</h3>
        {[8, 16, 32, 64].map((size) => (
          <button key={size} onClick={() => handleGridResize(size)}>
            {`${size}x${size}`}
          </button>
        ))}
      </div>

      {/* Default Export Format */}
      <div className="export-settings">
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
    </div>
  );
};

export default Toolbar;
