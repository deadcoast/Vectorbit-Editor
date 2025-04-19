// File: src/components/ColorPicker/ColorWheel.js
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import React, { useContext, useState, useCallback, useMemo } from 'react';
import { SketchPicker } from 'react-color';

import { ColorContext } from './ColorContext';
import GradientEditor from './GradientEditor';
import './ColorWheel.css';

// Extracted color picker component to reduce main component size
const ColorPickerSection = ({
  activeColor,
  handleColorChange,
  showAdvancedPicker,
  togglePicker,
}) => (
  <div className="color-picker-container">
    {showAdvancedPicker ? (
      <SketchPicker
        color={activeColor}
        title="Advanced Color Picker"
        onChangeComplete={handleColorChange}
      />
    ) : (
      <input
        title="Basic Color Picker"
        type="color"
        value={activeColor}
        onChange={e => handleColorChange({ hex: e.target.value })}
      />
    )}
    <button title="Toggle Picker" onClick={togglePicker}>
      {showAdvancedPicker ? 'Basic Picker' : 'Advanced Picker'}
    </button>
  </div>
);

ColorPickerSection.propTypes = {
  activeColor: PropTypes.string.isRequired,
  handleColorChange: PropTypes.func.isRequired,
  showAdvancedPicker: PropTypes.bool.isRequired,
  togglePicker: PropTypes.func.isRequired,
};

// Recent colors display component
const RecentColorsSection = ({ recentColors, handleColorChange }) => {
  const renderedRecentColors = useMemo(
    () =>
      recentColors.map((color, index) => (
        <div
          key={index}
          aria-label={`Select color ${color}`}
          className="recent-color"
          role="button"
          style={{ backgroundColor: color }}
          tabIndex={0}
          title={color}
          onClick={() => handleColorChange({ hex: color })}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleColorChange({ hex: color });
            }
          }}
        />
      )),
    [recentColors, handleColorChange]
  );

  return (
    <div className="recent-colors">
      <h4 title="Recently used colors">Recent Colors</h4>
      <div className="recent-colors-grid">{renderedRecentColors}</div>
    </div>
  );
};

RecentColorsSection.propTypes = {
  handleColorChange: PropTypes.func.isRequired,
  recentColors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// Action buttons component
const ActionButtons = ({ activeColor, onAddToPalette, onAssignToAnchor }) => (
  <div className="color-actions">
    <button
      aria-label="Add to palette"
      title="Add to palette"
      onClick={() => onAddToPalette(activeColor)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onAddToPalette(activeColor);
        }
      }}
    >
      Add to Palette
    </button>
    <button
      aria-label="Assign to anchor"
      title="Assign to anchor"
      onClick={() => onAssignToAnchor(activeColor)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onAssignToAnchor(activeColor);
        }
      }}
    >
      Assign to Anchor
    </button>
  </div>
);

ActionButtons.propTypes = {
  activeColor: PropTypes.string.isRequired,
  onAddToPalette: PropTypes.func.isRequired,
  onAssignToAnchor: PropTypes.func.isRequired,
};

// Main ColorWheel component
const ColorWheel = ({ onAddToPalette, onAssignToAnchor, allowDynamicSelection = false }) => {
  const { activeColor, setActiveColor, recentColors, addToRecentColors } = useContext(ColorContext);
  const [showAdvancedPicker, setShowAdvancedPicker] = useState(false);

  // Debounced color change handler for smoother UI
  const debouncedColorChange = useCallback(
    debounce(color => setActiveColor(color), 300),
    []
  );

  const handleColorChange = color => {
    const hexColor = color.hex || color;
    setActiveColor(hexColor);
    addToRecentColors(hexColor);
  };

  // Handle toggling the color picker type
  const togglePicker = () => {
    setShowAdvancedPicker(!showAdvancedPicker);
  };

  return (
    <div className="color-wheel">
      {/* Current Color Preview */}
      <div className="color-preview" title="Current selected color">
        <span style={{ backgroundColor: activeColor }} />
        <span>{activeColor}</span>
      </div>

      {/* Color Picker */}
      <ColorPickerSection
        activeColor={activeColor}
        handleColorChange={handleColorChange}
        showAdvancedPicker={showAdvancedPicker}
        togglePicker={togglePicker}
      />

      {/* Gradient Editor (extracted to separate component) */}
      <GradientEditor activeColor={activeColor} />

      {/* Recent Colors */}
      <RecentColorsSection handleColorChange={handleColorChange} recentColors={recentColors} />

      {/* Action Buttons */}
      <ActionButtons
        activeColor={activeColor}
        onAddToPalette={onAddToPalette}
        onAssignToAnchor={onAssignToAnchor}
      />
    </div>
  );
};

ColorWheel.propTypes = {
  allowDynamicSelection: PropTypes.bool,
  onAddToPalette: PropTypes.func.isRequired,
  onAssignToAnchor: PropTypes.func.isRequired,
};

ColorWheel.defaultProps = {
  allowDynamicSelection: false,
};

export default React.memo(ColorWheel);
