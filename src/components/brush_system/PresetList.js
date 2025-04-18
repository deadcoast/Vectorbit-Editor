/**
 * PresetList component for displaying saved presets
 */
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

import { BRUSH_TYPES } from './BrushManager';

/**
 * Preview component for brush presets
 */
const PresetPreview = ({ settings }) => {
  const canvasRef = useRef(null);
  const { brushType, brushSize = 20, brushShape } = settings || {};

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw brush preview based on type and shape
    ctx.fillStyle = '#3a86ff';

    // Draw centered circle as basic preview
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = brushSize / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // If it's an eraser, add visual indication
    if (brushType === BRUSH_TYPES.ERASER) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - radius / 1.5, centerY - radius / 1.5);
      ctx.lineTo(centerX + radius / 1.5, centerY + radius / 1.5);
      ctx.moveTo(centerX + radius / 1.5, centerY - radius / 1.5);
      ctx.lineTo(centerX - radius / 1.5, centerY + radius / 1.5);
      ctx.stroke();
    }
  }, [brushType, brushSize, brushShape]);

  return <canvas ref={canvasRef} className="preset-preview-canvas" height="40" width="40" />;
};

/**
 * Main PresetList component
 */
const PresetList = ({
  categoryPresets,
  handleDeletePreset,
  handleLoadPreset,
  selectedPresetId,
}) => {
  if (categoryPresets.length === 0) {
    return <p>No presets saved yet.</p>;
  }

  return (
    <ul>
      {categoryPresets.map(preset => (
        <li key={preset.id} className={selectedPresetId === preset.id ? 'selected' : ''}>
          <div className="preset-item">
            <span className="preset-name">{preset.name}</span>
            <span className="preset-category">{preset.category}</span>
            <div className="preset-actions">
              <button onClick={() => handleLoadPreset(preset.id)}>Load</button>
              <button onClick={() => handleDeletePreset(preset.id)}>Delete</button>
            </div>
          </div>
          {selectedPresetId === preset.id && (
            <div className="preset-preview">
              <PresetPreview settings={preset.settings} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

// PropTypes for PresetPreview
PresetPreview.propTypes = {
  settings: PropTypes.shape({
    brushType: PropTypes.string,
    brushSize: PropTypes.number,
    brushShape: PropTypes.string,
  }),
};

// PropTypes for PresetList
PresetList.propTypes = {
  categoryPresets: PropTypes.array.isRequired,
  handleDeletePreset: PropTypes.func.isRequired,
  handleLoadPreset: PropTypes.func.isRequired,
  selectedPresetId: PropTypes.string,
};

export default PresetList;
