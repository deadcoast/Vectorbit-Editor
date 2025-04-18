/**
 * PresetButtons component for PresetEditor
 */
import PropTypes from 'prop-types';

/**
 * Component for preset action buttons
 */
const PresetButtons = ({
  handleDeletePreset,
  handleSavePreset,
  handleUpdatePreset,
  selectedPresetId,
}) => {
  return (
    <div className="preset-buttons">
      <button className="button" onClick={handleSavePreset}>
        Save
      </button>
      {selectedPresetId && (
        <>
          <button className="button" onClick={() => handleUpdatePreset(selectedPresetId)}>
            Update
          </button>
          <button className="button delete" onClick={() => handleDeletePreset(selectedPresetId)}>
            Delete
          </button>
        </>
      )}
    </div>
  );
};

PresetButtons.propTypes = {
  handleDeletePreset: PropTypes.func.isRequired,
  handleSavePreset: PropTypes.func.isRequired,
  handleUpdatePreset: PropTypes.func.isRequired,
  selectedPresetId: PropTypes.string,
};

export default PresetButtons;
