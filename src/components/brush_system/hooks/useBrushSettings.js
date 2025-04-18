/**
 * Custom hook for managing brush settings
 */
import { useState } from 'react';

import { PATTERN_TYPES } from '../../../utils/patterns/ProceduralGenerator';
import { BRUSH_TYPES, BRUSH_EFFECTS, BRUSH_BLEND_MODES, SYMMETRY_MODES } from '../BrushManager';

/**
 * Hook for managing brush settings state
 *
 * @param {object} options - Initial settings
 * @param {string} options.activeColor - Initial active color
 * @returns {object} Brush settings and setters
 */
const useBrushSettings = ({ activeColor }) => {
  // Brush state
  const [brushType, setBrushType] = useState(BRUSH_TYPES.FILLED);
  const [brushEffect, setBrushEffect] = useState(BRUSH_EFFECTS.NONE);
  const [blendMode, setBlendMode] = useState(BRUSH_BLEND_MODES.NORMAL);
  const [symmetryMode, setSymmetryMode] = useState(SYMMETRY_MODES.NONE);

  // Brush preview state
  const [cursorPosition, setCursorPosition] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPreview, _setShowPreview] = useState(true);

  // Brush settings
  const [patternSettings, setPatternSettings] = useState({
    type: PATTERN_TYPES.SOLID,
    scale: 1,
    density: 0.5,
    angle: 0,
  });

  const [gradientSettings, setGradientSettings] = useState({
    startColor: activeColor,
    endColor: '#FFFFFF',
    type: 'linear',
    angle: 0,
  });

  // Brush customization
  const [brushShape, setBrushShape] = useState(null);
  const [brushHardness, setBrushHardness] = useState(1);
  const [brushSpacing, setBrushSpacing] = useState(0.1);
  const [brushSmoothing, setBrushSmoothing] = useState(0.5);

  return {
    // Brush states
    brushType,
    brushEffect,
    blendMode,
    symmetryMode,

    // Preview states
    cursorPosition,
    isDrawing,
    showPreview,

    // Settings objects
    patternSettings,
    gradientSettings,

    // Brush customization
    brushShape,
    brushHardness,
    brushSpacing,
    brushSmoothing,

    // Setters
    setBrushType,
    setBrushEffect,
    setBlendMode,
    setSymmetryMode,
    setCursorPosition,
    setIsDrawing,
    setPatternSettings,
    setGradientSettings,
    setBrushShape,
    setBrushHardness,
    setBrushSpacing,
    setBrushSmoothing,
  };
};

export default useBrushSettings;
