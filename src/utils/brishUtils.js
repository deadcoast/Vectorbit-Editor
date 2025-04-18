/**
 * src/utils/brushUtils.js
 * Core brush functionality and utilities for the pixel art application
 */

// Import in correct order - external first, then internal
import { BLEND_MODES } from './blend/BlendModeProcessor';
import { blendColors, blendMode } from './color/colorCore';

// Define createOffscreenCanvas since it's not found in a module
const createOffscreenCanvas = (width, height) => {
  // Check if we're in a browser environment
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width || 300;
    canvas.height = height || 150;
    return canvas;
  }
  // For non-browser environments like Node.js
  return null;
};

/**
 * @typedef {Object} StrokeData
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {string} color - Hex color code
 * @property {number} size - Brush size
 * @property {string} type - Brush type
 * @property {string} effect - Effect type
 * @property {string} blendMode - Blend mode
 * @property {number} opacity - Opacity (0-1)
 * @property {Object} pattern - Pattern data
 * @property {number} hardness - Brush hardness
 * @property {number} spacing - Brush spacing
 * @property {Object} shape - Custom shape data
 * @property {string} layerId - Target layer ID
 */
const applyBrushStroke = strokeData => {
  const {
    x,
    y,
    color,
    size,
    type,
    effect,
    blendMode = 'normal',
    opacity = 1,
    pattern = null,
    hardness = 1,
    spacing = 0.1,
    shape = null,
    layerId,
  } = strokeData;

  // Get layer canvas
  const canvas = document.getElementById(layerId);
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');

  // Create brush stamp
  const stamp = createBrushStamp({
    size,
    color,
    type,
    hardness,
    shape,
    pattern,
  });

  // Apply the stamp with spacing
  applyStampWithSpacing(ctx, stamp, x, y, spacing, opacity, blendMode);

  // Apply effects if any
  if (effect !== 'none') {
    applyBrushEffect(ctx, x, y, size, effect);
  }
};

/**
 * Creates a brush stamp based on settings
 * @param {Object} settings - Brush stamp settings
 * @returns {HTMLCanvasElement} - Brush stamp canvas
 */
const createBrushStamp = ({ size, color, type, hardness, shape, pattern }) => {
  const canvas = createOffscreenCanvas(size * 2, size * 2);
  const ctx = canvas.getContext('2d');

  if (shape) {
    // Use custom shape
    ctx.putImageData(shape, 0, 0);
    return canvas;
  }

  // Calculate center and radius
  const center = size;
  const radius = size / 2;

  switch (type) {
    case 'filled':
      drawFilledBrush(ctx, center, radius, color, hardness);
      break;
    case 'patterned':
      drawPatternedBrush(ctx, center, radius, pattern, hardness);
      break;
    case 'airbrush':
      drawAirbrush(ctx, center, radius, color, hardness);
      break;
    case 'pixel_perfect':
      drawPixelPerfectBrush(ctx, center, radius, color);
      break;
    case 'textured':
      drawTexturedBrush(ctx, center, radius, color, hardness);
      break;
    default:
      drawFilledBrush(ctx, center, radius, color, hardness);
  }

  return canvas;
};

/**
 * Applies stamp to canvas with spacing
 */
const applyStampWithSpacing = (ctx, stamp, x, y, spacing, opacity, blendMode) => {
  const stampWidth = stamp.width;
  const stampHeight = stamp.height;
  const offsetX = stampWidth / 2;
  const offsetY = stampHeight / 2;

  // Calculate spacing distance in pixels
  const distance = Math.max(1, Math.floor(Math.min(stampWidth, stampHeight) * spacing));

  // Get current canvas content for blending
  const currentContent = ctx.getImageData(x - offsetX, y - offsetY, stampWidth, stampHeight);

  // Create temporary canvas for blending
  const tempCanvas = createOffscreenCanvas(stampWidth, stampHeight);
  const tempCtx = tempCanvas.getContext('2d');

  // Draw stamp with opacity
  tempCtx.globalAlpha = opacity;
  tempCtx.drawImage(stamp, 0, 0);

  // Blend with existing content
  const blendedContent = blendPixels(
    currentContent.data,
    tempCtx.getImageData(0, 0, stampWidth, stampHeight).data,
    blendMode
  );

  // Create final image data
  const finalImage = new ImageData(blendedContent, stampWidth, stampHeight);

  // Put blended pixels back on canvas
  ctx.putImageData(finalImage, x - offsetX, y - offsetY);
};

/**
 * Brush drawing functions
 */

const drawFilledBrush = (ctx, center, radius, color, hardness) => {
  ctx.beginPath();
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(hardness, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();
};

const drawPatternedBrush = (ctx, center, radius, pattern, hardness) => {
  // Create pattern from provided data
  const patternCanvas = createOffscreenCanvas(pattern.width, pattern.height);
  const patternCtx = patternCanvas.getContext('2d');
  patternCtx.putImageData(new ImageData(pattern.data, pattern.width, pattern.height), 0, 0);

  const brushPattern = ctx.createPattern(patternCanvas, 'repeat');

  ctx.beginPath();
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(hardness, 'rgba(255,255,255,1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.fillStyle = brushPattern;
  ctx.globalAlpha = gradient;
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();
};

const drawAirbrush = (ctx, center, radius, color, hardness) => {
  const points = Math.floor(radius * radius * Math.PI * (1 - hardness) * 10);
  const { r, g, b } = hexToRgb(color);

  for (let i = 0; i < points; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius;
    const x = center + Math.cos(angle) * dist;
    const y = center + Math.sin(angle) * dist;

    const alpha = (1 - dist / radius) * 0.1;
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
};

const drawPixelPerfectBrush = (ctx, center, radius, color) => {
  const size = Math.floor(radius * 2);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt(Math.pow(x - radius, 2) + Math.pow(y - radius, 2));
      if (dist <= radius) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
};

const drawTexturedBrush = (ctx, center, radius, color, hardness) => {
  // Create noise texture
  const noiseCanvas = createOffscreenCanvas(radius * 2, radius * 2);
  const noiseCtx = noiseCanvas.getContext('2d');
  const { r, g, b } = hexToRgb(color);

  for (let y = 0; y < radius * 2; y++) {
    for (let x = 0; x < radius * 2; x++) {
      const dist = Math.sqrt(Math.pow(x - radius, 2) + Math.pow(y - radius, 2));

      if (dist <= radius) {
        const noise = Math.random();
        const alpha = (1 - dist / radius) * hardness * noise;
        noiseCtx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        noiseCtx.fillRect(x, y, 1, 1);
      }
    }
  }

  ctx.drawImage(noiseCanvas, 0, 0);
};

// Add WebGL support for effect processing
const useWebGLForEffects = (effect, pixels, size) => {
  if (!window.WebGL2RenderingContext) {
    return false;
  }
  // Implementation of WebGL-based effect processing
  // This would significantly speed up pixel manipulation
};

/**
 * Add these effects to the main applyBrushEffect function
 */
const applyBrushEffect = (ctx, x, y, size, effect, options = {}) => {
  const radius = size / 2;
  const imageData = ctx.getImageData(x - size, y - size, size * 2, size * 2);
  const pixels = imageData.data;

  switch (effect) {
    case 'glow':
      applyGlowEffect(pixels, size);
      break;

    case 'blur':
      applyBlurEffect(pixels, size);
      break;

    case 'sharpen':
      applySharpenEffect(pixels, size);
      break;

    case 'outline':
      applyOutlineEffect(pixels, size);
      break;

    case 'shadow':
      applyShadowEffect(pixels, size);
      break;

    default:
      // No effect or unsupported effect, just return
      break;

    case BRUSH_EFFECTS.DISTORT:
      applyDistortEffect(pixels, size, options.intensity);
      break;
    case BRUSH_EFFECTS.NEON:
      applyNeonEffect(pixels, size);
      break;
    case BRUSH_EFFECTS.PIXELATE:
      applyPixelateEffect(pixels, size, options.blockSize);
      break;
    case BRUSH_EFFECTS.HALFTONE:
      applyHalftoneEffect(pixels, size, options.dotSize);
      break;
    case BRUSH_EFFECTS.POSTERIZE:
      applyPosterizeEffect(pixels, size, options.levels);
      break;
  }

  ctx.putImageData(imageData, x - size, y - size);
};

/**
 * Brush effect implementations
 */
const applyGlowEffect = (pixels, size) => {
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = size * 2;

  for (let i = 0; i < pixels.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    let r = 0,
      g = 0,
      b = 0,
      a = 0,
      count = 0;

    // Sample neighboring pixels
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < width) {
          const index = (ny * width + nx) * 4;
          r += tempPixels[index];
          g += tempPixels[index + 1];
          b += tempPixels[index + 2];
          a += tempPixels[index + 3];
          count++;
        }
      }
    }

    // Apply glow
    pixels[i] = Math.min(255, (r / count) * 1.5);
    pixels[i + 1] = Math.min(255, (g / count) * 1.5);
    pixels[i + 2] = Math.min(255, (b / count) * 1.5);
    pixels[i + 3] = a / count;
  }
};

const applyBlurEffect = (pixels, size) => {
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = size * 2;
  const kernelSize = 3;
  const kernel = [1 / 16, 2 / 16, 1 / 16, 2 / 16, 4 / 16, 2 / 16, 1 / 16, 2 / 16, 1 / 16];

  for (let i = 0; i < pixels.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    let r = 0,
      g = 0,
      b = 0,
      a = 0;

    for (let ky = 0; ky < kernelSize; ky++) {
      for (let kx = 0; kx < kernelSize; kx++) {
        const nx = x + kx - 1;
        const ny = y + ky - 1;
        if (nx >= 0 && nx < width && ny >= 0 && ny < width) {
          const kernelIndex = ky * kernelSize + kx;
          const pixelIndex = (ny * width + nx) * 4;
          const weight = kernel[kernelIndex];

          r += tempPixels[pixelIndex] * weight;
          g += tempPixels[pixelIndex + 1] * weight;
          b += tempPixels[pixelIndex + 2] * weight;
          a += tempPixels[pixelIndex + 3] * weight;
        }
      }
    }

    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = a;
  }
};

const applySharpenEffect = (pixels, size) => {
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = size * 2;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let i = 0; i < pixels.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    let r = 0,
      g = 0,
      b = 0,
      a = 0;

    for (let ky = 0; ky < 3; ky++) {
      for (let kx = 0; kx < 3; kx++) {
        const nx = x + kx - 1;
        const ny = y + ky - 1;
        if (nx >= 0 && nx < width && ny >= 0 && ny < width) {
          const kernelIndex = ky * 3 + kx;
          const pixelIndex = (ny * width + nx) * 4;
          const weight = kernel[kernelIndex];

          r += tempPixels[pixelIndex] * weight;
          g += tempPixels[pixelIndex + 1] * weight;
          b += tempPixels[pixelIndex + 2] * weight;
          a += tempPixels[pixelIndex + 3] * weight;
        }
      }
    }

    pixels[i] = Math.min(255, Math.max(0, r));
    pixels[i + 1] = Math.min(255, Math.max(0, g));
    pixels[i + 2] = Math.min(255, Math.max(0, b));
    pixels[i + 3] = Math.min(255, Math.max(0, a));
  }
};

const applyOutlineEffect = (pixels, size) => {
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = size * 2;
  const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];

  for (let i = 0; i < pixels.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    let r = 0,
      g = 0,
      b = 0,
      a = 0;

    for (let ky = 0; ky < 3; ky++) {
      for (let kx = 0; kx < 3; kx++) {
        const nx = x + kx - 1;
        const ny = y + ky - 1;
        if (nx >= 0 && nx < width && ny >= 0 && ny < width) {
          const kernelIndex = ky * 3 + kx;
          const pixelIndex = (ny * width + nx) * 4;
          const weight = kernel[kernelIndex];

          r += tempPixels[pixelIndex] * weight;
          g += tempPixels[pixelIndex + 1] * weight;
          b += tempPixels[pixelIndex + 2] * weight;
          a += tempPixels[pixelIndex + 3] * weight;
        }
      }
    }

    // Only show outline where there's a significant edge
    const intensity = (Math.abs(r) + Math.abs(g) + Math.abs(b)) / 3;
    const threshold = 50;

    if (intensity > threshold) {
      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
      pixels[i + 3] = 255;
    } else {
      pixels[i + 3] = 0;
    }
  }
};

const applyShadowEffect = (pixels, size) => {
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = size * 2;
  const offset = 2; // Shadow offset

  for (let i = 0; i < pixels.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);

    // Only process pixels with alpha > 0
    if (tempPixels[i + 3] > 0) {
      const shadowX = x + offset;
      const shadowY = y + offset;

      if (shadowX < width && shadowY < width) {
        const shadowIndex = (shadowY * width + shadowX) * 4;
        // Add shadow pixel
        pixels[shadowIndex] = 0;
        pixels[shadowIndex + 1] = 0;
        pixels[shadowIndex + 2] = 0;
        pixels[shadowIndex + 3] = 128;
      }
    }
  }

  // Draw original pixels over shadow
  for (let i = 0; i < pixels.length; i += 4) {
    if (tempPixels[i + 3] > 0) {
      pixels[i] = tempPixels[i];
      pixels[i + 1] = tempPixels[i + 1];
      pixels[i + 2] = tempPixels[i + 2];
      pixels[i + 3] = tempPixels[i + 3];
    }
  }
};

/**
 * Utility function to blend pixel arrays
 */
const blendPixels = (basePixels, blendPixels, mode) => {
  const result = new Uint8ClampedArray(basePixels.length);

  for (let i = 0; i < basePixels.length; i += 4) {
    const baseColor = {
      r: basePixels[i],
      g: basePixels[i + 1],
      b: basePixels[i + 2],
      a: basePixels[i + 3],
    };

    const blendColor = {
      r: blendPixels[i],
      g: blendPixels[i + 1],
      b: blendPixels[i + 2],
      a: blendPixels[i + 3],
    };

    const resultColor = blendMode[mode](baseColor, blendColor);

    result[i] = resultColor.r;
    result[i + 1] = resultColor.g;
    result[i + 2] = resultColor.b;
    result[i + 3] = resultColor.a;
  }

  return result;
};

// Helper function to convert hex to RGB
const hexToRgb = hex => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

/**
 * Input validation for brush parameters
 * @param {Object} strokeData - Brush stroke data
 * @throws {Error} If parameters are invalid
 */
const validateBrushParams = strokeData => {
  const { x, y, color, size, layerId, opacity, hardness, spacing, type, effect, blendMode } =
    strokeData;

  // Required parameters
  if (typeof x !== 'number' || isNaN(x)) {
    throw new Error('Invalid x coordinate');
  }
  if (typeof y !== 'number' || isNaN(y)) {
    throw new Error('Invalid y coordinate');
  }
  if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    throw new Error('Invalid color format: must be hex color (#RRGGBB)');
  }
  if (typeof size !== 'number' || size <= 0 || size > 1000) {
    throw new Error('Invalid brush size: must be between 1 and 1000');
  }
  if (!layerId || typeof layerId !== 'string') {
    throw new Error('Layer ID is required and must be a string');
  }

  // Optional parameters with defaults
  if (opacity !== undefined && (typeof opacity !== 'number' || opacity < 0 || opacity > 1)) {
    throw new Error('Invalid opacity: must be between 0 and 1');
  }
  if (hardness !== undefined && (typeof hardness !== 'number' || hardness < 0 || hardness > 1)) {
    throw new Error('Invalid hardness: must be between 0 and 1');
  }
  if (spacing !== undefined && (typeof spacing !== 'number' || spacing < 0.01 || spacing > 1)) {
    throw new Error('Invalid spacing: must be between 0.01 and 1');
  }

  /**
   * @typedef {Object} BrushSettings
   * @property {number} size - Brush size in pixels
   * @property {string} color - Hex color code
   * @property {string} type - Brush type from BRUSH_TYPES
   * @property {number} hardness - Brush hardness (0-1)
   * @property {Object} [shape] - Optional custom shape data
   * @property {Object} [pattern] - Optional pattern data
   */
  // Validate brush type
  if (type && !Object.values(BRUSH_TYPES).includes(type)) {
    throw new Error(`Invalid brush type: ${type}`);
  }

  // Validate effect
  if (effect && !Object.values(BRUSH_EFFECTS).includes(effect)) {
    throw new Error(`Invalid brush effect: ${effect}`);
  }

  // Validate blend mode
  if (blendMode && !Object.values(BLEND_MODES).includes(blendMode)) {
    throw new Error(`Invalid blend mode: ${blendMode}`);
  }

  return true; // All validations passed
};

/**
 * Validates pattern settings
 * @param {Object} pattern - Pattern settings
 */
const validatePatternSettings = pattern => {
  if (!pattern) {
    return;
  }

  const { width, height, data } = pattern;

  if (!width || !height || !data) {
    throw new Error('Invalid pattern: missing required properties');
  }

  if (width * height * 4 !== data.length) {
    throw new Error('Invalid pattern data length');
  }
};

/**
 * Validates canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
const validateContext = ctx => {
  if (!ctx || !(ctx instanceof CanvasRenderingContext2D)) {
    throw new Error('Invalid canvas context');
  }
};

/**
 * Advanced brush stamp caching system
 */
class BrushStampCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  generateKey(settings) {
    const { size, color, type, hardness, pattern } = settings;
    return JSON.stringify({
      size,
      color,
      type,
      hardness,
      pattern: pattern ? pattern.width : null,
    });
  }

  get(settings) {
    const key = this.generateKey(settings);
    if (this.cache.has(key)) {
      this.stats.hits++;
      // Move to front (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    this.stats.misses++;
    return null;
  }

  set(settings, stamp) {
    const key = this.generateKey(settings);

    // Check cache size and evict if necessary
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }

    this.cache.set(key, stamp);
    return stamp;
  }

  getCachedStamp(settings) {
    let stamp = this.get(settings);
    if (!stamp) {
      stamp = createBrushStamp(settings);
      this.set(settings, stamp);
    }
    return stamp;
  }

  clear() {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2),
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Initialize brush stamp cache
const brushStampCache = new BrushStampCache();
const getCachedStamp = settings => brushStampCache.getCachedStamp(settings);

/**
 * Extended brush types with implementations
 */
const BRUSH_TYPES = {
  FILLED: 'filled',
  PATTERNED: 'patterned',
  GRADIENT: 'gradient',
  AIRBRUSH: 'airbrush',
  PIXEL_PERFECT: 'pixel_perfect',
  TEXTURED: 'textured',
  SPLATTER: 'splatter',
  CALLIGRAPHY: 'calligraphy',
  WATERCOLOR: 'watercolor',
  PENCIL: 'pencil',
  CHALK: 'chalk',
  ERASER: 'eraser',
};

/**
 * New brush type implementations
 */
const drawSplatterBrush = (ctx, center, radius, color, hardness) => {
  const { r, g, b } = hexToRgb(color);
  const droplets = Math.floor(radius * radius * Math.PI * hardness);

  for (let i = 0; i < droplets; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    const size = Math.random() * 2 + 1;
    const x = center + Math.cos(angle) * distance;
    const y = center + Math.sin(angle) * distance;
    const alpha = (1 - distance / radius) * 0.7;

    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawCalligraphyBrush = (ctx, center, radius, color, angle = 45) => {
  const rad = (angle * Math.PI) / 180;
  const width = radius * 0.3;
  const length = radius * 2;

  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(rad);

  // Draw main stroke
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, length, width, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const drawWatercolorBrush = (ctx, center, radius, color, hardness) => {
  const { r, g, b } = hexToRgb(color);
  const layers = 3;

  for (let layer = 0; layer < layers; layer++) {
    const layerRadius = radius * (1 - layer * 0.2);
    const points = 12;

    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const jitter = (Math.random() - 0.5) * radius * 0.3;
      const x = center + Math.cos(angle) * (layerRadius + jitter);
      const y = center + Math.sin(angle) * (layerRadius + jitter);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    const alpha = 0.1 + 0.1 * layer;
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    ctx.fill();
  }
};

const drawPencilBrush = (ctx, center, radius, color, hardness) => {
  const { r, g, b } = hexToRgb(color);
  const grain = 0.5; // Texture grain size
  const points = Math.floor(radius * radius * Math.PI * 4);

  for (let i = 0; i < points; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * radius;
    const x = center + Math.cos(angle) * distance;
    const y = center + Math.sin(angle) * distance;

    if (Math.random() < hardness) {
      const alpha = (1 - distance / radius) * 0.3;
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fillRect(x, y, grain, grain);
    }
  }
};

const drawChalkBrush = (ctx, center, radius, color, hardness) => {
  const { r, g, b } = hexToRgb(color);
  const grainSize = 1.5;
  const density = hardness * 0.8;

  // Create chalk texture
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const dist = Math.sqrt(x * x + y * y);

      if (dist <= radius && Math.random() < density) {
        const alpha = (1 - dist / radius) * 0.5;
        const noise = Math.random() * 0.3 + 0.7;

        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * noise})`;
        ctx.fillRect(center + x - grainSize / 2, center + y - grainSize / 2, grainSize, grainSize);
      }
    }
  }
};

/**
 * Extended brush effects with implementations
 */
const BRUSH_EFFECTS = {
  NONE: 'none',
  GLOW: 'glow',
  BLUR: 'blur',
  SHARPEN: 'sharpen',
  OUTLINE: 'outline',
  SHADOW: 'shadow',
  DISTORT: 'distort',
  NEON: 'neon',
  PIXELATE: 'pixelate',
  HALFTONE: 'halftone',
  POSTERIZE: 'posterize',
};

/**
 * New effect implementations
 */
const applyDistortEffect = (pixels, size, intensity = 0.5) => {
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = size * 2;

  for (let i = 0; i < pixels.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);

    // Create distortion offset
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * intensity * 10;
    const newX = Math.floor(x + Math.cos(angle) * distance);
    const newY = Math.floor(y + Math.sin(angle) * distance);

    if (newX >= 0 && newX < width && newY >= 0 && newY < width) {
      const newIndex = (newY * width + newX) * 4;
      pixels[i] = tempPixels[newIndex];
      pixels[i + 1] = tempPixels[newIndex + 1];
      pixels[i + 2] = tempPixels[newIndex + 2];
      pixels[i + 3] = tempPixels[newIndex + 3];
    }
  }
};

const applyNeonEffect = (pixels, size) => {
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = size * 2;

  // First pass: create glow
  applyGlowEffect(pixels, size);

  // Second pass: enhance edges
  const edgeKernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];

  for (let i = 0; i < pixels.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);
    let r = 0,
      g = 0,
      b = 0;

    // Apply edge detection
    for (let ky = 0; ky < 3; ky++) {
      for (let kx = 0; kx < 3; kx++) {
        const nx = x + kx - 1;
        const ny = y + ky - 1;
        if (nx >= 0 && nx < width && ny >= 0 && ny < width) {
          const kernelIndex = ky * 3 + kx;
          const pixelIndex = (ny * width + nx) * 4;
          const weight = edgeKernel[kernelIndex];

          r += tempPixels[pixelIndex] * weight;
          g += tempPixels[pixelIndex + 1] * weight;
          b += tempPixels[pixelIndex + 2] * weight;
        }
      }
    }

    // Enhance edges with neon effect
    const edge = (Math.abs(r) + Math.abs(g) + Math.abs(b)) / 3;
    if (edge > 100) {
      pixels[i] = Math.min(255, pixels[i] * 1.5);
      pixels[i + 1] = Math.min(255, pixels[i + 1] * 1.5);
      pixels[i + 2] = Math.min(255, pixels[i + 2] * 1.5);
    }
  }
};

const applyPixelateEffect = (pixels, size, blockSize = 4) => {
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = size * 2;

  for (let by = 0; by < width; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        count = 0;

      // Average colors in block
      for (let y = by; y < Math.min(by + blockSize, width); y++) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
          const index = (y * width + x) * 4;
          r += tempPixels[index];
          g += tempPixels[index + 1];
          b += tempPixels[index + 2];
          a += tempPixels[index + 3];
          count++;
        }
      }

      // Calculate average values
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      a = Math.round(a / count);

      // Apply averaged color to block
      for (let y = by; y < Math.min(by + blockSize, width); y++) {
        for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
          const index = (y * width + x) * 4;
          pixels[index] = r;
          pixels[index + 1] = g;
          pixels[index + 2] = b;
          pixels[index + 3] = a;
        }
      }
    }
  }
};

const applyHalftoneEffect = (pixels, size, dotSize = 3) => {
  const tempPixels = new Uint8ClampedArray(pixels);
  const width = size * 2;

  for (let by = 0; by < width; by += dotSize * 2) {
    for (let bx = 0; bx < width; bx += dotSize * 2) {
      let total = 0,
        count = 0;

      // Calculate average brightness for this block
      for (let y = by; y < Math.min(by + dotSize * 2, width); y++) {
        for (let x = bx; x < Math.min(bx + dotSize * 2, width); x++) {
          const index = (y * width + x) * 4;
          const brightness =
            (tempPixels[index] + tempPixels[index + 1] + tempPixels[index + 2]) / 3;
          total += brightness;
          count++;
        }
      }

      const avgBrightness = total / (count * 255); // Normalize to 0-1
      const dotRadius = dotSize * avgBrightness;

      // Clear block
      for (let y = by; y < Math.min(by + dotSize * 2, width); y++) {
        for (let x = bx; x < Math.min(bx + dotSize * 2, width); x++) {
          const index = (y * width + x) * 4;
          pixels[index] = pixels[index + 1] = pixels[index + 2] = 255;
          pixels[index + 3] = 0;
        }
      }

      // Draw dot
      const centerX = bx + dotSize;
      const centerY = by + dotSize;
      for (let y = by; y < Math.min(by + dotSize * 2, width); y++) {
        for (let x = bx; x < Math.min(bx + dotSize * 2, width); x++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= dotRadius) {
            const index = (y * width + x) * 4;
            pixels[index] = pixels[index + 1] = pixels[index + 2] = 0;
            pixels[index + 3] = 255;
          }
        }
      }
    }
  }
};

const applyPosterizeEffect = (pixels, size, levels = 4) => {
  const factor = 255 / (levels - 1);

  for (let i = 0; i < pixels.length; i += 4) {
    // Posterize each color channel
    for (let j = 0; j < 3; j++) {
      const value = pixels[i + j];
      pixels[i + j] = Math.round(Math.round(value / factor) * factor);
    }
  }
};

/**
 * Cleanup utilities for managing canvas, WebGL, and memory resources
 */
const cleanup = {
  // Cache management
  clearBrushCache: () => brushStampCache.clear(),

  // Canvas management
  disposeTempCanvases: new Set(), // Track temporary canvases

  registerTempCanvas: canvas => {
    if (canvas instanceof HTMLCanvasElement) {
      cleanup.disposeTempCanvases.add(canvas);
    } else {
      console.warn('Attempted to register invalid canvas');
    }
  },

  disposeCanvas: canvas => {
    if (canvas instanceof HTMLCanvasElement) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas.width = 0;
      canvas.height = 0;
      cleanup.disposeTempCanvases.delete(canvas);
    }
  },

  cleanupTempCanvases: () => {
    cleanup.disposeTempCanvases.forEach(canvas => {
      cleanup.disposeCanvas(canvas);
    });
    cleanup.disposeTempCanvases.clear();
  },

  // WebGL management
  webGLContexts: new Set(),

  registerWebGLContext: context => {
    if (context instanceof WebGLRenderingContext || context instanceof WebGL2RenderingContext) {
      cleanup.webGLContexts.add(context);
    }
  },

  disposeWebGLContext: context => {
    if (context instanceof WebGLRenderingContext || context instanceof WebGL2RenderingContext) {
      const extension = context.getExtension('WEBGL_lose_context');
      if (extension) {
        extension.loseContext();
      }
      cleanup.webGLContexts.delete(context);
    }
  },

  cleanupWebGLContexts: () => {
    cleanup.webGLContexts.forEach(context => {
      cleanup.disposeWebGLContext(context);
    });
    cleanup.webGLContexts.clear();
  },

  // Memory management
  releaseMemory: () => {
    // Clear brush cache
    cleanup.clearBrushCache();

    // Cleanup all temporary canvases
    cleanup.cleanupTempCanvases();

    // Cleanup all WebGL contexts
    cleanup.cleanupWebGLContexts();

    // Clear any other caches
    if (window.gc) {
      try {
        window.gc(); // Request garbage collection if available
      } catch (e) {
        console.warn('Failed to request garbage collection', e);
      }
    }
  },

  // Resource tracking
  resources: {
    canvases: 0,
    webGLContexts: 0,
    cacheSize: 0,
  },

  // Resource monitoring
  updateResourceStats: () => {
    cleanup.resources.canvases = cleanup.disposeTempCanvases.size;
    cleanup.resources.webGLContexts = cleanup.webGLContexts.size;
    cleanup.resources.cacheSize = brushStampCache.cache.size;
    return cleanup.resources;
  },

  // Full cleanup
  dispose: () => {
    console.log('Starting full cleanup...');
    console.time('Cleanup duration');

    try {
      cleanup.releaseMemory();

      // Log cleanup results
      const stats = cleanup.updateResourceStats();
      console.log('Cleanup completed. Resources freed:', {
        canvases: cleanup.resources.canvases,
        webGLContexts: cleanup.resources.webGLContexts,
        cacheSize: cleanup.resources.cacheSize,
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      console.timeEnd('Cleanup duration');
    }
  },
};

// Add event listener for page unload to clean up resources
if (typeof window !== 'undefined') {
  window.addEventListener('unload', () => {
    cleanup.dispose();
  });
}

// Register a temporary canvas
const tempCanvas = document.createElement('canvas');
cleanup.registerTempCanvas(tempCanvas);

// Register a WebGL context if webGL is supported
const glContext = tempCanvas.getContext('webgl2');
cleanup.registerWebGLContext(glContext);

// Get resource statistics
const stats = cleanup.updateResourceStats();
console.log('Current resources:', stats);

// Clean up everything when done
cleanup.dispose();

/**
 * Process large brush strokes by breaking them into smaller chunks
 * @param {Object} ctx - Canvas context
 * @param {Object} brushSettings - Brush settings
 * @param {number} maxChunkSize - Maximum chunk size to process at once
 * @returns {boolean} - Success status
 */
const processLargeBrush = (ctx, brushSettings, maxChunkSize = 1000) => {
  const { size, x, y } = brushSettings;

  // Skip processing if brush is smaller than max chunk size
  if (size <= maxChunkSize) {
    return false; // Indicate that no chunking was needed
  }

  // Calculate number of chunks needed
  const chunks = Math.ceil(size / maxChunkSize);
  const chunkSize = Math.ceil(size / chunks);

  // Process each chunk
  for (let i = 0; i < chunks; i++) {
    const chunkX = x - size / 2 + i * chunkSize;
    const chunkBrush = {
      ...brushSettings,
      x: chunkX + chunkSize / 2,
      size: chunkSize,
    };

    // Apply brush to this chunk
    applyBrushStroke(chunkBrush);
  }

  return true; // Indicate that chunking was applied
};

export {
  BRUSH_TYPES,
  BRUSH_EFFECTS,
  BLEND_MODES,
  applyBrushStroke,
  createBrushStamp,
  applyBrushEffect,
  blendPixels,
  hexToRgb,
  validateBrushParams,
  BrushStampCache,
  cleanup,
  processLargeBrush,
};
