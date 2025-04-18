/**
 * Brush Controls Component
 *
 * Provides UI controls for customizing brush settings
 */
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import { BRUSH_TYPES, BRUSH_EFFECTS, BRUSH_BLEND_MODES, SYMMETRY_MODES } from './BrushManager';

// Brush Type Selector Component
const BrushTypeSelector = ({ brushType, setBrushType }) => (
  <div className="brush-type-selector">
    <select value={brushType} onChange={e => setBrushType(e.target.value)}>
      {Object.entries(BRUSH_TYPES).map(([key, value]) => (
        <option key={key} value={value}>
          {key.charAt(0) + key.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  </div>
);

BrushTypeSelector.propTypes = {
  brushType: PropTypes.string.isRequired,
  setBrushType: PropTypes.func.isRequired,
};

// Pattern Controls Component
const PatternControls = ({ patternSettings, setPatternSettings }) => (
  <div className="pattern-controls">
    <label>
      Pattern Type
      <select
        value={patternSettings.type}
        onChange={e =>
          setPatternSettings({
            ...patternSettings,
            type: e.target.value,
          })
        }
      >
        <option value="solid">Solid</option>
        <option value="dots">Dots</option>
        <option value="lines">Lines</option>
        <option value="grid">Grid</option>
        <option value="noise">Noise</option>
      </select>
    </label>

    <label>
      Scale
      <input
        max="10"
        min="1"
        step="1"
        type="range"
        value={patternSettings.scale}
        onChange={e =>
          setPatternSettings({
            ...patternSettings,
            scale: parseInt(e.target.value, 10),
          })
        }
      />
    </label>

    <label>
      Density
      <input
        max="1"
        min="0.1"
        step="0.1"
        type="range"
        value={patternSettings.density}
        onChange={e =>
          setPatternSettings({
            ...patternSettings,
            density: parseFloat(e.target.value),
          })
        }
      />
    </label>

    <label>
      Angle
      <input
        max="180"
        min="0"
        step="15"
        type="range"
        value={patternSettings.angle}
        onChange={e =>
          setPatternSettings({
            ...patternSettings,
            angle: parseInt(e.target.value, 10),
          })
        }
      />
    </label>
  </div>
);

PatternControls.propTypes = {
  patternSettings: PropTypes.object.isRequired,
  setPatternSettings: PropTypes.func.isRequired,
};

// Gradient Controls Component
const GradientControls = ({ gradientSettings, setGradientSettings }) => (
  <div className="gradient-controls">
    <label>
      Start Color
      <input
        type="color"
        value={gradientSettings.startColor}
        onChange={e =>
          setGradientSettings({
            ...gradientSettings,
            startColor: e.target.value,
          })
        }
      />
    </label>

    <label>
      End Color
      <input
        type="color"
        value={gradientSettings.endColor}
        onChange={e =>
          setGradientSettings({
            ...gradientSettings,
            endColor: e.target.value,
          })
        }
      />
    </label>

    <label>
      Type
      <select
        value={gradientSettings.type}
        onChange={e =>
          setGradientSettings({
            ...gradientSettings,
            type: e.target.value,
          })
        }
      >
        <option value="linear">Linear</option>
        <option value="radial">Radial</option>
      </select>
    </label>

    <label>
      Angle
      <input
        max="360"
        min="0"
        step="15"
        type="range"
        value={gradientSettings.angle}
        onChange={e =>
          setGradientSettings({
            ...gradientSettings,
            angle: parseInt(e.target.value, 10),
          })
        }
      />
    </label>
  </div>
);

GradientControls.propTypes = {
  gradientSettings: PropTypes.object.isRequired,
  setGradientSettings: PropTypes.func.isRequired,
};

// Effect Controls Component
const EffectControls = ({ brushEffect, setBrushEffect }) => (
  <div className="effect-controls">
    <select value={brushEffect} onChange={e => setBrushEffect(e.target.value)}>
      {Object.entries(BRUSH_EFFECTS).map(([key, value]) => (
        <option key={key} value={value}>
          {key.charAt(0) + key.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  </div>
);

EffectControls.propTypes = {
  brushEffect: PropTypes.string.isRequired,
  setBrushEffect: PropTypes.func.isRequired,
};

// Blend Mode Controls Component
const BlendModeControls = ({ blendMode, setBlendMode }) => (
  <div className="blend-mode-controls">
    <select value={blendMode} onChange={e => setBlendMode(e.target.value)}>
      {Object.entries(BRUSH_BLEND_MODES).map(([key, value]) => (
        <option key={key} value={value}>
          {key.charAt(0) + key.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  </div>
);

BlendModeControls.propTypes = {
  blendMode: PropTypes.string.isRequired,
  setBlendMode: PropTypes.func.isRequired,
};

// Symmetry Controls Component
const SymmetryControls = ({ symmetryMode, setSymmetryMode }) => (
  <div className="symmetry-controls">
    <select value={symmetryMode} onChange={e => setSymmetryMode(e.target.value)}>
      {Object.entries(SYMMETRY_MODES).map(([key, value]) => (
        <option key={key} value={value}>
          {key.charAt(0) + key.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  </div>
);

SymmetryControls.propTypes = {
  symmetryMode: PropTypes.string.isRequired,
  setSymmetryMode: PropTypes.func.isRequired,
};

// Advanced Settings Component
const AdvancedSettings = ({
  brushHardness,
  brushSize,
  brushSmoothing,
  brushSpacing,
  generateBrushPreview,
  onSettingsChange,
  pressure,
  setBrushHardness,
  setBrushSize,
  setBrushSmoothing,
  setBrushSpacing,
}) => (
  <div className="advanced-settings">
    <label>
      Hardness
      <input
        max="1"
        min="0"
        step="0.1"
        type="range"
        value={brushHardness}
        onChange={e => setBrushHardness(parseFloat(e.target.value))}
      />
    </label>

    <label>
      Size
      <input
        max="100"
        min="1"
        step="1"
        type="range"
        value={brushSize}
        onChange={e => setBrushSize(parseInt(e.target.value, 10))}
      />
    </label>

    <label>
      Smoothing
      <input
        max="1"
        min="0"
        step="0.1"
        type="range"
        value={brushSmoothing}
        onChange={e => setBrushSmoothing(parseFloat(e.target.value))}
      />
    </label>

    <label>
      Spacing
      <input
        max="100"
        min="1"
        step="1"
        type="range"
        value={brushSpacing}
        onChange={e => setBrushSpacing(parseInt(e.target.value, 10))}
      />
    </label>

    <label>
      Pressure Sensitivity
      <input
        max="1"
        min="0"
        step="0.1"
        type="range"
        value={pressure}
        onChange={e => onSettingsChange({ pressure: parseFloat(e.target.value) })}
      />
    </label>

    <button onClick={() => generateBrushPreview()}>Update Preview</button>
  </div>
);

AdvancedSettings.propTypes = {
  brushHardness: PropTypes.number.isRequired,
  brushSize: PropTypes.number.isRequired,
  brushSmoothing: PropTypes.number.isRequired,
  brushSpacing: PropTypes.number.isRequired,
  generateBrushPreview: PropTypes.func.isRequired,
  onSettingsChange: PropTypes.func.isRequired,
  pressure: PropTypes.number.isRequired,
  setBrushHardness: PropTypes.func.isRequired,
  setBrushSize: PropTypes.func.isRequired,
  setBrushSmoothing: PropTypes.func.isRequired,
  setBrushSpacing: PropTypes.func.isRequired,
};

// Preset Management Component
const PresetManagement = ({ getBrushPresets, handlePresetChange }) => (
  <div className="preset-management">
    <select onChange={handlePresetChange}>
      <option value="">Select Preset</option>
      {Object.keys(getBrushPresets()).map(name => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
      <option value="save-new">Save New Preset...</option>
    </select>
  </div>
);

PresetManagement.propTypes = {
  getBrushPresets: PropTypes.func.isRequired,
  handlePresetChange: PropTypes.func.isRequired,
};

// Helper functions for BrushControls
const loadBrushPresets = () => {
  try {
    return JSON.parse(localStorage.getItem('brushPresets') || '{}');
  } catch (error) {
    console.error('Error loading brush presets:', error);
    return {};
  }
};

const saveBrushPreset = (name, preset) => {
  const presets = loadBrushPresets();
  presets[name] = preset;
  localStorage.setItem('brushPresets', JSON.stringify(presets));
};

const loadPreset = ({
  presetName,
  presets,
  setBlendMode,
  setBrushEffect,
  setBrushHardness,
  setBrushSmoothing,
  setBrushSpacing,
  setBrushType,
  setGradientSettings,
  setPatternSettings,
}) => {
  const preset = presets[presetName];
  if (preset) {
    setBrushType(preset.type);
    setBrushEffect(preset.effect);
    setBlendMode(preset.blendMode);
    setBrushHardness(preset.hardness);
    setBrushSpacing(preset.spacing);
    setBrushSmoothing(preset.smoothing);
    setPatternSettings(preset.patternSettings);
    setGradientSettings(preset.gradientSettings);
  }
};

// Create a new preset from current brush settings
const createPreset = ({
  blendMode,
  brushEffect,
  brushHardness,
  brushSmoothing,
  brushSpacing,
  brushType,
  gradientSettings,
  name,
  patternSettings,
}) => {
  if (!name) return;

  const preset = {
    name,
    type: brushType,
    effect: brushEffect,
    blendMode,
    hardness: brushHardness,
    spacing: brushSpacing,
    smoothing: brushSmoothing,
    patternSettings,
    gradientSettings,
  };

  saveBrushPreset(name, preset);
};

// Handler for preset change event
const handlePresetSelection = ({
  presetName,
  blendMode,
  brushEffect,
  brushHardness,
  brushSmoothing,
  brushSpacing,
  brushType,
  gradientSettings,
  patternSettings,
  setBlendMode,
  setBrushEffect,
  setBrushHardness,
  setBrushSmoothing,
  setBrushSpacing,
  setBrushType,
  setGradientSettings,
  setPatternSettings,
}) => {
  if (presetName === 'save-new') {
    const name = prompt('Enter preset name:');
    createPreset({
      blendMode,
      brushEffect,
      brushHardness,
      brushSmoothing,
      brushSpacing,
      brushType,
      gradientSettings,
      name,
      patternSettings,
    });
  } else if (presetName) {
    const presets = loadBrushPresets();
    loadPreset({
      presetName,
      presets,
      setBlendMode,
      setBrushEffect,
      setBrushHardness,
      setBrushSmoothing,
      setBrushSpacing,
      setBrushType,
      setGradientSettings,
      setPatternSettings,
    });
  }
};

// Render function for the BrushControls component
const renderBrushControls = props => {
  const {
    blendMode,
    brushEffect,
    brushHardness,
    brushSize,
    brushSmoothing,
    brushSpacing,
    brushType,
    generateBrushPreview,
    gradientSettings,
    handlePresetChange,
    loadBrushPresets,
    onSettingsChange,
    patternSettings,
    pressure,
    setBlendMode,
    setBrushEffect,
    setBrushHardness,
    setBrushSmoothing,
    setBrushSpacing,
    setBrushType,
    setGradientSettings,
    setPatternSettings,
    setSymmetryMode,
    symmetryMode,
  } = props;

  return (
    <div className="brush-controls">
      {/* Brush Type Selector */}
      <BrushTypeSelector brushType={brushType} setBrushType={setBrushType} />

      {/* Pattern Controls */}
      {brushType === BRUSH_TYPES.PATTERNED && (
        <PatternControls
          patternSettings={patternSettings}
          setPatternSettings={setPatternSettings}
        />
      )}

      {/* Gradient Controls */}
      {brushType === BRUSH_TYPES.GRADIENT && (
        <GradientControls
          gradientSettings={gradientSettings}
          setGradientSettings={setGradientSettings}
        />
      )}

      {/* Effect Controls */}
      <EffectControls brushEffect={brushEffect} setBrushEffect={setBrushEffect} />

      {/* Blend Mode Controls */}
      <BlendModeControls blendMode={blendMode} setBlendMode={setBlendMode} />

      {/* Symmetry Controls */}
      {/* eslint-disable react/jsx-sort-props */}
      <SymmetryControls symmetryMode={symmetryMode} setSymmetryMode={setSymmetryMode} />
      {/* eslint-enable react/jsx-sort-props */}

      {/* Advanced Settings */}
      {/* eslint-disable react/jsx-sort-props */}
      <AdvancedSettings
        brushHardness={brushHardness}
        brushSize={brushSize}
        brushSmoothing={brushSmoothing}
        brushSpacing={brushSpacing}
        pressure={pressure}
        generateBrushPreview={generateBrushPreview}
        onSettingsChange={onSettingsChange}
        setBrushHardness={setBrushHardness}
        setBrushSize={onSettingsChange}
        setBrushSmoothing={setBrushSmoothing}
        setBrushSpacing={setBrushSpacing}
      />
      {/* eslint-enable react/jsx-sort-props */}

      {/* Preset Management */}
      <PresetManagement
        getBrushPresets={loadBrushPresets}
        handlePresetChange={handlePresetChange}
      />

      {/* Additional info text */}
      <div className="info-text">
        <p>Use the controls above to customize your brush settings.</p>
        <p>Save presets to quickly access your favorite brushes later.</p>
      </div>
    </div>
  );
};

// Main BrushControls Component
const BrushControls = ({
  _activeColor, // Renamed to indicate intentionally unused
  blendMode,
  brushEffect,
  brushHardness,
  brushSize,
  brushSmoothing,
  brushSpacing,
  brushType,
  generateBrushPreview,
  gradientSettings,
  onSettingsChange,
  patternSettings,
  pressure,
  setBlendMode,
  setBrushEffect,
  setBrushHardness,
  _setBrushShape, // Renamed to indicate intentionally unused
  setBrushSmoothing,
  setBrushSpacing,
  setBrushType,
  setGradientSettings,
  setPatternSettings,
  setSymmetryMode,
  symmetryMode,
}) => {
  // Handle preset selection
  const handlePresetChange = useCallback(
    e => {
      handlePresetSelection({
        presetName: e.target.value,
        blendMode,
        brushEffect,
        brushHardness,
        brushSmoothing,
        brushSpacing,
        brushType,
        gradientSettings,
        patternSettings,
        setBlendMode,
        setBrushEffect,
        setBrushHardness,
        setBrushSmoothing,
        setBrushSpacing,
        setBrushType,
        setGradientSettings,
        setPatternSettings,
      });
    },
    [
      blendMode,
      brushEffect,
      brushHardness,
      brushSmoothing,
      brushSpacing,
      brushType,
      gradientSettings,
      patternSettings,
      setBlendMode,
      setBrushEffect,
      setBrushHardness,
      setBrushSmoothing,
      setBrushSpacing,
      setBrushType,
      setGradientSettings,
      setPatternSettings,
    ]
  );

  // Create props for the render function
  const renderProps = {
    blendMode,
    brushEffect,
    brushHardness,
    brushSize,
    brushSmoothing,
    brushSpacing,
    brushType,
    generateBrushPreview,
    gradientSettings,
    handlePresetChange,
    loadBrushPresets,
    onSettingsChange,
    patternSettings,
    pressure,
    setBlendMode,
    setBrushEffect,
    setBrushHardness,
    setBrushSmoothing,
    setBrushSpacing,
    setBrushType,
    setGradientSettings,
    setPatternSettings,
    setSymmetryMode,
    symmetryMode,
  };

  return renderBrushControls(renderProps);
};

BrushControls.propTypes = {
  _activeColor: PropTypes.string.isRequired, // Renamed to indicate intentionally unused
  blendMode: PropTypes.string.isRequired,
  brushEffect: PropTypes.string.isRequired,
  brushHardness: PropTypes.number.isRequired,
  brushSize: PropTypes.number.isRequired,
  brushSmoothing: PropTypes.number.isRequired,
  brushSpacing: PropTypes.number.isRequired,
  brushType: PropTypes.string.isRequired,
  generateBrushPreview: PropTypes.func.isRequired,
  gradientSettings: PropTypes.object.isRequired,
  onSettingsChange: PropTypes.func,
  patternSettings: PropTypes.object.isRequired,
  pressure: PropTypes.number.isRequired,
  setBlendMode: PropTypes.func.isRequired,
  setBrushEffect: PropTypes.func.isRequired,
  setBrushHardness: PropTypes.func.isRequired,
  _setBrushShape: PropTypes.func.isRequired, // Renamed to indicate intentionally unused
  setBrushSmoothing: PropTypes.func.isRequired,
  setBrushSpacing: PropTypes.func.isRequired,
  setBrushType: PropTypes.func.isRequired,
  setGradientSettings: PropTypes.func.isRequired,
  setPatternSettings: PropTypes.func.isRequired,
  setSymmetryMode: PropTypes.func.isRequired,
  symmetryMode: PropTypes.string.isRequired,
};

export default BrushControls;
