
/**
*src/components/BrushSystem/BrushManager.js
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { generatePattern, PATTERN_TYPES } from '../../utils/patterns/ProceduralGenerator';
import { blendColors, generateGradient } from '../../utils/color/colorCore';
import BrushPreview from './BrushPreview';

/**
 * Brush Types Enum
 */
export const BRUSH_TYPES = {
  FILLED: 'filled',
  PATTERNED: 'patterned',
  GRADIENT: 'gradient',
  AIRBRUSH: 'airbrush',
  PIXEL_PERFECT: 'pixel_perfect',
  TEXTURED: 'textured',
  ERASER: 'eraser',
  CUSTOM: 'custom'
};

/**
 * Brush Effects Enum
 */
export const BRUSH_EFFECTS = {
  NONE: 'none',
  GLOW: 'glow',
  BLUR: 'blur',
  SHARPEN: 'sharpen',
  OUTLINE: 'outline',
  SHADOW: 'shadow'
};

/**
 * Blend Modes for brush strokes
 */
export const BRUSH_BLEND_MODES = {
  NORMAL: 'normal',
  MULTIPLY: 'multiply',
  SCREEN: 'screen',
  OVERLAY: 'overlay',
  DARKEN: 'darken',
  LIGHTEN: 'lighten'
};

/**
 * Symmetry Modes
 */
export const SYMMETRY_MODES = {
  NONE: 'none',
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  QUAD: 'quad',
  RADIAL: 'radial',
  MIRROR: 'mirror'
};

const BrushManager = ({
  activeColor,
  gridSize,
  layerId,
  onStroke,
  brushSize = 1,
  opacity = 1,
  pressure = 1,
  onBrushChange,
  onSettingsChange,
  gridRef // Reference to the grid element for cursor position tracking
}) => {
  // Brush state
  const [brushType, setBrushType] = useState(BRUSH_TYPES.FILLED);
  const [brushEffect, setBrushEffect] = useState(BRUSH_EFFECTS.NONE);
  const [blendMode, setBlendMode] = useState(BRUSH_BLEND_MODES.NORMAL);
  const [symmetryMode, setSymmetryMode] = useState(SYMMETRY_MODES.NONE);
  
  // Brush preview state
  const [cursorPosition, setCursorPosition] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  // Brush settings
  const [patternSettings, setPatternSettings] = useState({
    type: PATTERN_TYPES.SOLID,
    scale: 1,
    density: 0.5,
    angle: 0
  });
  
  const [gradientSettings, setGradientSettings] = useState({
    startColor: activeColor,
    endColor: '#FFFFFF',
    type: 'linear',
    angle: 0
  });

  // Brush customization
  const [brushShape, setBrushShape] = useState(null);
  const [brushHardness, setBrushHardness] = useState(1);
  const [brushSpacing, setBrushSpacing] = useState(0.1);
  const [brushSmoothing, setBrushSmoothing] = useState(0.5);
  
  // Stroke history for smoothing
  const strokeHistory = useRef([]);
  const maxHistoryPoints = 5;

  // Pattern cache for performance optimization
  const patternCache = useRef({});
  
  // Current brush settings for preview
  const currentBrushSettings = {
    brushType,
    brushEffect,
    brushSize,
    brushShape,
    opacity,
    pressure,
    patternSettings,
    gradientSettings,
    symmetryMode,
    blendMode,
    brushHardness,
    brushSpacing,
    brushSmoothing
  };
  
  /**
   * Applies a brush stroke with the current brush settings
   * @param {number} x - X coordinate on the grid
   * @param {number} y - Y coordinate on the grid
   * @returns {object} The cell data including color and other properties
   */
  const applyBrush = useCallback((x, y) => {
    if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return null;
    
    // Calculate full brush area based on size
    const cells = [];
    const halfSize = Math.floor(brushSize / 2);
    
    for (let offsetY = -halfSize; offsetY <= halfSize; offsetY++) {
      for (let offsetX = -halfSize; offsetX <= halfSize; offsetX++) {
        const targetX = x + offsetX;
        const targetY = y + offsetY;
        
        // Skip if outside grid
        if (targetX < 0 || targetY < 0 || targetX >= gridSize || targetY >= gridSize) continue;
        
        // Determine if current offset is inside the brush shape
        if (isPositionInBrush(offsetX, offsetY, brushSize, brushShape)) {
          // Apply current brush settings to determine color
          const color = determineCellColor(targetX, targetY);
          
          if (color) {
            cells.push({
              x: targetX,
              y: targetY,
              color,
              blendMode,
              opacity: opacity * pressure,
              layerId
            });
          }
        }
      }
    }
    
    // Add symmetry if enabled
    const symmetryCells = applySymmetry(cells);
    cells.push(...symmetryCells);
    
    // Notify parent of stroke
    if (cells.length > 0 && onStroke) {
      onStroke(cells);
    }
    
    return cells;
  }, [brushSize, brushShape, opacity, pressure, gridSize, layerId, blendMode, onStroke]);
  
  /**
   * Determines if a position is within the current brush shape
   * @param {number} offsetX - X offset from center
   * @param {number} offsetY - Y offset from center
   * @param {number} size - Brush size
   * @param {string} shape - Brush shape
   * @returns {boolean} True if position is within brush
   */
  const isPositionInBrush = useCallback((offsetX, offsetY, size, shape) => {
    // Default shape is square
    if (!shape || shape === 'square') {
      return Math.abs(offsetX) <= size / 2 && Math.abs(offsetY) <= size / 2;
    }
    
    // Circle shape
    if (shape === 'circle') {
      const radius = size / 2;
      return Math.sqrt(offsetX * offsetX + offsetY * offsetY) <= radius;
    }
    
    // Diamond shape
    if (shape === 'diamond') {
      return Math.abs(offsetX) + Math.abs(offsetY) <= size / 2;
    }
    
    // Custom shape (use the brushShape array)
    if (Array.isArray(shape)) {
      const index = (offsetY + Math.floor(shape.length / 2)) * shape.length +
        (offsetX + Math.floor(shape[0].length / 2));
      return shape.flat()[index];
    }
    
    return false;
  }, []);
  
  /**
   * Apply symmetry to the provided cells
   * @param {Array} cells - Original brush cells
   * @returns {Array} Additional cells based on symmetry
   */
  const applySymmetry = useCallback((cells) => {
    const symmetryCells = [];
    
    if (symmetryMode === SYMMETRY_MODES.NONE) return symmetryCells;
    
    for (const cell of cells) {
      switch (symmetryMode) {
        case SYMMETRY_MODES.HORIZONTAL:
          symmetryCells.push({ ...cell, x: gridSize - 1 - cell.x });
          break;
        case SYMMETRY_MODES.VERTICAL:
          symmetryCells.push({ ...cell, y: gridSize - 1 - cell.y });
          break;
        case SYMMETRY_MODES.QUAD:
          symmetryCells.push({ ...cell, x: gridSize - 1 - cell.x });
          symmetryCells.push({ ...cell, y: gridSize - 1 - cell.y });
          symmetryCells.push({
            ...cell,
            x: gridSize - 1 - cell.x,
            y: gridSize - 1 - cell.y
          });
          break;
        case SYMMETRY_MODES.RADIAL:
          // 8-way radial symmetry
          const centerX = gridSize / 2;
          const centerY = gridSize / 2;
          const dx = cell.x - centerX;
          const dy = cell.y - centerY;
          
          for (let i = 1; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            const rotatedX = Math.round(dx * cos - dy * sin + centerX);
            const rotatedY = Math.round(dx * sin + dy * cos + centerY);
            
            if (rotatedX >= 0 && rotatedX < gridSize && rotatedY >= 0 && rotatedY < gridSize) {
              symmetryCells.push({
                ...cell,
                x: rotatedX,
                y: rotatedY
              });
            }
          }
          break;
        case SYMMETRY_MODES.MIRROR:
          // Mirror across specified axis
          const centerXMirror = gridSize / 2;
          const centerYMirror = gridSize / 2;
          
          // Mirror across both axes
          symmetryCells.push({
            ...cell,
            x: centerXMirror - (cell.x - centerXMirror),
            y: cell.y
          });
          
          symmetryCells.push({
            ...cell,
            x: cell.x,
            y: centerYMirror - (cell.y - centerYMirror)
          });
          
          symmetryCells.push({
            ...cell,
            x: centerXMirror - (cell.x - centerXMirror),
            y: centerYMirror - (cell.y - centerYMirror)
          });
          break;
      }
    }
    
    return symmetryCells;
  }, [symmetryMode, gridSize]);
  
  /**
   * Determines the color for a cell based on current brush settings
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {string|null} The color for the cell or null if transparent
   */
  const determineCellColor = useCallback((x, y) => {
    if (brushType === BRUSH_TYPES.ERASER) return null;
    
    if (brushType === BRUSH_TYPES.FILLED) {
      return activeColor;
    }
    
    if (brushType === BRUSH_TYPES.GRADIENT) {
      const { startColor, endColor, type, angle } = gradientSettings;
      
      if (type === 'linear') {
        // Simple linear gradient based on position
        const rad = (angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        
        // Project point onto gradient direction
        const normalizedX = x / gridSize;
        const normalizedY = y / gridSize;
        const projected = normalizedX * cos + normalizedY * sin;
        
        // Calculate blend ratio (0-1)
        const ratio = Math.max(0, Math.min(1, projected));
        
        return blendColors(startColor, endColor, ratio);
      } else if (type === 'radial') {
        // Radial gradient based on distance from center
        const centerX = gridSize / 2;
        const centerY = gridSize / 2;
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
        
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate blend ratio (0-1)
        const ratio = Math.min(1, dist / maxDist);
        
        return blendColors(startColor, endColor, ratio);
      }
      
      return startColor; // Fallback
    }
    
    if (brushType === BRUSH_TYPES.PATTERNED) {
      // Generate pattern cache key
      const cacheKey = JSON.stringify(patternSettings);
      
      // Check if pattern is already cached
      if (!patternCache.current[cacheKey]) {
        // Generate the pattern
        const pattern = generatePattern({
          type: patternSettings.type,
          size: patternSettings.scale * brushSize,
          primaryColor: activeColor,
          secondaryColor: '#FFFFFF',  // Could be configurable
          density: patternSettings.density,
          angle: patternSettings.angle
        });
        
        patternCache.current[cacheKey] = pattern;
      }
      
      // Use cached pattern
      const pattern = patternCache.current[cacheKey];
      const patternSize = patternSettings.scale * brushSize;
      
      // Map grid coordinates to pattern coordinates
      const patternX = ((x % patternSize) + patternSize) % patternSize;
      const patternY = ((y % patternSize) + patternSize) % patternSize;
      
      // Look up color in pattern
      const index = Math.floor(patternY) * patternSize + Math.floor(patternX);
      return pattern[index] || null;
    }
    
    return activeColor; // Default fallback
  }, [brushType, activeColor, gradientSettings, patternSettings, brushSize, gridSize]);
  
  // Expose the brush API to parent components
  useEffect(() => {
    if (onBrushChange) {
      onBrushChange({
        applyBrush,
        brushType,
        brushEffect,
        brushSize,
        opacity,
        pressure,
        patternSettings,
        gradientSettings,
        symmetryMode,
        blendMode
      });
    }
  }, [
    applyBrush, brushType, brushEffect, brushSize, opacity,
    pressure, patternSettings, gradientSettings, symmetryMode,
    blendMode, onBrushChange
  ]);
  
  // Update settings when they change
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({
        brushType,
        brushEffect,
        brushSize,
        opacity,
        pressure,
        patternSettings,
        gradientSettings,
        symmetryMode,
        blendMode
      });
    }
  }, [
    brushType, brushEffect, brushSize, opacity, pressure,
    patternSettings, gradientSettings, symmetryMode, blendMode,
    onSettingsChange
  ]);
  
  // Pattern cache management - clear cache when component unmounts
  useEffect(() => {
    return () => {
      patternCache.current = {};
    };
  }, []);
  // Pressure sensitivity handling
  const pressurePoints = useRef([]);
  
  useEffect(() => {
    return () => {
      patternCache.clear();
      strokeHistory.current = [];
      pressurePoints.current = [];
    };
  }, []);
  
  // Track cursor position for brush preview
  useEffect(() => {
    if (!gridRef || !gridRef.current) return;
    
    const handleMouseMove = (e) => {
      // Get the mouse position relative to the grid
      const rect = gridRef.current.getBoundingClientRect();
      setCursorPosition({
        x: e.clientX,
        y: e.clientY
      });
    };
    
    const handleMouseDown = () => {
      setIsDrawing(true);
    };
    
    const handleMouseUp = () => {
      setIsDrawing(false);
    };
    
    const handleMouseLeave = () => {
      // Optionally hide preview when mouse leaves the grid
      // setCursorPosition(null);
    };
    
    // Add event listeners
    const grid = gridRef.current;
    grid.addEventListener('mousemove', handleMouseMove);
    grid.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    grid.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup
    return () => {
      grid.removeEventListener('mousemove', handleMouseMove);
      grid.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      grid.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gridRef]);

  /**
   * Smooths the brush stroke using Catmull-Rom spline
   */
  const smoothStroke = useCallback((points) => {
    if (points.length < 4) {
      return points;
    }
    
    const smoothed = [];
    for (let i = 1; i < points.length - 2; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2];
      
      for (let t = 0; t < 1; t += 0.1) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
        );
        
        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
        );
        
        smoothed.push({ x, y });
      }
    }
    
    return smoothed;
  }, []);

  /**
   * Applies symmetry to stroke coordinates
   */
  const applyCoordinateSymmetry = useCallback((x, y) => {
    const points = [{ x, y }];
    const centerX = gridSize / 2;
    const centerY = gridSize / 2;

    switch (symmetryMode) {
      case SYMMETRY_MODES.HORIZONTAL:
        points.push({ x: gridSize - x - 1, y });
        break;
      case SYMMETRY_MODES.VERTICAL:
        points.push({ x, y: gridSize - y - 1 });
        break;
      case SYMMETRY_MODES.QUAD:
        points.push(
          { x: gridSize - x - 1, y },
          { x, y: gridSize - y - 1 },
          { x: gridSize - x - 1, y: gridSize - y - 1 }
        );
        break;
      case SYMMETRY_MODES.RADIAL:
        const angle = Math.atan2(y - centerY, x - centerX);
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        for (let i = 1; i < 8; i++) {
          const newAngle = angle + (Math.PI / 4) * i;
          points.push({
            x: Math.round(centerX + distance * Math.cos(newAngle)),
            y: Math.round(centerY + distance * Math.sin(newAngle))
          });
        }
        break;
    }

    return points;
  }, [symmetryMode, gridSize]);

  /**
   * Generates or retrieves pattern from cache
   */
  const getPattern = useCallback((settings) => {
    const key = JSON.stringify(settings);
    if (!patternCache.has(key)) {
      const pattern = generatePattern(settings);
      patternCache.set(key, pattern);
      return pattern;
    }
    return patternCache.get(key);
  }, []);

  /**
   * Calculates pressure-based size
   */
  const calculatePressureSize = useCallback((basePressure) => {
    const avgPressure = pressurePoints.current.reduce((sum, p) => sum + p, 0) /
      Math.max(1, pressurePoints.current.length);
    return Math.max(1, Math.round(brushSize * avgPressure * basePressure));
  }, [brushSize]);

  /**
   * Applies brush stroke with effects
   */
  const applyStroke = useCallback((x, y, currentPressure = pressure) => {
    // Update pressure history
    pressurePoints.current.push(currentPressure);
    if (pressurePoints.current.length > maxHistoryPoints) {
      pressurePoints.current.shift();
    }

    // Add point to stroke history for smoothing
    strokeHistory.current.push({ x, y });
    if (strokeHistory.current.length > maxHistoryPoints) {
      strokeHistory.current.shift();
    }

    // Get smoothed points if smoothing is enabled
    let points = brushSmoothing > 0 && strokeHistory.current.length >= 4
      ? smoothStroke(strokeHistory.current)
      : [{ x, y }];

    // Apply symmetry
    const symmetricPoints = points.flatMap(point => applyCoordinateSymmetry(point.x, point.y));

    // Process each point
    symmetricPoints.forEach(point => {
      let finalColor = activeColor;
      let pattern = null;

      // Handle patterns
      if (brushType === BRUSH_TYPES.PATTERNED) {
        pattern = getPattern({
          ...patternSettings,
          baseColor: activeColor
        });
      }

      // Handle gradients
      if (brushType === BRUSH_TYPES.GRADIENT) {
        const gradientColors = generateGradient(
          gradientSettings.startColor,
          gradientSettings.endColor,
          calculatePressureSize(currentPressure)
        );
        finalColor = gradientColors[Math.floor(point.y % gradientColors.length)];
      }

      // Calculate final brush size based on pressure
      const finalSize = calculatePressureSize(currentPressure);

      // Apply the stroke
      const strokeData = {
        x: point.x,
        y: point.y,
        color: finalColor,
        size: finalSize,
        type: brushType,
        effect: brushEffect,
        blendMode,
        opacity: opacity * currentPressure,
        pattern,
        hardness: brushHardness,
        spacing: brushSpacing,
        shape: brushShape,
        layerId
      };

      // Apply the stroke and notify parent
      applyBrushStroke(strokeData);
      onStroke?.(strokeData);
    });
  }, [
    activeColor,
    brushType,
    brushEffect,
    blendMode,
    brushSize,
    opacity,
    pressure,
    patternSettings,
    gradientSettings,
    brushHardness,
    brushSpacing,
    brushSmoothing,
    brushShape,
    layerId,
    onStroke,
    applyBrush,
    applySymmetry,
    applyCoordinateSymmetry,
    smoothStroke,
    calculatePressureSize,
    getPattern
  ]);

  /**
   * Generates brush preview
   */
  const generateBrushPreview = useCallback(() => {
    const canvas = document.createElement('canvas');
    const size = brushSize * 2;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw brush shape
    const center = size / 2;
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const offsetX = x - center;
        const offsetY = y - center;
        
        if (isPositionInBrush(offsetX, offsetY, brushSize, brushShape)) {
          const color = determineCellColor(x, y);
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
    
    return canvas;
  }, [brushSize, brushShape, brushType, activeColor, patternSettings, gradientSettings]);

  // Render the brush controls UI
  const renderControls = useCallback(() => {
    return (
      <div className="brush-controls">
        {/* Existing controls implementation */}
        <div className="brush-type-selector">
          <select value={brushType} onChange={(e) => setBrushType(e.target.value)}>
            {Object.entries(BRUSH_TYPES).map(([key, value]) => (
              <option key={key} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Pattern Controls */}
        {brushType === BRUSH_TYPES.PATTERNED && (
          <div className="pattern-controls">
            {/* Existing pattern controls */}
          </div>
        )}

        {/* Gradient Controls */}
        {brushType === BRUSH_TYPES.GRADIENT && (
          <div className="gradient-controls">
            {/* Existing gradient controls */}
          </div>
        )}

        {/* Effect Controls */}
        <div className="effect-controls">
          <select value={brushEffect} onChange={(e) => setBrushEffect(e.target.value)}>
            {Object.entries(BRUSH_EFFECTS).map(([key, value]) => (
              <option key={key} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Blend Mode Controls */}
        <div className="blend-mode-controls">
          <select value={blendMode} onChange={(e) => setBlendMode(e.target.value)}>
            {Object.entries(BRUSH_BLEND_MODES).map(([key, value]) => (
              <option key={key} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Symmetry Controls */}
        <div className="symmetry-controls">
          <select value={symmetryMode} onChange={(e) => setSymmetryMode(e.target.value)}>
            {Object.entries(SYMMETRY_MODES).map(([key, value]) => (
              <option key={key} value={value}>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Brush Settings */}
        <div className="advanced-settings">
          <label>
            Hardness
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={brushHardness}
              onChange={(e) => setBrushHardness(parseFloat(e.target.value))}
            />
          </label>
          <label>
            Spacing
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={brushSpacing}
              onChange={(e) => setBrushSpacing(parseFloat(e.target.value))}
            />
          </label>
          <label>
            Smoothing
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={brushSmoothing}
              onChange={(e) => setBrushSmoothing(parseFloat(e.target.value))}
            />
          </label>

          {/* Custom Shape Upload */}
          <div className="brush-shape-upload">
            <label>
              Custom Shape
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        // Convert image to brush shape data
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        setBrushShape(imageData);
                      };
                      img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Pressure Sensitivity Settings */}
          <div className="pressure-settings">
            <label>
              Pressure Sensitivity
              <select
                value={pressure === 1 ? 'disabled' : 'enabled'}
                onChange={(e) => {
                  const isEnabled = e.target.value === 'enabled';
                  onSettingsChange?.({ pressure: isEnabled ? 0.5 : 1 });
                }}
              >
                <option value="disabled">Disabled</option>
                <option value="enabled">Enabled</option>
              </select>
            </label>
            {pressure !== 1 && (
              <label>
                Pressure Curve
                <select
                  onChange={(e) => {
                    const curve = e.target.value;
                    // Update pressure curve in parent
                    onSettingsChange?.({ pressureCurve: curve });
                  }}
                >
                  <option value="linear">Linear</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
            )}
          </div>

          {/* Brush Presets */}
          <div className="brush-presets">
            <select
              onChange={(e) => {
                const presetName = e.target.value;
                if (presetName === 'save-new') {
                  const name = prompt('Enter preset name:');
                  if (name) {
                    const preset = {
                      name,
                      type: brushType,
                      effect: brushEffect,
                      blendMode,
                      hardness: brushHardness,
                      spacing: brushSpacing,
                      smoothing: brushSmoothing,
                      patternSettings,
                      gradientSettings
                    };
                    // Save preset to localStorage
                    const presets = JSON.parse(localStorage.getItem('brushPresets') || '{}');
                    presets[name] = preset;
                    localStorage.setItem('brushPresets', JSON.stringify(presets));
                  }
                } else {
                  // Load preset
                  const presets = JSON.parse(localStorage.getItem('brushPresets') || '{}');
                  const preset = presets[presetName];
                  if (preset) {
                    setBrushType(preset.type);
                    setBrushEffect(preset.effect);
                    setBlendMode(preset.blendMode);
                    setBrushHardness(preset.hardness);
                    setBrushSpacing(preset.spacing);
                    setBrushSmoothing(preset.smoothing);
                    setPatternSettings(preset.patternSettings);
                    setGradientSettings(preset.gradientSettings);
                  }
                }
              }}
            >
              <option value="">Load Preset</option>
              <option value="save-new">Save Current as Preset</option>
              {/* Load saved presets from localStorage */}
              {Object.keys(JSON.parse(localStorage.getItem('brushPresets') || '{}')).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="brush-preview">
          <canvas
            ref={(canvas) => {
              if (canvas) {
                const ctx = canvas.getContext('2d');
                const preview = generateBrushPreview();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(preview, 0, 0);
              }
            }}
            width={brushSize * 2}
            height={brushSize * 2}
          />
        </div>
      </div>
    );
  
    // Return main component with brush preview
    return (
      <>
        {renderControls()}
        
        {/* Brush Cursor Preview */}
        {showPreview && (
          <BrushPreview
            brushSettings={currentBrushSettings}
            activeColor={activeColor}
            gridSize={gridSize}
            cursorPosition={cursorPosition}
            isDrawing={isDrawing}
          />
        )}
      </>
    );
  };

  // Add PropTypes for type checking
  BrushManager.propTypes = {
    activeColor: PropTypes.string.isRequired,
    gridSize: PropTypes.number.isRequired,
    layerId: PropTypes.string.isRequired,
    onStroke: PropTypes.func,
    brushSize: PropTypes.number,
    opacity: PropTypes.number,
    pressure: PropTypes.number,
    onBrushChange: PropTypes.func,
    onSettingsChange: PropTypes.func,
  };

  // Add default props
  BrushManager.defaultProps = {
    brushSize: 1,
    opacity: 1,
    pressure: 1,
    onStroke: () => { },
    onBrushChange: () => { },
    onSettingsChange: () => { },
  };

  export default BrushManager;
};

