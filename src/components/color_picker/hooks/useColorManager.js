import { useState, useMemo, useCallback } from 'react';
import {
  generateComplementary,
  generateAnalogous,
  adjustBrightness,
  blendColors,
  validatePalette,
} from '../../../utils/color/colorCore';

// Preset color data
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

/**
 * Custom hook for managing color palettes, gradients, and color tools
 */
const useColorManager = ({ onApplyGradient, onApplyPalette, setColorAnchors, setRecentColors }) => {
  // State for custom color data
  const [customPalettes, setCustomPalettes] = useState([]);
  const [customGradients, setCustomGradients] = useState([]);

  // Combine preset and custom data
  const allPalettes = useMemo(() => [...presets.palettes, ...customPalettes], [customPalettes]);

  const allGradients = useMemo(() => [...presets.gradients, ...customGradients], [customGradients]);

  // Handler for adding custom palettes
  const handleAddPalette = useCallback(palette => {
    if (validatePalette(palette)) {
      setCustomPalettes(prev => [...prev, palette]);
    } else {
      alert('Invalid palette format. Ensure all colors are valid HEX codes.');
    }
  }, []);

  // Handler for adding custom gradients
  const handleAddGradient = useCallback(gradient => {
    setCustomGradients(prev => [...prev, gradient]);
  }, []);

  // Generate complementary colors
  const handleGenerateComplementary = useCallback(
    baseColor => {
      const complementary = generateComplementary(baseColor);
      setCustomPalettes(prev => [...prev, complementary]);
      onApplyPalette(complementary);
    },
    [onApplyPalette]
  );

  // Generate analogous colors
  const handleGenerateAnalogous = useCallback(
    baseColor => {
      const analogous = generateAnalogous(baseColor);
      setCustomPalettes(prev => [...prev, analogous]);
      onApplyPalette(analogous);
    },
    [onApplyPalette]
  );

  // Adjust brightness of a color
  const handleAdjustBrightness = useCallback(
    (color, amount) => {
      const adjusted = adjustBrightness(color, amount);
      addColorToRecent(adjusted, setRecentColors);
      return adjusted;
    },
    [setRecentColors]
  );

  // Blend two colors
  const handleBlendColors = useCallback(
    (color1, color2, ratio) => {
      const blended = blendColors(color1, color2, ratio);
      addColorToRecent(blended, setRecentColors);
      return blended;
    },
    [setRecentColors]
  );

  return {
    allPalettes,
    allGradients,
    handleAddPalette,
    handleAddGradient,
    handleGenerateComplementary,
    handleGenerateAnalogous,
    handleAdjustBrightness,
    handleBlendColors,
  };
};

/**
 * Adds a color to the recent colors list, maintaining a limit of 5.
 */
export const addColorToRecent = (color, setRecentColors) => {
  setRecentColors(prev => {
    return [color, ...prev.filter(c => c !== color)].slice(0, 5);
  });
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

export default useColorManager;
