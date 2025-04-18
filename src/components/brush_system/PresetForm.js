/**
 * PresetForm component for PresetEditor
 */
import PropTypes from 'prop-types';

/**
 * Component for preset input form
 */
const PresetForm = ({ presetCategory, presetName, setPresetCategory, setPresetName }) => {
  return (
    <div className="preset-input-group">
      <input
        className="preset-name-input"
        placeholder="Preset name"
        type="text"
        value={presetName}
        onChange={e => setPresetName(e.target.value)}
      />
      <select
        className="preset-category-select"
        value={presetCategory}
        onChange={e => setPresetCategory(e.target.value)}
      >
        <option value="brush">Brush</option>
        <option value="pattern">Pattern</option>
        <option value="gradient">Gradient</option>
      </select>
    </div>
  );
};

PresetForm.propTypes = {
  presetCategory: PropTypes.string.isRequired,
  presetName: PropTypes.string.isRequired,
  setPresetCategory: PropTypes.func.isRequired,
  setPresetName: PropTypes.func.isRequired,
};

export default PresetForm;
