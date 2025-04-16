
/**
*src/components/BrushSystem/BrushManager.js
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generatePattern, PATTERN_TYPES } from '../../utils/patterns/ProceduralGenerator';
import { blendColors, generateGradient } from '../../utils/color/colorCore';

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
  onSettingsChange
}) => {
  // Brush state
  const [brushType, setBrushType] = useState(BRUSH_TYPES.FILLED);
  const [brushEffect, setBrushEffect] = useState(BRUSH_EFFECTS.NONE);
  const [blendMode, setBlendMode] = useState(BRUSH_BLEND_MODES.NORMAL);
  const [symmetryMode, setSymmetryMode] = useState(SYMMETRY_MODES.NONE);
  
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

  // Pattern cache
  const patternCache = new Map();

  // Pressure sensitivity handling
  const pressurePoints = useRef([]);
  
  useEffect(() => {
    return () => {
      patternCache.clear();
      strokeHistory.current = [];
      pressurePoints.current = [];
    };
  }, []);

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
  const applySymmetry = useCallback((x, y) => {
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
    const symmetricPoints = points.flatMap(point => applySymmetry(point.x, point.y));

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
    applySymmetry,
    smoothStroke,
    calculatePressureSize,
    getPattern
  ]);

  /**
   * Generates brush preview
   */
  const generateBrushPreview = useCallback(() => {
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = brushSize * 2;
    previewCanvas.height = brushSize * 2;
    const ctx = previewCanvas.getContext('2d');

    // Draw brush preview based on current settings
    // ... (implement preview rendering)

    return previewCanvas;
  }, [brushSize, brushType, brushEffect, brushHardness, brushShape]);

  // Return component and API
  return {
    // Core brush functions
    applyStroke,
    generateBrushPreview,

    // State getters
    brushType,
    brushEffect,
    blendMode,
    symmetryMode,
    patternSettings,
    gradientSettings,

    // State setters
    setBrushType,
    setBrushEffect,
    setBlendMode,
    setSymmetryMode,
    setPatternSettings,
    setGradientSettings,

    // Custom brush settings
    setBrushShape,
    setBrushHardness,
    setBrushSpacing,
    setBrushSmoothing,

    // UI Components
    BrushControls: () => (
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
              max="1"​​​​​​​​​​​​​​​​
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
    )
  };
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
  onStroke: () => {},
  onBrushChange: () => {},
  onSettingsChange: () => {},
};

export default BrushManager;
