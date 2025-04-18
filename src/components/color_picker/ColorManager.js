// File: src/components/ColorPicker/ColorManager.js
import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';

import './ColorManager.css';
import {
  generateComplementary,
  generateAnalogous,
  adjustBrightness,
  blendColors,
  validatePalette,
} from '../../utils/color/colorCore';

const presets = {
  gradients: [
    'linear-gradient(to right, #ff7e5f, #feb47b)',
    'linear-gradient(to right, #6a11cb, #2575fc)',
    'linear-gradient(to right, #00c6ff, #0072ff)',
  ],
  palettes: [
    ['#ff7e5f', '#feb47b', '#ff6f91'],
    ['#6a11cb', '#2575fc', '#00c6ff'],
    ['#ffdd00', '#ff8800', '#ff2200'],
  ],
};

const ColorManager = ({
  onApplyGradient,
  onApplyPalette,
  colorAnchors,
  setColorAnchors,
  recentColors,
  setRecentColors,
}) => {
  const [customPalettes, setCustomPalettes] = useState([]);
  const [customGradients, setCustomGradients] = useState([]);

  const allPalettes = useMemo(() => [...presets.palettes, ...customPalettes], [customPalettes]);

  const allGradients = useMemo(() => [...presets.gradients, ...customGradients], [customGradients]);

  const handleAddPalette = palette => {
    if (validatePalette(palette)) {
      setCustomPalettes(prev => [...prev, palette]);
    } else {
      alert('Invalid palette format. Ensure all colors are valid HEX codes.');
    }
  };

  const handleAddGradient = gradient => {
    setCustomGradients(prev => [...prev, gradient]);
  };

  const handleGenerateComplementary = baseColor => {
    const complementary = generateComplementary(baseColor);
    setCustomPalettes(prev => [...prev, complementary]);
    onApplyPalette(complementary);
  };

  const handleGenerateAnalogous = baseColor => {
    const analogous = generateAnalogous(baseColor);
    setCustomPalettes(prev => [...prev, analogous]);
    onApplyPalette(analogous);
  };

  const handleAdjustBrightness = (color, amount) => {
    const adjusted = adjustBrightness(color, amount);
    addColorToRecent(adjusted, setRecentColors);
    return adjusted;
  };

  const handleBlendColors = (color1, color2, ratio) => {
    const blended = blendColors(color1, color2, ratio);
    addColorToRecent(blended, setRecentColors);
    return blended;
  };

  return (
    <div className="color-manager">
      <h4>Preset Gradients</h4>
      <div className="preset-gradients">
        {allGradients.map((gradient, index) => (
          <div
            key={index}
            aria-label={`Apply gradient ${index + 1}`}
            className="preset-gradient"
            role="button"
            style={{ background: gradient }}
            tabIndex="0"
            title={`Apply Gradient: ${gradient}`}
            onClick={() => onApplyGradient(gradient)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                onApplyGradient(gradient);
                e.preventDefault();
              }
            }}
          />
        ))}
      </div>
      <button onClick={() => handleAddGradient(prompt('Enter gradient CSS:'))}>
        Add Custom Gradient
      </button>

      <h4>Preset Palettes</h4>
      <div className="preset-palettes">
        {allPalettes.map((palette, index) => (
          <div
            key={index}
            aria-label={`Apply palette ${index + 1}`}
            className="preset-palette"
            role="button"
            tabIndex="0"
            title={`Apply Palette ${index + 1}`}
            onClick={() => onApplyPalette(palette)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                onApplyPalette(palette);
                e.preventDefault();
              }
            }}
          >
            {palette.map((color, idx) => (
              <span
                key={idx}
                className="preset-color"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={() => handleAddPalette(prompt('Enter HEX colors separated by commas:').split(','))}
      >
        Add Custom Palette
      </button>

      <h4>Dynamic Color Tools</h4>
      <button onClick={() => handleGenerateComplementary('#ff7e5f')}>Generate Complementary</button>
      <button onClick={() => handleGenerateAnalogous('#6a11cb')}>Generate Analogous</button>
      <button onClick={() => alert(handleAdjustBrightness('#ff7e5f', 20))}>Brighten Color</button>
      <button onClick={() => alert(handleBlendColors('#ff7e5f', '#2575fc', 0.5))}>
        Blend Colors
      </button>

      <h4>Color Anchors</h4>
      {Object.entries(colorAnchors).map(([anchor, color], index) => (
        <div key={index} className="color-anchor">
          <label>{anchor}</label>
          <input
            type="color"
            value={color}
            onChange={e =>
              setColorAnchors(prev => ({
                ...prev,
                [anchor]: e.target.value,
              }))
            }
          />
        </div>
      ))}

      <h4>Recent Colors</h4>
      <div className="recent-colors">
        {recentColors.map((color, index) => (
          <span
            key={index}
            aria-label={`Use recent color ${color}`}
            className="recent-color"
            role="button"
            style={{ backgroundColor: color }}
            tabIndex="0"
            title={color}
            onClick={() => setRecentColors(prev => [color, ...prev])}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setRecentColors(prev => [color, ...prev]);
                e.preventDefault();
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Updates a specific color anchor with a new color.
 */
export const updateColorAnchor = (anchor, color, setColorAnchors) => {
  setColorAnchors(prev => ({
    ...prev,
    [anchor]: color,
  }));
};

/**
 * Adds a color to the recent colors list, maintaining a limit of 5.
 */
export const addColorToRecent = (color, setRecentColors) => {
  setRecentColors(prev => {
    return [color, ...prev.filter(c => c !== color)].slice(0, 5);
  });
};

// Add PropTypes validation
ColorManager.propTypes = {
  colorAnchors: PropTypes.object.isRequired,
  onApplyGradient: PropTypes.func.isRequired,
  onApplyPalette: PropTypes.func.isRequired,
  recentColors: PropTypes.array.isRequired,
  setColorAnchors: PropTypes.func.isRequired,
  setRecentColors: PropTypes.func.isRequired,
};

export default ColorManager;
