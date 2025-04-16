import React from "react";
import "./Controls.css";
import {
  handleNewFile,
  handleOpenFile,
  handleSaveFile,
  exportFile,
} from "../../utils/fileHandlers";

const Controls = ({
  toggleGrid,
  setGridSize,
  setActiveTool,
  setActiveColor,
  resetState,
  setState,
  state,
  gridOverlay,
  setGridOverlay,
  availableTools,
  exportFormat,
  setExportFormat,
  saveDefaultExportFormat,
}) => {
  return (
    <div className="controls">
      {/* Menu Bar */}
      <div className="menu-bar">
        {/* File Menu */}
        <div className="menu">
          <span>File</span>
          <div className="dropdown">
            <button onClick={() => handleNewFile(resetState)} title="Create a new file">
              New
            </button>
            <button onClick={() => handleOpenFile(setState)} title="Open an existing file">
              Open
            </button>
            <button onClick={() => handleSaveFile(state)} title="Save the current file">
              Save
            </button>
            <button
              onClick={() => exportFile(state.canvasRef.current, state, exportFormat)}
              title={`Export file as ${exportFormat.toUpperCase()}`}
            >
              Export
            </button>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="menu">
          <span>Settings</span>
          <div className="dropdown">
            {[8, 16, 32, 64, 128].map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                title={`Set grid to ${size}x${size}`}
              >
                Grid: {size}x{size}
              </button>
            ))}
            <button onClick={toggleGrid} title="Toggle grid visibility">
              {gridOverlay ? "Hide Grid" : "Show Grid"}
            </button>
          </div>
        </div>

        {/* Export Format Menu */}
        <div className="menu">
          <span>Export</span>
          <div className="dropdown">
            <label>
              Format:
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                title="Select export format"
              >
                <option value="svg">SVG</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </label>
            <button onClick={saveDefaultExportFormat} title="Save as default export format">
              Save Format
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        {availableTools.map((tool) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            title={`Select ${tool.charAt(0).toUpperCase() + tool.slice(1)} Tool`}
          >
            {tool.charAt(0).toUpperCase() + tool.slice(1)}
          </button>
        ))}
        <label title="Select a color">
          Color:
          <input
            type="color"
            onChange={(e) => setActiveColor(e.target.value)}
            value={state.activeColor}
          />
        </label>
      </div>
    </div>
  );
};

export default Controls;
