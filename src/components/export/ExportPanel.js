import React, { useState, useRef } from 'react';
import { 
  exportToSVG, 
  exportToPNG, 
  exportToJSON, 
  exportAllFormats 
} from '../../utils/api';
import { exportLayersToSVG } from '../../utils/api/svgExportUtility';
import './ExportPanel.css';

/**
 * ExportPanel Component
 * Provides a UI for exporting artwork in various formats with advanced options
 */
const ExportPanel = ({ gridSize, layers, activeLayer }) => {
  const canvasRef = useRef(null);
  const [exportFormat, setExportFormat] = useState('svg');
  const [svgOptions, setSvgOptions] = useState({
    width: 1024,
    height: 1024,
    background: '#FFFFFF',
    includeLayerNames: true,
    optimizeRectangles: true
  });
  const [exportStatus, setExportStatus] = useState('');

  // Helper to flatten all visible layers into a single cell colors array
  const getFlattenedCellColors = () => {
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

  // Prepare grid data for JSON export
  const getGridDataForExport = () => {
    return {
      gridSize,
      layers: layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        locked: layer.locked,
        gridData: { ...layer.gridData }
      })),
      activeLayer,
      metadata: {
        exportDate: new Date().toISOString(),
        application: 'Vectorbit',
        version: '1.0'
      }
    };
  };

  // Handle the export action
  const handleExport = () => {
    try {
      setExportStatus('Exporting...');
      
      // Get flattened cell colors for formats that don't support layers
      const cellColors = getFlattenedCellColors();
      
      // Get complete grid data for JSON export
      const gridData = getGridDataForExport();
      
      switch (exportFormat) {
        case 'svg':
          const svgContent = exportLayersToSVG(gridSize, layers, svgOptions);
          const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
          const svgLink = document.createElement('a');
          svgLink.href = URL.createObjectURL(svgBlob);
          svgLink.download = 'vectorbit-artwork.svg';
          svgLink.click();
          break;
          
        case 'png':
          // Need to create temporary canvas if we don't have a real one
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = gridSize * 64;  // Scale factor of 64
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
          link.download = 'vectorbit-artwork.png';
          link.click();
          break;
          
        case 'json':
          exportToJSON(gridData, 'vectorbit-artwork.json');
          break;
          
        case 'all':
          exportAllFormats(gridSize, cellColors, canvasRef.current || document.createElement('canvas'), gridData, layers);
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

  return (
    <div className="export-panel">
      <h3>Export Artwork</h3>
      
      <div className="export-format">
        <label>
          Export Format:
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value)}
          >
            <option value="svg">SVG (Vector)</option>
            <option value="png">PNG (Raster)</option>
            <option value="json">JSON (Project File)</option>
            <option value="all">All Formats</option>
          </select>
        </label>
      </div>
      
      {exportFormat === 'svg' && (
        <div className="svg-options">
          <h4>SVG Options</h4>
          
          <div className="option-group">
            <label>
              Width (px):
              <input 
                type="number" 
                value={svgOptions.width} 
                onChange={(e) => setSvgOptions({...svgOptions, width: parseInt(e.target.value)})}
                min="1"
              />
            </label>
            
            <label>
              Height (px):
              <input 
                type="number" 
                value={svgOptions.height} 
                onChange={(e) => setSvgOptions({...svgOptions, height: parseInt(e.target.value)})}
                min="1"
              />
            </label>
          </div>
          
          <div className="option-group">
            <label>
              Background:
              <input 
                type="color" 
                value={svgOptions.background} 
                onChange={(e) => setSvgOptions({...svgOptions, background: e.target.value})}
              />
            </label>
          </div>
          
          <div className="option-group">
            <label>
              <input 
                type="checkbox" 
                checked={svgOptions.includeLayerNames} 
                onChange={(e) => setSvgOptions({...svgOptions, includeLayerNames: e.target.checked})}
              />
              Include Layer Names
            </label>
            
            <label>
              <input 
                type="checkbox" 
                checked={svgOptions.optimizeRectangles} 
                onChange={(e) => setSvgOptions({...svgOptions, optimizeRectangles: e.target.checked})}
              />
              Optimize Rectangles
            </label>
          </div>
        </div>
      )}
      
      <div className="export-actions">
        <button onClick={handleExport} className="export-button">
          Export
        </button>
        
        {exportStatus && (
          <div className="export-status">
            {exportStatus}
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ExportPanel;
