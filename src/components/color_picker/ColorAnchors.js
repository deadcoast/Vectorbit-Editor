// File: src/components/ColorPicker/ColorAnchors.js
import PropTypes from 'prop-types';
import { useState } from 'react';

import { useAnchorHistory } from '../../state/useAnchorHistory';
import { generateComplementary, rotateHue } from '../../utils/color/colorCore';

/**
 * Manages gradient history operations
 */
const useGradientHistory = (initialGradients = []) => {
  const [gradientHistory, setGradientHistory] = useState(initialGradients);
  const [gradientHistoryIndex, setGradientHistoryIndex] = useState(-1);

  const updateHistory = gradient => {
    const updatedHistory = [...gradientHistory.slice(0, gradientHistoryIndex + 1), gradient];
    setGradientHistory(updatedHistory);
    setGradientHistoryIndex(updatedHistory.length - 1);
  };

  const undoGradient = () => {
    if (gradientHistoryIndex > 0) {
      setGradientHistoryIndex(gradientHistoryIndex - 1);
      return gradientHistory[gradientHistoryIndex - 1];
    }
    return null;
  };

  const redoGradient = () => {
    if (gradientHistoryIndex < gradientHistory.length - 1) {
      setGradientHistoryIndex(gradientHistoryIndex + 1);
      return gradientHistory[gradientHistoryIndex + 1];
    }
    return null;
  };

  return {
    gradientHistory,
    gradientHistoryIndex,
    updateHistory,
    undoGradient,
    redoGradient,
    canUndo: gradientHistoryIndex > 0,
    canRedo: gradientHistoryIndex < gradientHistory.length - 1,
  };
};

/**
 * Handles anchor-related operations
 */
const useAnchorOperations = ({
  colorAnchors,
  setLocalColorAnchors,
  setColorAnchors,
  updateColorAnchor,
  addToHistory,
}) => {
  const handleColorChange = (anchor, newColor) => {
    const updatedAnchors = { ...colorAnchors, [anchor]: newColor };
    addToHistory(updatedAnchors);
    updateColorAnchor(anchor, newColor);
    setLocalColorAnchors(updatedAnchors);
    setColorAnchors(updatedAnchors);
  };

  const handleAddAnchor = () => {
    const newAnchorName = `anchor${Object.keys(colorAnchors).length + 1}`;
    handleColorChange(newAnchorName, '#FFFFFF');
  };

  const handleRemoveAnchor = anchorName => {
    const updatedAnchors = { ...colorAnchors };
    delete updatedAnchors[anchorName];
    addToHistory(updatedAnchors);
    setLocalColorAnchors(updatedAnchors);
    setColorAnchors(updatedAnchors);
  };

  return {
    handleColorChange,
    handleAddAnchor,
    handleRemoveAnchor,
  };
};

/**
 * Creates anchor event handlers for managing undo/redo operations
 */
const useHistoryEvents = ({ undo, redo, setLocalColorAnchors, setColorAnchors }) => {
  const handleUndo = () => {
    const previousAnchors = undo();
    if (previousAnchors) {
      setLocalColorAnchors(previousAnchors);
      setColorAnchors(previousAnchors);
    }
  };

  const handleRedo = () => {
    const nextAnchors = redo();
    if (nextAnchors) {
      setLocalColorAnchors(nextAnchors);
      setColorAnchors(nextAnchors);
    }
  };

  return { handleUndo, handleRedo };
};

/**
 * Handles anchor color operations like complementary and rotation
 */
const useColorOperations = () => {
  // This hook is a placeholder for future color operations
  // All implementations are now directly in the ColorTransformations hook
  return {};
};

/**
 * Custom hook for anchor management operations
 */
const useAnchorManagement = ({
  colorAnchors,
  setLocalColorAnchors,
  setColorAnchors,
  addToHistory,
}) => {
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

  return { handleRenameAnchor, handleDeleteAnchor };
};

/**
 * Custom hook for color transformations
 */
const useColorTransformations = ({ colorAnchors, handleColorChange }) => {
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

  return { handleGenerateComplementary, handleRotateHue };
};

/**
 * Custom hook for gradient history handlers
 */
const useGradientHandlers = ({ undoGradient, redoGradient, setColorAnchors }) => {
  const handleUndoGradient = () => {
    const previousGradient = undoGradient();
    if (previousGradient) {
      setColorAnchors(previousGradient);
    }
  };

  const handleRedoGradient = () => {
    const nextGradient = redoGradient();
    if (nextGradient) {
      setColorAnchors(nextGradient);
    }
  };

  return { handleUndoGradient, handleRedoGradient };
};

/**
 * Renders color anchor UI elements
 */
const renderColorAnchors = props => {
  const {
    colorAnchors,
    handleColorChange,
    handleRenameAnchor,
    handleDeleteAnchor,
    handleGenerateComplementary,
    handleRotateHue,
    undo,
    redo,
    handleUndo,
    handleRedo,
    handleAddAnchor,
    canUndoGradient,
    canRedoGradient,
    handleUndoGradient,
    handleRedoGradient,
  } = props;
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
        <button disabled={!canUndoGradient} onClick={handleUndoGradient}>
          Undo Gradient
        </button>
        <button disabled={!canRedoGradient} onClick={handleRedoGradient}>
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

/**
 * Component for managing color anchors in a gradient or palette
 */
const ColorAnchors = ({ defaultAnchors, setColorAnchors, updateColorAnchor }) => {
  const { addToHistory, undo, redo } = useAnchorHistory();
  const [colorAnchors, setLocalColorAnchors] = useState(defaultAnchors || {});

  // Use custom hooks for history management
  const {
    undoGradient,
    redoGradient,
    canUndo: canUndoGradient,
    canRedo: canRedoGradient,
  } = useGradientHistory([]);

  // Use anchor operations hook
  const { handleColorChange, handleAddAnchor } = useAnchorOperations({
    colorAnchors,
    setLocalColorAnchors,
    setColorAnchors,
    updateColorAnchor,
    addToHistory,
  });

  // Create history event handlers
  const { handleUndo, handleRedo } = useHistoryEvents({
    undo,
    redo,
    setLocalColorAnchors,
    setColorAnchors,
  });

  // We don't need color operations currently as they're implemented directly
  useColorOperations();

  // Extract anchor management functionality to a custom hook
  const { handleRenameAnchor, handleDeleteAnchor } = useAnchorManagement({
    colorAnchors,
    setLocalColorAnchors,
    setColorAnchors,
    addToHistory,
  });

  // Use color transformation hook for complementary and hue rotation
  const { handleGenerateComplementary, handleRotateHue } = useColorTransformations({
    colorAnchors,
    handleColorChange,
  });

  // Use gradient history handlers hook
  const { handleUndoGradient, handleRedoGradient } = useGradientHandlers({
    undoGradient,
    redoGradient,
    setColorAnchors,
  });

  // Render the UI using the extracted component
  return renderColorAnchors({
    colorAnchors,
    handleColorChange,
    handleRenameAnchor,
    handleDeleteAnchor,
    handleGenerateComplementary,
    handleRotateHue,
    undo,
    redo,
    handleUndo,
    handleRedo,
    handleAddAnchor,
    canUndoGradient,
    canRedoGradient,
    handleUndoGradient,
    handleRedoGradient,
  });
};

ColorAnchors.propTypes = {
  defaultAnchors: PropTypes.object, // Object of color anchors
  setColorAnchors: PropTypes.func.isRequired, // Function to update color anchors
  updateColorAnchor: PropTypes.func.isRequired, // Function to update a single anchor
};

export default ColorAnchors;
