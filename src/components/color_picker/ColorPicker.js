// File: src/components/ColorPicker/ColorPicker.js
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';

// ColorContext is used within the custom hook
import useColorPicker from './hooks/useColorPicker';
import './ColorPicker.css';

// Gradient Generator Component
const GradientGenerator = ({
  gradientPreviewRef,
  gradientStyle,
  gradientStops,
  gradientStart,
  gradientEnd,
  handleGradientSave,
  handleGradientStopMouseDown,
  handleGradientStopKeyDown,
  setGradientStart,
  setGradientEnd,
}) => (
  <div className="gradient-generator">
    <h4>Gradient Generator</h4>
    <div ref={gradientPreviewRef} className="gradient-preview" style={gradientStyle}>
      {gradientStops.map((stop, index) => (
        <div
          key={index}
          aria-label={`Gradient stop ${index + 1}`}
          aria-valuemax="100"
          aria-valuemin="0"
          aria-valuenow={stop}
          className="gradient-stop"
          role="slider"
          style={{ left: `${stop}%` }}
          tabIndex="0"
          onKeyDown={handleGradientStopKeyDown(index, stop)}
          onMouseDown={handleGradientStopMouseDown(index)}
        />
      ))}
    </div>
    <input
      title="Set gradient start color"
      type="color"
      value={gradientStart}
      onChange={e => setGradientStart(e.target.value)}
    />
    <input
      title="Set gradient end color"
      type="color"
      value={gradientEnd}
      onChange={e => setGradientEnd(e.target.value)}
    />
    <button title="Save Gradient" onClick={handleGradientSave}>
      Save Gradient
    </button>
  </div>
);

// Recent Colors Component
const RecentColors = ({ recentColors, handleColorChange }) => (
  <div className="color-history">
    <h4>Recent Colors</h4>
    <div className="color-history-grid">
      {recentColors.map((color, index) => (
        <div
          key={index}
          aria-label={`Select color ${color}`}
          className="color-history-item"
          data-hex={color}
          role="button"
          style={{ backgroundColor: color }}
          tabIndex="0"
          title={color}
          onClick={() => handleColorChange({ hex: color })}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleColorChange({ hex: color });
              e.preventDefault();
            }
          }}
        />
      ))}
    </div>
  </div>
);

// Palette Management Component
const PaletteManagement = ({
  handleLoadPalette,
  handleSavePalette,
  paletteName,
  savedPalettes,
  setPaletteName,
}) => (
  <div className="palette-management">
    <input
      placeholder="Enter palette name"
      title="Save palette with a name"
      type="text"
      value={paletteName}
      onChange={e => setPaletteName(e.target.value)}
    />
    <button title="Save current palette" onClick={handleSavePalette}>
      Save Palette
    </button>
    <select title="Load a saved palette" onChange={e => handleLoadPalette(e.target.value)}>
      <option value="">Load Palette</option>
      {Object.keys(savedPalettes).map(name => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  </div>
);

// Action Buttons Component
const ActionButtons = ({ activeColor, onAddToPalette, onAssignToAnchor }) => (
  <div className="actions">
    <button title="Add current color to palette" onClick={() => onAddToPalette(activeColor)}>
      Add to Palette
    </button>
    <button title="Assign current color to an anchor" onClick={() => onAssignToAnchor(activeColor)}>
      Assign to Anchor
    </button>
  </div>
);

// Main ColorPicker Component
const ColorPicker = ({ onAddToPalette, onAssignToAnchor, gridRef }) => {
  const {
    activeColor,
    recentColors,
    gradientStops,
    gradientStart,
    gradientEnd,
    gradientPreviewRef,
    gradientStyle,
    paletteName,
    savedPalettes,
    eyeDropperActive,
    setPaletteName,
    setGradientStart,
    setGradientEnd,
    handleColorChange,
    handleEyeDropperToggle,
    handleEyeDropper,
    handleGradientSave,
    handleSavePalette,
    handleLoadPalette,
    handleGradientStopMouseDown,
    handleGradientStopKeyDown,
  } = useColorPicker({ onAddToPalette, onAssignToAnchor, gridRef });

  return (
    <div className="color-picker">
      <SketchPicker color={activeColor} onChangeComplete={handleColorChange} />

      <GradientGenerator
        gradientEnd={gradientEnd}
        gradientPreviewRef={gradientPreviewRef}
        gradientStart={gradientStart}
        gradientStops={gradientStops}
        gradientStyle={gradientStyle}
        handleGradientSave={handleGradientSave}
        handleGradientStopKeyDown={handleGradientStopKeyDown}
        handleGradientStopMouseDown={handleGradientStopMouseDown}
        setGradientEnd={setGradientEnd}
        setGradientStart={setGradientStart}
      />

      <RecentColors handleColorChange={handleColorChange} recentColors={recentColors} />

      <PaletteManagement
        handleLoadPalette={handleLoadPalette}
        handleSavePalette={handleSavePalette}
        paletteName={paletteName}
        savedPalettes={savedPalettes}
        setPaletteName={setPaletteName}
      />

      {gridRef && (
        <button
          className="eyedropper-button"
          title="Activate Eye Dropper Tool"
          onMouseDown={handleEyeDropper}
        >
          Eye Dropper
        </button>
      )}
      <button onClick={handleEyeDropperToggle}>
        {eyeDropperActive ? 'Deactivate Eye Dropper' : 'Activate Eye Dropper'}
      </button>

      <ActionButtons
        activeColor={activeColor}
        onAddToPalette={onAddToPalette}
        onAssignToAnchor={onAssignToAnchor}
      />
    </div>
  );
};

// PropTypes validation for components
GradientGenerator.propTypes = {
  gradientEnd: PropTypes.string.isRequired,
  gradientPreviewRef: PropTypes.object.isRequired,
  gradientStart: PropTypes.string.isRequired,
  gradientStops: PropTypes.array.isRequired,
  gradientStyle: PropTypes.object.isRequired,
  handleGradientSave: PropTypes.func.isRequired,
  handleGradientStopKeyDown: PropTypes.func.isRequired,
  handleGradientStopMouseDown: PropTypes.func.isRequired,
  setGradientEnd: PropTypes.func.isRequired,
  setGradientStart: PropTypes.func.isRequired,
};

RecentColors.propTypes = {
  handleColorChange: PropTypes.func.isRequired,
  recentColors: PropTypes.array.isRequired,
};

PaletteManagement.propTypes = {
  handleLoadPalette: PropTypes.func.isRequired,
  handleSavePalette: PropTypes.func.isRequired,
  paletteName: PropTypes.string.isRequired,
  savedPalettes: PropTypes.object.isRequired,
  setPaletteName: PropTypes.func.isRequired,
};

ActionButtons.propTypes = {
  activeColor: PropTypes.string.isRequired,
  onAddToPalette: PropTypes.func.isRequired,
  onAssignToAnchor: PropTypes.func.isRequired,
};

// PropTypes validation for main component
ColorPicker.propTypes = {
  gridRef: PropTypes.shape({
    current: PropTypes.any,
  }),
  onAddToPalette: PropTypes.func.isRequired,
  onAssignToAnchor: PropTypes.func.isRequired,
};

export default ColorPicker;
