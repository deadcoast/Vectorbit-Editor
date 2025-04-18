import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';

import { BRUSH_TYPES, BRUSH_EFFECTS, BRUSH_BLEND_MODES, SYMMETRY_MODES } from './BrushManager';
import { PATTERN_TYPES } from '../../utils/patterns/ProceduralGenerator';
import './BrushControls.css';

/**
 * PresetEditor component for managing brush/pattern/gradient presets
 * @component
 */
const PresetEditor = ({
  activePreset,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onUpdatePreset,
  currentBrushSettings,
}) => {
  // Presets state
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(null);
  const [presetCategory, setPresetCategory] = useState('brush'); // brush, pattern, gradient

  // Load presets from localStorage on component mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('vectorbit_presets');
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Error loading presets:', error);
      }
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vectorbit_presets', JSON.stringify(presets));
  }, [presets]);

  // Handle creating a new preset from current settings
  const handleSavePreset = () => {
    if (!presetName.trim()) {
      alert('Please enter a name for your preset');
      return;
    }

    // Check for duplicate names
    if (
      presets.some(preset => preset.name === presetName) &&
      !window.confirm(`A preset named "${presetName}" already exists. Do you want to overwrite it?`)
    ) {
      return;
    }

    // Create new preset from current settings
    const newPreset = {
      id: Date.now().toString(),
      name: presetName,
      category: presetCategory,
      settings: { ...currentBrushSettings },
    };

    // Add to presets or update existing
    setPresets(prevPresets => {
      const existingIndex = prevPresets.findIndex(p => p.name === presetName);
      if (existingIndex >= 0) {
        const updated = [...prevPresets];
        updated[existingIndex] = newPreset;
        return updated;
      }
      return [...prevPresets, newPreset];
    });

    // Notify parent component
    if (onSavePreset) {
      onSavePreset(newPreset);
    }

    // Clear the name field
    setPresetName('');
  };

  // Handle loading a preset
  const handleLoadPreset = presetId => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    setSelectedPresetId(presetId);

    if (onLoadPreset) {
      onLoadPreset(preset);
    }
  };

  // Handle deleting a preset
  const handleDeletePreset = presetId => {
    if (!window.confirm('Are you sure you want to delete this preset?')) {
      return;
    }

    setPresets(prevPresets => prevPresets.filter(p => p.id !== presetId));

    if (onDeletePreset) {
      onDeletePreset(presetId);
    }

    if (selectedPresetId === presetId) {
      setSelectedPresetId(null);
    }
  };

  // Filter presets by category
  const filteredPresets = presets.filter(
    preset => presetCategory === 'all' || preset.category === presetCategory
  );

  return (
    <div className="preset-editor">
      <h3>Brush Presets</h3>

      {/* Category Filter */}
      <div className="preset-category">
        <label htmlFor="preset-category">Preset Type:</label>
        <select
          id="preset-category"
          value={presetCategory}
          onChange={e => setPresetCategory(e.target.value)}
        >
          <option value="all">All Presets</option>
          <option value="brush">Brush Presets</option>
          <option value="pattern">Pattern Presets</option>
          <option value="gradient">Gradient Presets</option>
        </select>
      </div>

      {/* Save Preset Form */}
      <div className="preset-form">
        <input
          placeholder="Enter preset name"
          type="text"
          value={presetName}
          onChange={e => setPresetName(e.target.value)}
        />
        <select value={presetCategory} onChange={e => setPresetCategory(e.target.value)}>
          <option value="brush">Brush</option>
          <option value="pattern">Pattern</option>
          <option value="gradient">Gradient</option>
        </select>
        <button onClick={handleSavePreset}>Save Preset</button>
      </div>

      {/* Preset List */}
      <div className="preset-list">
        {filteredPresets.length === 0 ? (
          <p>No presets saved yet.</p>
        ) : (
          <ul>
            {filteredPresets.map(preset => (
              <li key={preset.id} className={selectedPresetId === preset.id ? 'selected' : ''}>
                <div className="preset-item">
                  <span className="preset-name">{preset.name}</span>
                  <span className="preset-category">{preset.category}</span>
                  <div className="preset-actions">
                    <button onClick={() => handleLoadPreset(preset.id)}>Load</button>
                    <button onClick={() => handleDeletePreset(preset.id)}>Delete</button>
                  </div>
                </div>
                {/* Show preview of the preset colors/pattern */}
                {selectedPresetId === preset.id && (
                  <div className="preset-preview">
                    <PresetPreview settings={preset.settings} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * Preview component for brush presets
 */
const PresetPreview = ({ settings }) => {
  // Display different previews based on brush type
  if (!settings) return null;

  const { brushType, brushSize, opacity, patternSettings, gradientSettings } = settings;

  if (brushType === BRUSH_TYPES.GRADIENT) {
    // Gradient preview
    const { startColor, endColor, type } = gradientSettings || {};
    const gradientStyle =
      type === 'linear'
        ? { background: `linear-gradient(to right, ${startColor}, ${endColor})` }
        : { background: `radial-gradient(circle, ${startColor}, ${endColor})` };

    return <div className="preview-color" style={gradientStyle} />;
  }

  if (brushType === BRUSH_TYPES.PATTERNED) {
    // Pattern preview
    const patternType = patternSettings?.type || PATTERN_TYPES.SOLID;
    return (
      <div className="preview-pattern">
        <div className="pattern-indicator">
          <span>{patternType}</span>
          <span>Density: {patternSettings?.density || 0.5}</span>
        </div>
      </div>
    );
  }

  // Default brush preview
  return (
    <div className="preview-brush">
      <div
        className="brush-indicator"
        style={{
          width: brushSize * 4,
          height: brushSize * 4,
          opacity,
        }}
      >
        <span>Size: {brushSize}</span>
      </div>
    </div>
  );
};

PresetEditor.propTypes = {
  activePreset: PropTypes.object,
  onSavePreset: PropTypes.func,
  onLoadPreset: PropTypes.func,
  onDeletePreset: PropTypes.func,
  onUpdatePreset: PropTypes.func,
  currentBrushSettings: PropTypes.object.isRequired,
};

PresetPreview.propTypes = {
  settings: PropTypes.shape({
    brushType: PropTypes.string,
    brushSize: PropTypes.number,
    opacity: PropTypes.number,
    patternSettings: PropTypes.shape({
      type: PropTypes.string,
      density: PropTypes.number,
    }),
    gradientSettings: PropTypes.shape({
      startColor: PropTypes.string,
      endColor: PropTypes.string,
      type: PropTypes.string,
    }),
  }),
};

export default PresetEditor;
