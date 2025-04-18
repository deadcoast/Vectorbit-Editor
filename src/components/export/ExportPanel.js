import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

import { exportLayersToSVG } from '../../utils/api/svgExportUtility';
import './ExportPanel.css';

// Default SVG options
const DEFAULT_SVG_OPTIONS = {
  width: 1024,
  height: 1024,
  background: '#FFFFFF',
  includeLayerNames: true,
  optimizeRectangles: true,
};

/**
 * Creates a downloadable file from content with the given filename
 * @param {string} content - Content to download
 * @param {string} filename - Name for the download file
 */
const downloadContent = (content, filename) => {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * ExportPanel Component
 * Provides a UI for exporting artwork in various formats with advanced options
 */
const ExportPanel = ({ activeLayer, gridSize, layers }) => {
  const canvasRef = useRef(null);
  const [exportFormat, setExportFormat] = useState('svg');
  const [svgOptions, setSvgOptions] = useState(DEFAULT_SVG_OPTIONS);
  const [exportStatus, setExportStatus] = useState('');

  // Helper functions moved outside the component

  /**
   * Flattens all visible layers into a single cell colors array
   * @param {number} gridSize - Size of the grid
   * @param {Array} layers - All available layers
   * @returns {Array} - Flattened cell colors
   */
  const getFlattenedCellColors = (gridSize, layers) => {
    const cellColors = Array(gridSize * gridSize).fill(null);

    // Process layers from bottom to top
    const visibleLayers = layers.filter(layer => layer.visible);

    visibleLayers.forEach(layer => {
      // Add cells from this layer
      Object.entries(layer.gridData).forEach(([key, color]) => {
        if (!color) return;

        const [x, y] = key.split(',').map(Number);
        const index = y * gridSize + x;

        if (index >= 0 && index < cellColors.length) {
          // Simple override for flattened view (no blend modes in flattened export)
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
  const getGridDataForExport = (gridSize, layers, activeLayer) => {
    return {
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
    };
  };

  // Export as SVG format
  const handleSvgExport = gridData => {
    const svgContent = exportLayersToSVG(gridSize, layers, svgOptions);
    downloadContent(svgContent, `artwork_${new Date().getTime()}.svg`);
  };

  // Export as PNG format
  const handlePngExport = cellColors => {
    // Need to create temporary canvas if we don't have a real one
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = gridSize * 64; // Scale factor of 64
    tempCanvas.height = gridSize * 64;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw cells to canvas
    cellColors.forEach((color, index) => {
      if (color) {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        tempCtx.fillStyle = color;
        tempCtx.fillRect(x * 64, y * 64, 64, 64);
      }
    });

    // Export as PNG
    const dataUrl = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `artwork_${new Date().getTime()}.png`;
    link.click();
  };

  // Export as JSON format
  const handleJsonExport = gridData => {
    const content = JSON.stringify(gridData, null, 2);
    downloadContent(content, `artwork_${new Date().getTime()}.json`);
  };

  // Export in all formats
  const handleAllFormatsExport = (cellColors, gridData) => {
    handleSvgExport(gridData);
    handlePngExport(cellColors);
    handleJsonExport(gridData);
  };

  // Main export handler that delegates to specific format handlers
  const handleExport = () => {
    try {
      setExportStatus('Exporting...');
      // Get flattened cell colors for formats that don't support layers
      const cellColors = getFlattenedCellColors(gridSize, layers);
      // Get complete grid data for JSON export
      const gridData = getGridDataForExport(gridSize, layers, activeLayer);

      // Delegate to the appropriate format handler
      switch (exportFormat) {
        case 'svg':
          handleSvgExport(gridData);
          break;

        case 'png':
          handlePngExport(cellColors);
          break;

        case 'json':
          handleJsonExport(gridData);
          break;

        case 'all':
          handleAllFormatsExport(cellColors, gridData);
          break;

        default:
          throw new Error(`Unsupported export format: ${exportFormat}`);
      }

      setExportStatus('Export completed successfully!');
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus(`Export failed: ${error.message}`);
    }
  };

  // Render the format selection dropdown
  const renderFormatSelector = () => (
    <div className="export-format">
      <label>
        Export Format:
        <select value={exportFormat} onChange={e => setExportFormat(e.target.value)}>
          <option value="svg">SVG (Vector)</option>
          <option value="png">PNG (Raster)</option>
          <option value="json">JSON (Project File)</option>
          <option value="all">All Formats</option>
        </select>
      </label>
    </div>
  );

  // Render SVG-specific options
  const renderSvgOptions = () => {
    if (exportFormat !== 'svg') return null;
    return (
      <div className="svg-options">
        <h4>SVG Options</h4>

        <div className="option-group">
          <label>
            Width (px):
            <input
              min="1"
              type="number"
              value={svgOptions.width}
              onChange={e => setSvgOptions({ ...svgOptions, width: parseInt(e.target.value) })}
            />
          </label>

          <label>
            Height (px):
            <input
              min="1"
              type="number"
              value={svgOptions.height}
              onChange={e => setSvgOptions({ ...svgOptions, height: parseInt(e.target.value) })}
            />
          </label>
        </div>

        <div className="option-group">
          <label>
            Background:
            <input
              type="color"
              value={svgOptions.background}
              onChange={e => setSvgOptions({ ...svgOptions, background: e.target.value })}
            />
          </label>
        </div>

        <div className="option-group">
          <label>
            <input
              checked={svgOptions.includeLayerNames}
              type="checkbox"
              onChange={e => setSvgOptions({ ...svgOptions, includeLayerNames: e.target.checked })}
            />
            Include Layer Names
          </label>

          <label>
            <input
              checked={svgOptions.optimizeRectangles}
              type="checkbox"
              onChange={e => setSvgOptions({ ...svgOptions, optimizeRectangles: e.target.checked })}
            />
            Optimize Rectangles
          </label>
        </div>
      </div>
    );
  };

  /**
   * Render the export action button
   * @returns {JSX.Element} Export actions component
   */
  const renderExportActions = () => {
    const isExporting = exportStatus.includes('Exporting...');
    const buttonText = exportStatus || 'Export Now';
    
    return (
      <div className="export-actions">
        <h4>Export Action</h4>
        <button className="export-button" disabled={isExporting} onClick={handleExport}>
          {buttonText}
        </button>
      </div>
    );
  };

  return (
    <div className="export-panel">
      <h3>Export Artwork</h3>
      {renderFormatSelector()}
      {renderSvgOptions()}
      {renderExportActions()}
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
