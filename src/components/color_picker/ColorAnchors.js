// File: src/components/ColorPicker/ColorAnchors.js
import PropTypes from 'prop-types';
import { useState } from 'react';

import { useAnchorHistory } from '../../state/useAnchorHistory';
import { generateComplementary, rotateHue } from '../../utils/color/colorCore';

const ColorAnchors = ({ defaultAnchors, setColorAnchors, updateColorAnchor }) => {
  const { addToHistory, undo, redo } = useAnchorHistory();
  const [colorAnchors, setLocalColorAnchors] = useState(defaultAnchors || {});
  const [gradientHistory, setGradientHistory] = useState([]);
  const [gradientHistoryIndex, setGradientHistoryIndex] = useState(-1);

  // Handles color changes and saves to history
  const handleColorChange = (anchor, newColor) => {
    const updatedAnchors = { ...colorAnchors, [anchor]: newColor };
    addToHistory(updatedAnchors);
    updateColorAnchor(anchor, newColor);
    setLocalColorAnchors(updatedAnchors);
    setColorAnchors(updatedAnchors);
  };

  // Undo functionality for color anchors
  const handleUndo = () => {
    const previousAnchors = undo();
    if (previousAnchors) {
      setLocalColorAnchors(previousAnchors);
      setColorAnchors(previousAnchors);
    }
  };

  // Redo functionality for color anchors
  const handleRedo = () => {
    const nextAnchors = redo();
    if (nextAnchors) {
      setLocalColorAnchors(nextAnchors);
      setColorAnchors(nextAnchors);
    }
  };

  // Add a new anchor
  const handleAddAnchor = () => {
    const newAnchorName = prompt('Enter a name for the new anchor:');
    if (newAnchorName && !colorAnchors[newAnchorName]) {
      const updatedAnchors = { ...colorAnchors, [newAnchorName]: '#ffffff' };
      addToHistory(updatedAnchors);
      setLocalColorAnchors(updatedAnchors);
      setColorAnchors(updatedAnchors);
    }
  };

  // Rename an existing anchor
  const handleRenameAnchor = oldName => {
    const newName = prompt(`Rename "${oldName}" to:`);
    if (newName && !colorAnchors[newName]) {
      const updatedAnchors = { ...colorAnchors };
      updatedAnchors[newName] = updatedAnchors[oldName];
      delete updatedAnchors[oldName];
      addToHistory(updatedAnchors);
      setLocalColorAnchors(updatedAnchors);
      setColorAnchors(updatedAnchors);
    } else if (colorAnchors[newName]) {
      alert('Anchor with this name already exists.');
    }
  };

  // Delete an existing anchor
  const handleDeleteAnchor = name => {
    if (confirm(`Are you sure you want to delete the anchor: "${name}"?`)) {
      const updatedAnchors = { ...colorAnchors };
      delete updatedAnchors[name];
      addToHistory(updatedAnchors);
      setLocalColorAnchors(updatedAnchors);
      setColorAnchors(updatedAnchors);
    }
  };

  // Generate complementary color for an anchor
  const handleGenerateComplementary = anchor => {
    const complementaryColor = generateComplementary(colorAnchors[anchor])[1];
    handleColorChange(anchor, complementaryColor);
  };

  // Adjust hue of an anchor
  const handleRotateHue = (anchor, angle) => {
    const newColor = rotateHue(colorAnchors[anchor], angle);
    handleColorChange(anchor, newColor);
  };

  // Undo functionality for gradients
  const handleUndoGradient = () => {
    if (gradientHistoryIndex > 0) {
      setGradientHistoryIndex(gradientHistoryIndex - 1);
      const previousGradient = gradientHistory[gradientHistoryIndex - 1];
      setColorAnchors(previousGradient);
    }
  };

  // Redo functionality for gradients
  const handleRedoGradient = () => {
    if (gradientHistoryIndex < gradientHistory.length - 1) {
      setGradientHistoryIndex(gradientHistoryIndex + 1);
      const nextGradient = gradientHistory[gradientHistoryIndex + 1];
      setColorAnchors(nextGradient);
    }
  };

  // Add a new gradient to history
  const addGradientToHistory = gradient => {
    const updatedHistory = [...gradientHistory.slice(0, gradientHistoryIndex + 1), gradient];
    setGradientHistory(updatedHistory);
    setGradientHistoryIndex(updatedHistory.length - 1);
  };

  return (
    <div className="color-anchors-popup">
      <h3>Color Anchors</h3>
      <div className="action-buttons">
        <button disabled={!undo} onClick={handleUndo}>
          Undo Anchors
        </button>
        <button disabled={!redo} onClick={handleRedo}>
          Redo Anchors
        </button>
        <button onClick={handleAddAnchor}>Add Anchor</button>
        <button disabled={gradientHistoryIndex <= 0} onClick={handleUndoGradient}>
          Undo Gradient
        </button>
        <button
          disabled={gradientHistoryIndex >= gradientHistory.length - 1}
          onClick={handleRedoGradient}
        >
          Redo Gradient
        </button>
      </div>
      <div className="anchor-list">
        {Object.keys(colorAnchors).map(anchor => (
          <div key={anchor} className="color-anchor">
            <label>{anchor.replace(/([A-Z])/g, ' $1')}</label>
            <input
              type="color"
              value={colorAnchors[anchor]}
              onChange={e => handleColorChange(anchor, e.target.value)}
            />
            <button onClick={() => handleRenameAnchor(anchor)}>Rename</button>
            <button onClick={() => handleDeleteAnchor(anchor)}>Delete</button>
            <button onClick={() => handleGenerateComplementary(anchor)}>Complementary</button>
            <button onClick={() => handleRotateHue(anchor, 30)}>Rotate +30°</button>
            <button onClick={() => handleRotateHue(anchor, -30)}>Rotate -30°</button>
          </div>
        ))}
      </div>
    </div>
  );
};

ColorAnchors.propTypes = {
  defaultAnchors: PropTypes.object, // Object of color anchors
  setColorAnchors: PropTypes.func.isRequired, // Function to update color anchors
  updateColorAnchor: PropTypes.func.isRequired, // Function to update a single anchor
};

export default ColorAnchors;
