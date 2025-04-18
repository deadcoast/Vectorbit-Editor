/**
 * Custom hook for managing brush-related logic and effects
 */
import { useEffect, useRef } from 'react';

import BrushPreviewGenerator from '../BrushPreviewGenerator';
import { createBrushAPI, createSettingsObject } from '../utils/brushEffectUtils';
import { createApplyBrushFunction } from '../utils/brushApplyUtils';
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

  // Create the applyBrush function with all dependencies
  const applyBrush = createApplyBrushFunction({
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
  });

  // Current brush settings object for preview
  const currentBrushSettings = createBrushSettingsObject({
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

  // Handle onBrushChange callback
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

  // Handle onSettingsChange callback
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

  // Clean up pattern cache on unmount
  useEffect(() => {
    return () => {
      patternCache.current = {};
    };
  }, []);

  // Set up brush events on grid
  useEffect(() => {
    return setupBrushEvents({
      gridRef,
      setCursorPosition,
      setIsDrawing,
    });
  }, [gridRef, setCursorPosition, setIsDrawing]);

  // Use the BrushPreviewGenerator to get the preview generation function
  const { generateBrushPreview } = BrushPreviewGenerator({
    activeColor,
    brushShape,
    brushSize,
    brushType,
    generatePattern,
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
