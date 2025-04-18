import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

import { exportLayersToSVG } from '../../utils/api/svgExportUtility';
import './ExportPanel.css';

// Format selector component - extracted to improve readability
const FormatSelector = ({ exportFormat, onFormatChange }) => (
  <div className="export-format">
    <label>
      Export Format:
      <select value={exportFormat} onChange={onFormatChange}>
        <option value="svg">SVG (Vector)</option>
        <option value="png">PNG (Raster)</option>
        <option value="json">JSON (Project File)</option>
        <option value="all">All Formats</option>
      </select>
    </label>
  </div>
);

FormatSelector.propTypes = {
  exportFormat: PropTypes.string.isRequired,
  onFormatChange: PropTypes.func.isRequired,
};

// Export action button component - extracted to improve readability
const ExportActions = ({ exportStatus, onExport }) => {
  const isExporting = exportStatus.includes('Exporting...');
  const buttonText = exportStatus || 'Export Now';

  return (
    <div className="export-actions">
      <h4>Export Action</h4>
      <button className="export-button" disabled={isExporting} onClick={onExport}>
        {buttonText}
      </button>
    </div>
  );
};

ExportActions.propTypes = {
  exportStatus: PropTypes.string.isRequired,
  onExport: PropTypes.func.isRequired,
};

// SVG Options component for selecting SVG-specific export options
const SvgOptionsPanel = ({ svgOptions, updateOptions }) => {
  const handleWidthChange = e => {
    updateOptions({
      ...svgOptions,
      width: parseInt(e.target.value, 10) || 1,
    });
  };

  const handleHeightChange = e => {
    updateOptions({
      ...svgOptions,
      height: parseInt(e.target.value, 10) || 1,
    });
  };

  const handleBackgroundChange = e => {
    updateOptions({
      ...svgOptions,
      background: e.target.value,
    });
  };

  const handleLayerNamesChange = e => {
    updateOptions({
      ...svgOptions,
      includeLayerNames: e.target.checked,
    });
  };

  const handleOptimizeRectanglesChange = e => {
    updateOptions({
      ...svgOptions,
      optimizeRectangles: e.target.checked,
    });
  };

  return (
    <div className="svg-options">
      <h4>SVG Options</h4>

      <div className="option-group">
        <label>
          Width (px):
          <input min="1" type="number" value={svgOptions.width} onChange={handleWidthChange} />
        </label>

        <label>
          Height (px):
          <input min="1" type="number" value={svgOptions.height} onChange={handleHeightChange} />
        </label>
      </div>

      <div className="option-group">
        <label>
          Background:
          <input type="color" value={svgOptions.background} onChange={handleBackgroundChange} />
        </label>
      </div>

      <div className="option-group">
        <label>
          <input
            checked={svgOptions.includeLayerNames}
            type="checkbox"
            onChange={handleLayerNamesChange}
          />
          Include Layer Names
        </label>

        <label>
          <input
            checked={svgOptions.optimizeRectangles}
            type="checkbox"
            onChange={handleOptimizeRectanglesChange}
          />
          Optimize Rectangles
        </label>
      </div>
    </div>
  );
};

// Define prop types for SvgOptionsPanel
SvgOptionsPanel.propTypes = {
  svgOptions: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    background: PropTypes.string.isRequired,
    includeLayerNames: PropTypes.bool.isRequired,
    optimizeRectangles: PropTypes.bool.isRequired,
  }).isRequired,
  updateOptions: PropTypes.func.isRequired,
};

// Default SVG options
const DEFAULT_SVG_OPTIONS = {
  width: 1024,
  height: 1024,
  background: '#FFFFFF',
  includeLayerNames: true,
  optimizeRectangles: true,
};

/**
 * Creates a downloadable file from content with the given filename and type
 * @param {string} content - Content to download
 * @param {string} filename - Name for the download file
 * @param {string} contentType - MIME type of the content
 */
const downloadContent = (content, filename, contentType = 'application/octet-stream') => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Flattens all visible layers into a single cell colors array
 * @param {number} gridSize - Size of the grid
 * @param {Array} layers - All available layers
 * @returns {Array} - Flattened cell colors
 */
const getFlattenedCellColors = (gridSize, layers) => {
  const cellColors = Array(gridSize * gridSize).fill(null);
  const visibleLayers = layers.filter(layer => layer.visible);

  visibleLayers.forEach(layer => {
    Object.entries(layer.gridData).forEach(([key, color]) => {
      if (!color) return;
      const [x, y] = key.split(',').map(Number);
      const index = y * gridSize + x;
      if (index >= 0 && index < cellColors.length) {
        cellColors[index] = color;
      }
    });
  });

  return cellColors;
};

/**
 * Prepares grid data for JSON export
 * @param {number} gridSize - Size of the grid
 * @param {Array} layers - All available layers
 * @param {string} activeLayer - ID of the active layer
 * @returns {Object} - Formatted grid data for export
 */
const getGridDataForExport = (gridSize, layers, activeLayer) => ({
  gridSize,
  layers: layers.map(layer => ({
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    opacity: layer.opacity,
    blendMode: layer.blendMode,
    locked: layer.locked,
    gridData: { ...layer.gridData },
  })),
  activeLayer,
  metadata: {
    exportDate: new Date().toISOString(),
    application: 'Vectorbit',
    version: '1.0',
  },
});

/**
 * Handles all export-related actions and utilities
 */
const useExportHandlers = ({
  activeLayer,
  exportFormat,
  gridSize,
  layers,
  setExportStatus,
  svgOptions,
}) => {
  const canvasRef = useRef(null);

  // Export as SVG format
  const handleSvgExport = () => {
    const svgData = exportLayersToSVG(layers, gridSize, svgOptions);
    downloadContent(svgData, 'artwork.svg', 'image/svg+xml');
  };

  // Export as PNG format
  const handlePngExport = cellColors => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas and set size based on grid
    canvas.width = gridSize.columns;
    canvas.height = gridSize.rows;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each cell onto the canvas
    for (let row = 0; row < gridSize.rows; row++) {
      for (let col = 0; col < gridSize.columns; col++) {
        const idx = row * gridSize.columns + col;
        const cellColor = cellColors[idx] || 'transparent';
        ctx.fillStyle = cellColor;
        ctx.fillRect(col, row, 1, 1);
      }
    }

    // Convert canvas to PNG data URL and download
    const pngData = canvas.toDataURL('image/png');
    downloadContent(pngData, 'artwork.png', 'image/png');
  };

  // Export as JSON format
  const handleJsonExport = gridData => {
    // Create a formatted JSON string for download
    const jsonData = JSON.stringify(gridData, null, 2);
    downloadContent(
      `data:text/json;charset=utf-8,${encodeURIComponent(jsonData)}`,
      'artwork.json',
      'text/json'
    );
  };

  // Export in all formats
  const handleAllFormatsExport = (cellColors, gridData) => {
    handleSvgExport();
    handlePngExport(cellColors);
    handleJsonExport(gridData);
  };

  // Main export function that delegates to appropriate handlers
  const handleExport = () => {
    try {
      setExportStatus('Exporting...');
      // Get flattened cell colors for formats that don't support layers
      const cellColors = getFlattenedCellColors(gridSize, layers);
      // Get complete grid data for JSON export
      const gridData = getGridDataForExport(gridSize, layers, activeLayer);

      // Delegate to the appropriate format handler
      switch (exportFormat) {
        case 'svg': {
          handleSvgExport();
          break;
        }
        case 'png': {
          handlePngExport(cellColors);
          break;
        }
        case 'json': {
          handleJsonExport(gridData);
          break;
        }
        case 'all': {
          handleAllFormatsExport(cellColors, gridData);
          break;
        }
        default: {
          throw new Error(`Unsupported export format: ${exportFormat}`);
        }
      }

      setExportStatus('Export completed successfully!');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus(`Export failed: ${error.message}`);
    }
  };

  return {
    handleExport,
    canvasRef,
  };
};

/**
 * Main ExportPanel Component
 * Provides a UI for exporting artwork in various formats with advanced options
 */
const ExportPanel = ({ activeLayer, gridSize, layers }) => {
  const [exportFormat, setExportFormat] = useState('svg');
  const [svgOptions, setSvgOptions] = useState(DEFAULT_SVG_OPTIONS);
  const [exportStatus, setExportStatus] = useState('');

  const handleExportFormatChange = e => setExportFormat(e.target.value);

  const { handleExport, canvasRef } = useExportHandlers({
    activeLayer,
    exportFormat,
    gridSize,
    layers,
    setExportStatus,
    svgOptions,
  });

  return (
    <div className="export-panel">
      <h3>Export Artwork</h3>
      <FormatSelector exportFormat={exportFormat} onFormatChange={handleExportFormatChange} />
      {exportFormat === 'svg' && (
        <SvgOptionsPanel svgOptions={svgOptions} updateOptions={setSvgOptions} />
      )}
      <ExportActions exportStatus={exportStatus} onExport={handleExport} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

ExportPanel.propTypes = {
  activeLayer: PropTypes.string.isRequired,
  gridSize: PropTypes.number.isRequired,
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      blendMode: PropTypes.string,
      gridData: PropTypes.object,
      id: PropTypes.string,
      locked: PropTypes.bool,
      name: PropTypes.string,
      opacity: PropTypes.number,
      visible: PropTypes.bool,
    })
  ).isRequired,
};

export default ExportPanel;
