import PropTypes from 'prop-types';

import usePresetManager from './hooks/usePresetManager';
import PresetButtons from './PresetButtons';
import PresetForm from './PresetForm';
import PresetList from './PresetList';
import './BrushControls.css';

/**
 * PresetEditor component for managing brush/pattern/gradient presets
 * @component
 */
const PresetEditor = ({
  _activePreset,
  currentBrushSettings,
  onDeletePreset,
  onLoadPreset,
  onSavePreset,
  onUpdatePreset,
}) => {
  const {
    presetName,
    setPresetName,
    presetCategory,
    setPresetCategory,
    selectedPresetId,
    categoryPresets,
    handleSavePreset,
    handleLoadPreset,
    handleUpdatePreset,
    handleDeletePreset,
  } = usePresetManager({
    currentBrushSettings,
    onDeletePreset,
    onLoadPreset,
    onSavePreset,
    onUpdatePreset,
  });

  return (
    <div className="preset-editor">
      <h3>Brush Presets</h3>

      {/* Group controls */}
      <div className="brush-controls-section">
        <h3>Presets</h3>
        <div className="preset-manager">
          <div className="preset-controls">
            <PresetForm
              presetCategory={presetCategory}
              presetName={presetName}
              setPresetCategory={setPresetCategory}
              setPresetName={setPresetName}
            />
            <PresetButtons
              handleDeletePreset={handleDeletePreset}
              handleSavePreset={handleSavePreset}
              handleUpdatePreset={handleUpdatePreset}
              selectedPresetId={selectedPresetId}
            />
          </div>

          {/* Preset List */}
          <div className="preset-list">
            <PresetList
              categoryPresets={categoryPresets}
              handleDeletePreset={handleDeletePreset}
              handleLoadPreset={handleLoadPreset}
              selectedPresetId={selectedPresetId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

PresetEditor.propTypes = {
  _activePreset: PropTypes.object,
  currentBrushSettings: PropTypes.shape({
    brushType: PropTypes.string,
    brushSize: PropTypes.number,
    opacity: PropTypes.number,
    pressure: PropTypes.number,
    brushShape: PropTypes.string,
    patternSettings: PropTypes.object,
    gradientSettings: PropTypes.object,
  }),
  onDeletePreset: PropTypes.func,
  onLoadPreset: PropTypes.func,
  onSavePreset: PropTypes.func,
  onUpdatePreset: PropTypes.func,
};

export default PresetEditor;
