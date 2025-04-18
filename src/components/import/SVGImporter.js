/**
 * SVG Importer Component
 * Provides an interface for importing SVG files and converting them to application layers
 */
import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';

import {
  importSVGFromFile,
  importSVGFromURL,
  optimizeSVGLayers,
} from '../../utils/api/svgImportUtility';
import './SVGImporter.css';

const SVGImporter = ({
  gridSize,
  onImportComplete,
  onImportError,
  onImportStart,
  onImportCancel,
}) => {
  // State to track import progress and options
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importOptions, setImportOptions] = useState({
    preserveGroups: true,
    flattenGroups: false,
    optimizeLayers: true,
    createNewProject: false,
    scaleMode: 'fit', // 'fit', 'fill', 'stretch'
  });
  const [previewSrc, setPreviewSrc] = useState('');
  const [importSource, setImportSource] = useState('file'); // 'file' or 'url'
  const [importUrl, setImportUrl] = useState('');
  const [importError, setImportError] = useState('');
  const [fileName, setFileName] = useState('');

  // Refs
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setImportError('');

    // Show file preview
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewSrc(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input change
  const handleUrlChange = event => {
    setImportUrl(event.target.value);
    setImportError('');

    // Clear preview if URL is empty
    if (!event.target.value.trim()) {
      setPreviewSrc('');
      return;
    }

    // Only set preview for SVG URLs
    if (event.target.value.trim().toLowerCase().endsWith('.svg')) {
      setPreviewSrc(event.target.value);
    }
  };

  // Handle import option change
  const handleOptionChange = (option, value) => {
    setImportOptions({
      ...importOptions,
      [option]: value,
    });
  };

  // Start import process
  const startImport = async () => {
    try {
      setImporting(true);
      setImportProgress(10);
      setImportError('');

      if (onImportStart) {
        onImportStart();
      }

      let svgLayers;
      let metadata;

      // Import SVG based on source
      if (importSource === 'file') {
        const file = fileInputRef.current.files[0];
        if (!file) {
          throw new Error('No file selected');
        }

        setImportProgress(30);

        const result = await importSVGFromFile(file, gridSize, importOptions);
        svgLayers = result.layers;
        metadata = result.metadata;
      } else {
        if (!importUrl.trim()) {
          throw new Error('No URL provided');
        }

        setImportProgress(30);

        const result = await importSVGFromURL(importUrl, gridSize, importOptions);
        svgLayers = result.layers;
        metadata = result.metadata;
      }

      setImportProgress(70);

      // Optimize layers if option is enabled
      if (importOptions.optimizeLayers) {
        svgLayers = optimizeSVGLayers(svgLayers);
      }

      setImportProgress(90);

      // Complete import process
      if (onImportComplete) {
        onImportComplete(svgLayers, {
          ...metadata,
          fileName: fileName || 'imported-svg',
          importOptions,
        });
      }

      setImportProgress(100);

      // Reset state after successful import
      setTimeout(() => {
        setImporting(false);
        setImportProgress(0);
        setPreviewSrc('');
        setFileName('');
        setImportUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);
    } catch (error) {
      setImportError(error.message);
      setImporting(false);
      setImportProgress(0);

      if (onImportError) {
        onImportError(error);
      }
    }
  };

  // Cancel import
  const cancelImport = () => {
    setImporting(false);
    setImportProgress(0);

    if (onImportCancel) {
      onImportCancel();
    }
  };

  return (
    <div className="svg-importer">
      <h2>Import SVG</h2>

      {/* Import source selector */}
      <div className="import-source-selector">
        <label>
          <input
            checked={importSource === 'file'}
            disabled={importing}
            name="importSource"
            type="radio"
            value="file"
            onChange={() => setImportSource('file')}
          />
          From File
        </label>
        <label>
          <input
            checked={importSource === 'url'}
            disabled={importing}
            name="importSource"
            type="radio"
            value="url"
            onChange={() => setImportSource('url')}
          />
          From URL
        </label>
      </div>

      {/* File input */}
      {importSource === 'file' && (
        <div className="file-input-container">
          <input
            ref={fileInputRef}
            accept=".svg"
            disabled={importing}
            type="file"
            onChange={handleFileSelect}
          />
          {fileName && <div className="file-name">{fileName}</div>}
        </div>
      )}

      {/* URL input */}
      {importSource === 'url' && (
        <div className="url-input-container">
          <input
            disabled={importing}
            placeholder="Enter SVG URL"
            type="url"
            value={importUrl}
            onChange={handleUrlChange}
          />
        </div>
      )}

      {/* Preview */}
      {previewSrc && (
        <div className="preview-container">
          <h3>Preview</h3>
          <div className="svg-preview">
            <img
              alt="SVG Preview"
              src={previewSrc}
              onError={() => setImportError('Unable to load preview')}
            />
          </div>
        </div>
      )}

      {/* Import options */}
      <div className="import-options">
        <h3>Import Options</h3>

        <label>
          <input
            checked={importOptions.preserveGroups}
            disabled={importing}
            type="checkbox"
            onChange={e => handleOptionChange('preserveGroups', e.target.checked)}
          />
          Preserve SVG Groups as Layers
        </label>

        <label>
          <input
            checked={importOptions.flattenGroups}
            disabled={importing || !importOptions.preserveGroups}
            type="checkbox"
            onChange={e => handleOptionChange('flattenGroups', e.target.checked)}
          />
          Flatten Group Content
        </label>

        <label>
          <input
            checked={importOptions.optimizeLayers}
            disabled={importing}
            type="checkbox"
            onChange={e => handleOptionChange('optimizeLayers', e.target.checked)}
          />
          Optimize Layers
        </label>

        <label>
          <input
            checked={importOptions.createNewProject}
            disabled={importing}
            type="checkbox"
            onChange={e => handleOptionChange('createNewProject', e.target.checked)}
          />
          Create New Project
        </label>

        <div className="scale-mode">
          <span>Scale Mode:</span>
          <select
            disabled={importing}
            value={importOptions.scaleMode}
            onChange={e => handleOptionChange('scaleMode', e.target.value)}
          >
            <option value="fit">Fit</option>
            <option value="fill">Fill</option>
            <option value="stretch">Stretch</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {importError && (
        <div className="import-error">
          <p>Error: {importError}</p>
        </div>
      )}

      {/* Import progress */}
      {importing && (
        <div className="import-progress">
          <div className="progress-bar" style={{ width: `${importProgress}%` }} />
          <span>{importProgress}%</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="action-buttons">
        <button className="cancel-button" disabled={!importing} onClick={cancelImport}>
          Cancel
        </button>
        <button
          className="import-button"
          disabled={importing || (!previewSrc && !importUrl)}
          onClick={startImport}
        >
          Import
        </button>
      </div>
    </div>
  );
};

SVGImporter.propTypes = {
  gridSize: PropTypes.number.isRequired,
  onImportComplete: PropTypes.func,
  onImportError: PropTypes.func,
  onImportStart: PropTypes.func,
  onImportCancel: PropTypes.func,
};

SVGImporter.defaultProps = {
  onImportComplete: () => {},
  onImportError: () => {},
  onImportStart: () => {},
  onImportCancel: () => {},
};

export default SVGImporter;
