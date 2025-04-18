import PropTypes from 'prop-types';

import './ColorManager.css';
import useColorManager from './hooks/useColorManager';

// Gradient section component to reduce main component size
const GradientSection = ({ allGradients, onApplyGradient, handleAddGradient }) => (
  <>
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
  </>
);

// Palette section component to reduce main component size
const PaletteSection = ({ allPalettes, onApplyPalette, handleAddPalette }) => (
  <>
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
  </>
);

// Color anchors section component
const ColorAnchorsSection = ({ colorAnchors, setColorAnchors }) => (
  <>
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
  </>
);

// Recent colors section component
const RecentColorsSection = ({ recentColors, setRecentColors }) => (
  <>
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
  </>
);

// Main ColorManager component
const ColorManager = ({
  onApplyGradient,
  onApplyPalette,
  colorAnchors,
  setColorAnchors,
  recentColors,
  setRecentColors,
}) => {
  // Use the custom hook for color management logic
  const {
    allPalettes,
    allGradients,
    handleAddPalette,
    handleAddGradient,
    handleGenerateComplementary,
    handleGenerateAnalogous,
    handleAdjustBrightness,
    handleBlendColors,
  } = useColorManager({
    onApplyGradient,
    onApplyPalette,
    setColorAnchors,
    setRecentColors,
  });

  return (
    <div className="color-manager">
      <GradientSection
        allGradients={allGradients}
        handleAddGradient={handleAddGradient}
        onApplyGradient={onApplyGradient}
      />

      <PaletteSection
        allPalettes={allPalettes}
        handleAddPalette={handleAddPalette}
        onApplyPalette={onApplyPalette}
      />

      <h4>Dynamic Color Tools</h4>
      <button onClick={() => handleGenerateComplementary('#ff7e5f')}>Generate Complementary</button>
      <button onClick={() => handleGenerateAnalogous('#6a11cb')}>Generate Analogous</button>
      <button onClick={() => alert(handleAdjustBrightness('#ff7e5f', 20))}>Brighten Color</button>
      <button onClick={() => alert(handleBlendColors('#ff7e5f', '#2575fc', 0.5))}>
        Blend Colors
      </button>

      <ColorAnchorsSection colorAnchors={colorAnchors} setColorAnchors={setColorAnchors} />

      <RecentColorsSection recentColors={recentColors} setRecentColors={setRecentColors} />
    </div>
  );
};

// Add PropTypes validation for section components
GradientSection.propTypes = {
  allGradients: PropTypes.array.isRequired,
  handleAddGradient: PropTypes.func.isRequired,
  onApplyGradient: PropTypes.func.isRequired,
};

PaletteSection.propTypes = {
  allPalettes: PropTypes.array.isRequired,
  handleAddPalette: PropTypes.func.isRequired,
  onApplyPalette: PropTypes.func.isRequired,
};

ColorAnchorsSection.propTypes = {
  colorAnchors: PropTypes.object.isRequired,
  setColorAnchors: PropTypes.func.isRequired,
};

RecentColorsSection.propTypes = {
  recentColors: PropTypes.array.isRequired,
  setRecentColors: PropTypes.func.isRequired,
};

// Add PropTypes validation for main component
ColorManager.propTypes = {
  colorAnchors: PropTypes.object.isRequired,
  onApplyGradient: PropTypes.func.isRequired,
  onApplyPalette: PropTypes.func.isRequired,
  recentColors: PropTypes.array.isRequired,
  setColorAnchors: PropTypes.func.isRequired,
  setRecentColors: PropTypes.func.isRequired,
};

export default ColorManager;
