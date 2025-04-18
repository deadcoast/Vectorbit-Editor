import PropTypes from 'prop-types';

import './Controls.css';
import {
  handleNewFile,
  handleOpenFile,
  handleSaveFile,
  exportFile,
} from '../../utils/fileHandlers';

/**
 * Renders the file menu dropdown
 */
const FileMenu = ({ exportFormat, resetState, setState, state }) => (
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
);

/**
 * Renders the settings menu dropdown
 */
const SettingsMenu = ({ setGridSize, toggleGrid, gridOverlay }) => (
  <div className="menu">
    <span>Settings</span>
    <div className="dropdown">
      {[8, 16, 32, 64, 128].map(size => (
        <button key={size} title={`Set grid to ${size}x${size}`} onClick={() => setGridSize(size)}>
          Grid: {size}x{size}
        </button>
      ))}
      <button title="Toggle grid visibility" onClick={toggleGrid}>
        {gridOverlay ? 'Hide Grid' : 'Show Grid'}
      </button>
    </div>
  </div>
);

/**
 * Renders the export format menu dropdown
 */
const ExportMenu = ({ exportFormat, setExportFormat, saveDefaultExportFormat }) => (
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
);

/**
 * Renders the toolbar with drawing tools and color selection
 */
const ToolbarControls = ({ availableTools, setActiveTool, state, setActiveColor }) => (
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
);

/**
 * Main Controls component that combines all menus and toolbars
 * @param {Object} props - Component props
 */
const Controls = ({
  toggleGrid,
  setGridSize,
  setActiveTool,
  setActiveColor,
  resetState,
  setState,
  state,
  gridOverlay,
  // eslint-disable-next-line no-unused-vars
  setGridOverlay, // This prop is currently unused but kept for future functionality
  availableTools,
  exportFormat,
  setExportFormat,
  saveDefaultExportFormat,
}) => {
  return (
    <div className="controls">
      {/* Menu Bar */}
      <div className="menu-bar">
        <FileMenu
          exportFormat={exportFormat}
          resetState={resetState}
          setState={setState}
          state={state}
        />
        <SettingsMenu gridOverlay={gridOverlay} setGridSize={setGridSize} toggleGrid={toggleGrid} />
        <ExportMenu
          exportFormat={exportFormat}
          saveDefaultExportFormat={saveDefaultExportFormat}
          setExportFormat={setExportFormat}
        />
      </div>

      {/* Toolbar */}
      <ToolbarControls
        availableTools={availableTools}
        setActiveColor={setActiveColor}
        setActiveTool={setActiveTool}
        state={state}
      />
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

// PropTypes for the sub-components
FileMenu.propTypes = {
  exportFormat: PropTypes.shape({
    toUpperCase: PropTypes.func.isRequired,
  }).isRequired,
  resetState: PropTypes.func.isRequired,
  setState: PropTypes.func.isRequired,
  state: PropTypes.shape({
    activeColor: PropTypes.string.isRequired,
    canvasRef: PropTypes.shape({
      current: PropTypes.object,
    }),
  }).isRequired,
};

SettingsMenu.propTypes = {
  gridOverlay: PropTypes.bool.isRequired,
  setGridSize: PropTypes.func.isRequired,
  toggleGrid: PropTypes.func.isRequired,
};

ExportMenu.propTypes = {
  exportFormat: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      toUpperCase: PropTypes.func.isRequired,
    }),
  ]).isRequired,
  saveDefaultExportFormat: PropTypes.func.isRequired,
  setExportFormat: PropTypes.func.isRequired,
};

ToolbarControls.propTypes = {
  availableTools: PropTypes.arrayOf(PropTypes.string).isRequired,
  setActiveColor: PropTypes.func.isRequired,
  setActiveTool: PropTypes.func.isRequired,
  state: PropTypes.shape({
    activeColor: PropTypes.string.isRequired,
  }).isRequired,
};

export default Controls;
