/**
 * src/components/BrushSystem/BrushManager.js
 */
import PropTypes from 'prop-types';

import BrushControls from './BrushControls';
import BrushPreview from './BrushPreview';
import useBrushManager from './hooks/useBrushManager';
import useBrushSettings from './hooks/useBrushSettings';

/**
 * Brush Types Enum
 */
export const BRUSH_TYPES = {
  PENCIL: 'pencil',
  PEN: 'pen',
  MARKER: 'marker',
  BRUSH: 'brush',
  ERASER: 'eraser',
  FILL: 'fill',
  GRADIENT: 'gradient',
  PATTERN: 'patterned',
};

/**
 * Blend Modes for brush strokes
 */
export const BLEND_MODES = {
  NORMAL: 'normal',
  MULTIPLY: 'multiply',
  SCREEN: 'screen',
  OVERLAY: 'overlay',
  DARKEN: 'darken',
  LIGHTEN: 'lighten',
};

/**
 * Alias for BLEND_MODES for backward compatibility
 */
export const BRUSH_BLEND_MODES = BLEND_MODES;

/**
 * Brush Effects Enum
 */
export const BRUSH_EFFECTS = {
  NONE: 'none',
  AIRBRUSH: 'airbrush',
  TEXTURED: 'textured',
  SPLATTER: 'splatter',
  PIXEL: 'pixel',
  NOISE: 'noise',
};

/**
 * Symmetry Modes Enum
 */
export const SYMMETRY_MODES = {
  NONE: 'none',
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  QUAD: 'quad',
  RADIAL: 'radial',
  MIRROR: 'mirror',
};

/**
 * Render function for BrushControls component
 */
const renderBrushControls = ({
  activeColor,
  blendMode,
  brushEffect,
  brushHardness,
  brushSize,
  brushSmoothing,
  brushSpacing,
  brushType,
  generateBrushPreview,
  gradientSettings,
  onSettingsChange,
  patternSettings,
  pressure,
  setBlendMode,
  setBrushEffect,
  setBrushHardness,
  setBrushShape,
  setBrushSmoothing,
  setBrushSpacing,
  setBrushType,
  setGradientSettings,
  setPatternSettings,
  setSymmetryMode,
  symmetryMode,
}) => (
  <BrushControls
    activeColor={activeColor}
    blendMode={blendMode}
    brushEffect={brushEffect}
    brushHardness={brushHardness}
    brushSize={brushSize}
    brushSmoothing={brushSmoothing}
    brushSpacing={brushSpacing}
    brushType={brushType}
    generateBrushPreview={generateBrushPreview}
    gradientSettings={gradientSettings}
    patternSettings={patternSettings}
    pressure={pressure}
    setBlendMode={setBlendMode}
    setBrushEffect={setBrushEffect}
    setBrushHardness={setBrushHardness}
    setBrushShape={setBrushShape}
    setBrushSmoothing={setBrushSmoothing}
    setBrushSpacing={setBrushSpacing}
    setBrushType={setBrushType}
    setGradientSettings={setGradientSettings}
    setPatternSettings={setPatternSettings}
    setSymmetryMode={setSymmetryMode}
    symmetryMode={symmetryMode}
    onSettingsChange={onSettingsChange}
  />
);

/**
 * Render function for BrushPreview component
 */
const renderBrushPreview = ({
  showPreview,
  activeColor,
  currentBrushSettings,
  isDrawing,
  cursorPosition,
}) =>
  showPreview && (
    <BrushPreview
      activeColor={activeColor}
      brushSettings={currentBrushSettings}
      isDrawing={isDrawing}
      position={cursorPosition}
    />
  );

/**
 * Main BrushManager component
 */
/**
 * Initialize brush settings with hooks
 */
/* eslint-disable no-unused-vars */
const useBrushManagerSetup = ({
  activeColor,
  brushSize,
  gridRef,
  gridSize,
  layerId,
  opacity,
  pressure,
  onBrushChange,
  onSettingsChange,
  onStroke,
}) => {
  // Get brush settings from custom hook
  const brushSettings = useBrushSettings({ activeColor });

  // Extract all properties from brush settings
  const {
    brushType,
    brushEffect,
    blendMode,
    symmetryMode,
    cursorPosition,
    isDrawing,
    showPreview,
    patternSettings,
    gradientSettings,
    brushShape,
    brushHardness,
    brushSpacing,
    brushSmoothing,
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
  } = brushSettings;

  // Use brush manager hook for additional functionality
  const managerSettings = useBrushManager({
    activeColor,
    blendMode,
    brushEffect,
    brushHardness,
    brushShape,
    brushSize,
    brushSmoothing,
    brushSpacing,
    brushType,
    gridRef,
    gridSize,
    layerId,
    opacity,
    patternSettings,
    gradientSettings,
    pressure,
    setCursorPosition,
    setIsDrawing,
    symmetryMode,
    onBrushChange,
    onSettingsChange,
    onStroke,
  });

  return {
    ...brushSettings,
    ...managerSettings,
  };
};

/**
 * Main BrushManager component
 */
const BrushManager = ({
  activeColor,
  brushSize = 1,
  gridRef,
  gridSize,
  layerId,
  onBrushChange,
  onSettingsChange,
  onStroke,
  opacity = 1,
  pressure = 1,
}) => {
  // Initialize all brush settings and functionality
  // Use object destructuring to avoid ESLint warnings about unused variables
  const settings = useBrushManagerSetup({
    activeColor,
    brushSize,
    gridRef,
    gridSize,
    layerId,
    opacity,
    pressure,
    onBrushChange,
    onSettingsChange,
    onStroke,
  });

  // Use smaller helper functions to prepare the props
  const prepareBrushControlsProps = () => ({
    activeColor,
    blendMode: settings.blendMode,
    brushEffect: settings.brushEffect,
    brushHardness: settings.brushHardness,
    brushSize,
    brushSmoothing: settings.brushSmoothing,
    brushSpacing: settings.brushSpacing,
    brushType: settings.brushType,
    generateBrushPreview: settings.generateBrushPreview,
    gradientSettings: settings.gradientSettings,
    onSettingsChange,
    patternSettings: settings.patternSettings,
    pressure,
    setBlendMode: settings.setBlendMode,
    setBrushEffect: settings.setBrushEffect,
    setBrushHardness: settings.setBrushHardness,
    setBrushShape: settings.setBrushShape,
    setBrushSmoothing: settings.setBrushSmoothing,
    setBrushSpacing: settings.setBrushSpacing,
    setBrushType: settings.setBrushType,
    setGradientSettings: settings.setGradientSettings,
    setPatternSettings: settings.setPatternSettings,
    setSymmetryMode: settings.setSymmetryMode,
    symmetryMode: settings.symmetryMode,
  });

  const prepareBrushPreviewProps = () => ({
    showPreview: settings.showPreview,
    activeColor,
    currentBrushSettings: settings.currentBrushSettings,
    isDrawing: settings.isDrawing,
    cursorPosition: settings.cursorPosition,
  });

  return (
    <>
      {renderBrushControls(prepareBrushControlsProps())}
      {renderBrushPreview(prepareBrushPreviewProps())}
    </>
  );
};

// Add PropTypes for type checking
BrushManager.propTypes = {
  activeColor: PropTypes.string.isRequired,
  brushSize: PropTypes.number,
  gridRef: PropTypes.shape({
    current: PropTypes.any,
  }),
  gridSize: PropTypes.number.isRequired,
  layerId: PropTypes.string.isRequired,
  onBrushChange: PropTypes.func,
  onSettingsChange: PropTypes.func,
  onStroke: PropTypes.func,
  opacity: PropTypes.number,
  pressure: PropTypes.number,
};

// Add default props
BrushManager.defaultProps = {
  brushSize: 1,
  opacity: 1,
  pressure: 1,
  onStroke: () => {},
  onBrushChange: () => {},
  onSettingsChange: () => {},
};

export default BrushManager;
