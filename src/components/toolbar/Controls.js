import PropTypes from 'prop-types';

import './Controls.css';
import {
  handleNewFile,
  handleOpenFile,
  handleSaveFile,
  exportFile,
} from '../../utils/fileHandlers';

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
            <button title="Create a new file" onClick={() => handleNewFile(resetState)}>
              New
            </button>
            <button title="Open an existing file" onClick={() => handleOpenFile(setState)}>
              Open
            </button>
            <button title="Save the current file" onClick={() => handleSaveFile(state)}>
              Save
            </button>
            <button
              title={`Export file as ${exportFormat.toUpperCase()}`}
              onClick={() => exportFile(state.canvasRef.current, state, exportFormat)}
            >
              Export
            </button>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="menu">
          <span>Settings</span>
          <div className="dropdown">
            {[8, 16, 32, 64, 128].map(size => (
              <button
                key={size}
                title={`Set grid to ${size}x${size}`}
                onClick={() => setGridSize(size)}
              >
                Grid: {size}x{size}
              </button>
            ))}
            <button title="Toggle grid visibility" onClick={toggleGrid}>
              {gridOverlay ? 'Hide Grid' : 'Show Grid'}
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
                title="Select export format"
                value={exportFormat}
                onChange={e => setExportFormat(e.target.value)}
              >
                <option value="svg">SVG</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </label>
            <button title="Save as default export format" onClick={saveDefaultExportFormat}>
              Save Format
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        {availableTools.map(tool => (
          <button
            key={tool}
            title={`Select ${tool.charAt(0).toUpperCase() + tool.slice(1)} Tool`}
            onClick={() => setActiveTool(tool)}
          >
            {tool.charAt(0).toUpperCase() + tool.slice(1)}
          </button>
        ))}
        <label title="Select a color">
          Color:
          <input
            type="color"
            value={state.activeColor}
            onChange={e => setActiveColor(e.target.value)}
          />
        </label>
      </div>
    </div>
  );
};

Controls.propTypes = {
  availableTools: PropTypes.arrayOf(PropTypes.string).isRequired,
  exportFormat: PropTypes.shape({
    toUpperCase: PropTypes.func.isRequired,
  }).isRequired,
  gridOverlay: PropTypes.bool.isRequired,
  resetState: PropTypes.func.isRequired,
  saveDefaultExportFormat: PropTypes.func.isRequired,
  setActiveColor: PropTypes.func.isRequired,
  setActiveTool: PropTypes.func.isRequired,
  setExportFormat: PropTypes.func.isRequired,
  setGridOverlay: PropTypes.func.isRequired,
  setGridSize: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
  state: PropTypes.shape({
    activeColor: PropTypes.string.isRequired,
    canvasRef: PropTypes.shape({
      current: PropTypes.object,
    }),
  }).isRequired,
  toggleGrid: PropTypes.func.isRequired,
};

export default Controls;
