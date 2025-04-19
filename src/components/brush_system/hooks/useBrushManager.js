/**
 * Custom hook for managing brush-related logic and effects
 */
import { useEffect, useRef, useMemo } from 'react';

import BrushPreviewGenerator from '../BrushPreviewGenerator';
import { createApplyBrushFunction } from '../utils/brushApplyUtils';
import { createBrushAPI, createSettingsObject } from '../utils/brushEffectUtils';
import { createBrushSettingsObject } from '../utils/brushUtils';
import { determineCellColor, generatePattern } from '../utils/colorUtils';
import { applySymmetry } from '../utils/symmetryUtils';

/**
 * Setup brush events for mouse movement and drawing
 */
const setupBrushEvents = ({ gridRef, setCursorPosition, setIsDrawing }) => {
  if (!gridRef || !gridRef.current) return () => {};

  const grid = gridRef.current;

  // Mouse movement handler
  const handleMouseMove = event => {
    const rect = grid.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * grid.width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * grid.height);
    setCursorPosition({ x, y });
  };

  // Draw state handlers
  const handleMouseDown = () => setIsDrawing(true);
  const handleMouseUp = () => setIsDrawing(false);
  const handleMouseLeave = () => setIsDrawing(false);

  // Add event listeners
  grid.addEventListener('mousemove', handleMouseMove);
  grid.addEventListener('mousedown', handleMouseDown);
  grid.addEventListener('mouseup', handleMouseUp);
  grid.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup function
  return () => {
    grid.removeEventListener('mousemove', handleMouseMove);
    grid.removeEventListener('mousedown', handleMouseDown);
    grid.removeEventListener('mouseup', handleMouseUp);
    grid.removeEventListener('mouseleave', handleMouseLeave);
  };
};

/**
 * Creates and configures the brush API for external components
 */
const useBrushChangeEffect = ({
  onBrushChange,
  applyBrush,
  brushType,
  brushEffect,
  brushSize,
  opacity,
  pressure,
  patternSettings,
  gradientSettings,
  symmetryMode,
  blendMode,
}) => {
  useEffect(() => {
    if (onBrushChange) {
      const brushAPI = createBrushAPI({
        applyBrush,
        brushType,
        brushEffect,
        brushSize,
        opacity,
        pressure,
        patternSettings,
        gradientSettings,
        symmetryMode,
        blendMode,
      });
      onBrushChange(brushAPI);
    }
  }, [
    applyBrush,
    blendMode,
    brushEffect,
    brushSize,
    brushType,
    gradientSettings,
    onBrushChange,
    opacity,
    patternSettings,
    pressure,
    symmetryMode,
  ]);
};

/**
 * Handles settings change callback notifications
 */
const useSettingsChangeEffect = ({
  onSettingsChange,
  brushType,
  brushEffect,
  brushSize,
  opacity,
  pressure,
  patternSettings,
  gradientSettings,
  symmetryMode,
  blendMode,
}) => {
  useEffect(() => {
    if (onSettingsChange) {
      const settingsObject = createSettingsObject({
        brushType,
        brushEffect,
        brushSize,
        opacity,
        pressure,
        patternSettings,
        gradientSettings,
        symmetryMode,
        blendMode,
      });
      onSettingsChange(settingsObject);
    }
  }, [
    blendMode,
    brushEffect,
    brushSize,
    brushType,
    gradientSettings,
    onSettingsChange,
    opacity,
    patternSettings,
    pressure,
    symmetryMode,
  ]);
};

/**
 * Creates the brush application function
 */
const useApplyBrushFunction = params => {
  const {
    activeColor,
    blendMode,
    brushShape,
    brushSize,
    brushType,
    gradientSettings,
    gridSize,
    layerId,
    onStroke,
    opacity,
    patternCache,
    patternSettings,
    pressure,
    symmetryMode,
  } = params;

  return useMemo(
    () =>
      createApplyBrushFunction({
        activeColor,
        blendMode,
        brushShape,
        brushSize,
        brushType,
        determineCellColor,
        generatePattern,
        gradientSettings,
        gridSize,
        layerId,
        onStroke,
        opacity,
        patternCache,
        patternSettings,
        pressure,
        applySymmetry,
        symmetryMode,
      }),
    [
      activeColor,
      blendMode,
      brushShape,
      brushSize,
      brushType,
      gradientSettings,
      gridSize,
      layerId,
      onStroke,
      opacity,
      patternCache,
      patternSettings,
      pressure,
      symmetryMode,
    ]
  );
};

/**
 * Creates the current brush settings object
 */
const useCurrentBrushSettings = params => {
  const {
    blendMode,
    brushEffect,
    brushHardness,
    brushShape,
    brushSize,
    brushSmoothing,
    brushSpacing,
    brushType,
    gradientSettings,
    opacity,
    patternSettings,
    pressure,
    symmetryMode,
  } = params;

  return useMemo(
    () =>
      createBrushSettingsObject({
        blendMode,
        brushEffect,
        brushHardness,
        brushShape,
        brushSize,
        brushSmoothing,
        brushSpacing,
        brushType,
        gradientSettings,
        opacity,
        patternSettings,
        pressure,
        symmetryMode,
      }),
    [
      blendMode,
      brushEffect,
      brushHardness,
      brushShape,
      brushSize,
      brushSmoothing,
      brushSpacing,
      brushType,
      gradientSettings,
      opacity,
      patternSettings,
      pressure,
      symmetryMode,
    ]
  );
};

/**
 * Sets up brush events on grid
 */
const useGridEventSetup = params => {
  const { gridRef, setCursorPosition, setIsDrawing } = params;
  useEffect(() => {
    return setupBrushEvents({
      gridRef,
      setCursorPosition,
      setIsDrawing,
    });
  }, [gridRef, setCursorPosition, setIsDrawing]);
};

/**
 * Creates the brush preview generator
 */
const useBrushPreviewGenerator = params => {
  const {
    activeColor,
    brushShape,
    brushSize,
    brushType,
    gradientSettings,
    gridSize,
    patternCache,
    patternSettings,
  } = params;

  return useMemo(
    () =>
      BrushPreviewGenerator({
        activeColor,
        brushShape,
        brushSize,
        brushType,
        generatePattern,
        gradientSettings,
        gridSize,
        patternCache,
        patternSettings,
      }),
    [
      activeColor,
      brushShape,
      brushSize,
      brushType,
      gradientSettings,
      gridSize,
      patternCache,
      patternSettings,
    ]
  );
};

/**
 * Manages cleanup effects
 */
const useCleanupEffects = patternCache => {
  useEffect(() => {
    return () => {
      patternCache.current = {};
    };
  }, [patternCache]);
};

/**
 * Sets up all event handlers and callbacks
 */
const useEventHandlers = ({
  applyBrush,
  blendMode,
  brushEffect,
  brushSize,
  brushType,
  gradientSettings,
  onBrushChange,
  onSettingsChange,
  opacity,
  patternSettings,
  pressure,
  symmetryMode,
}) => {
  // Handle brush API changes
  useBrushChangeEffect({
    onBrushChange,
    applyBrush,
    brushType,
    brushEffect,
    brushSize,
    opacity,
    pressure,
    patternSettings,
    gradientSettings,
    symmetryMode,
    blendMode,
  });

  // Handle settings changes
  useSettingsChangeEffect({
    onSettingsChange,
    brushType,
    brushEffect,
    brushSize,
    opacity,
    pressure,
    patternSettings,
    gradientSettings,
    symmetryMode,
    blendMode,
  });
};

/**
 * Hook to manage brush manager functionality
 */
const useBrushManager = ({
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
  onBrushChange,
  onSettingsChange,
  onStroke,
  opacity,
  patternSettings,
  gradientSettings,
  pressure,
  setCursorPosition,
  setIsDrawing,
  symmetryMode,
}) => {
  // Pattern cache for performance optimization
  const patternCache = useRef({});

  // Create the applyBrush function
  const applyBrush = useApplyBrushFunction({
    activeColor,
    blendMode,
    brushShape,
    brushSize,
    brushType,
    gradientSettings,
    gridSize,
    layerId,
    onStroke,
    opacity,
    patternCache,
    patternSettings,
    pressure,
    symmetryMode,
  });

  // Create brush settings
  const currentBrushSettings = useCurrentBrushSettings({
    blendMode,
    brushEffect,
    brushHardness,
    brushShape,
    brushSize,
    brushSmoothing,
    brushSpacing,
    brushType,
    gradientSettings,
    opacity,
    patternSettings,
    pressure,
    symmetryMode,
  });

  // Setup event handling and callbacks
  useEventHandlers({
    applyBrush,
    blendMode,
    brushEffect,
    brushSize,
    brushType,
    gradientSettings,
    onBrushChange,
    onSettingsChange,
    opacity,
    patternSettings,
    pressure,
    symmetryMode,
  });

  // Clean up pattern cache on unmount
  useCleanupEffects(patternCache);

  // Set up grid events
  useGridEventSetup({
    gridRef,
    setCursorPosition,
    setIsDrawing,
  });

  // Get brush preview
  const { generateBrushPreview } = useBrushPreviewGenerator({
    activeColor,
    brushShape,
    brushSize,
    brushType,
    gradientSettings,
    gridSize,
    patternCache,
    patternSettings,
  });

  return {
    applyBrush,
    currentBrushSettings,
    generateBrushPreview,
    patternCache,
  };
};

export { setupBrushEvents };
export default useBrushManager;
