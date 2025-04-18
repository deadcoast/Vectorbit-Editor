import { useState, useEffect, useCallback } from 'react';

/**
 * Helper function to determine if a position is within the brush shape
 */
const isPositionInBrushShape = (offsetX, offsetY, size, shape) => {
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

  // Custom shape
  if (Array.isArray(shape)) {
    const index =
      (offsetY + Math.floor(shape.length / 2)) * shape.length +
      (offsetX + Math.floor(shape[0].length / 2));
    return shape.flat()[index];
  }

  return false;
};

/**
 * Helper function to blend two colors with a ratio
 */
const blendColorValues = (color1, color2, ratio) => {
  // Parse hex colors to RGB
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  // Blend colors
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

/**
 * Calculate radial gradient color
 */
const getRadialGradientColor = (x, y, startColor, endColor, previewSize, blendFn) => {
  const maxDist = previewSize / 2;
  const dist = Math.sqrt(x * x + y * y);
  const ratio = Math.min(1, dist / maxDist);
  return blendFn(startColor, endColor, ratio);
};

/**
 * Calculate linear gradient color
 */
const getLinearGradientColor = (x, y, startColor, endColor, angle, previewSize, blendFn) => {
  // Convert angle to radians
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Project point onto gradient direction
  const normalizedX = (x + previewSize / 2) / previewSize;
  const normalizedY = (y + previewSize / 2) / previewSize;
  const projected = normalizedX * cos + normalizedY * sin;

  // Calculate blend ratio (0-1)
  const ratio = Math.max(0, Math.min(1, projected));
  return blendFn(startColor, endColor, ratio);
};

/**
 * Get pattern color based on pattern type
 */
const getPatternColor = (x, y, color, type, density, previewSize) => {
  // Checkerboard pattern
  if (type === 'checker') {
    const cellX = Math.floor(x + previewSize / 2);
    const cellY = Math.floor(y + previewSize / 2);
    return (cellX + cellY) % 2 === 0 ? color : '#FFFFFF';
  }

  // Dot pattern
  if (type === 'dot') {
    const distance = Math.sqrt(x * x + y * y);
    const threshold = ((1 - density) * previewSize) / 4;
    return distance < threshold ? color : null;
  }

  // For other patterns, default to the active color
  return color;
};

/**
 * Custom hook for brush preview functionality
 */
/**
 * Generate symmetry cells for preview
 */
const generateSymmetryCells = (cells, mode, size) => {
  const symmetryCells = [];
  const halfSize = size / 2;

  for (const cell of cells) {
    const { x, y } = cell;

    switch (mode) {
      case 'horizontal': {
        symmetryCells.push({ ...cell, x: size - 1 - x });
        break;
      }
      case 'vertical': {
        symmetryCells.push({ ...cell, y: size - 1 - y });
        break;
      }
      case 'quad': {
        symmetryCells.push({ ...cell, x: size - 1 - x });
        symmetryCells.push({ ...cell, y: size - 1 - y });
        symmetryCells.push({ ...cell, x: size - 1 - x, y: size - 1 - y });
        break;
      }
      case 'radial': {
        // 8-way radial symmetry (simplified for preview)
        const dx = x - halfSize;
        const dy = y - halfSize;

        for (let i = 1; i < 8; i++) {
          const angle = (Math.PI / 4) * i;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const rotatedX = Math.round(dx * cos - dy * sin + halfSize);
          const rotatedY = Math.round(dx * sin + dy * cos + halfSize);

          if (rotatedX >= 0 && rotatedX < size && rotatedY >= 0 && rotatedY < size) {
            symmetryCells.push({
              ...cell,
              x: rotatedX,
              y: rotatedY,
            });
          }
        }
        break;
      }
      case 'mirror': {
        symmetryCells.push({
          ...cell,
          x: size - 1 - x,
          y: y,
        });

        symmetryCells.push({
          ...cell,
          x: x,
          y: size - 1 - y,
        });

        symmetryCells.push({
          ...cell,
          x: size - 1 - x,
          y: size - 1 - y,
        });
        break;
      }
      default:
        // No symmetry transformation for unknown modes
        break;
    }
  }

  return symmetryCells;
};

const useBrushPreview = ({ brushSettings, activeColor, isDrawing }) => {
  const [visible, setVisible] = useState(true);
  const [previewCells, setPreviewCells] = useState([]);

  // Extract settings
  const { brushSize, brushShape, symmetryMode } = brushSettings || {};

  // Helper function to determine if a position is within the brush shape
  const isPositionInBrush = useCallback(
    (offsetX, offsetY, size, shape) => isPositionInBrushShape(offsetX, offsetY, size, shape),
    []
  );

  // Helper function to blend colors
  const blendColors = useCallback(
    (color1, color2, ratio) => blendColorValues(color1, color2, ratio),
    []
  );

  // Helper function to get color for a preview cell
  const getPreviewColor = useCallback(
    (x, y, color, settings, previewSize) => {
      if (!settings) return color;

      const { brushType, patternSettings, gradientSettings } = settings;

      if (brushType === 'eraser') {
        return '#FFFFFF'; // Show eraser as white in preview
      }

      if (brushType === 'filled') {
        return color;
      }

      if (brushType === 'gradient' && gradientSettings) {
        const { startColor, endColor, type, angle } = gradientSettings;

        if (type === 'linear') {
          return getLinearGradientColor(
            x,
            y,
            startColor,
            endColor,
            angle,
            previewSize,
            blendColors
          );
        } else if (type === 'radial') {
          return getRadialGradientColor(x, y, startColor, endColor, previewSize, blendColors);
        }

        return startColor;
      }

      if (brushType === 'patterned' && patternSettings) {
        const { type, density } = patternSettings;
        return getPatternColor(x, y, color, type, density, previewSize);
      }

      return color;
    },
    [blendColors]
  );

  /**
   * Create brush cells based on brush properties
   */
  const createBrushCells = useCallback(() => {
    if (!brushSettings || !activeColor) return [];

    const cells = [];
    const halfSize = Math.floor(brushSize / 2);
    const previewGridSize = brushSize * 2; // Make preview bigger

    for (let y = -halfSize; y <= halfSize; y++) {
      for (let x = -halfSize; x <= halfSize; x++) {
        if (isPositionInBrush(x, y, brushSize, brushShape)) {
          const color = getPreviewColor(x, y, activeColor, brushSettings, previewGridSize);
          if (color) {
            cells.push({
              x: x + halfSize,
              y: y + halfSize,
              color,
            });
          }
        }
      }
    }
    return cells;
  }, [brushSettings, activeColor, brushSize, brushShape, isPositionInBrush, getPreviewColor]);

  /**
   * Generate cells for brush preview based on settings
   */
  const generatePreviewCells = useCallback(() => {
    const cells = createBrushCells();

    // Add symmetry cells if enabled
    if (symmetryMode && symmetryMode !== 'none') {
      const previewGridSize = brushSize * 2;
      const newSymmetryCells = generateSymmetryCells(cells, symmetryMode, previewGridSize);
      cells.push(...newSymmetryCells);
    }

    return cells;
  }, [createBrushCells, symmetryMode, brushSize]);

  // Generate brush preview data
  useEffect(() => {
    const cells = generatePreviewCells();
    setPreviewCells(cells);
  }, [generatePreviewCells]);

  // Update visibility based on isDrawing state
  useEffect(() => {
    setVisible(!isDrawing);
  }, [isDrawing]);

  // Cell size in pixels for the preview
  const cellSize = 8;

  // Calculate preview size based on brush size
  const previewSize = brushSize ? brushSize * 2 * cellSize : 0;

  return {
    previewCells,
    visible,
    cellSize,
    previewSize,
  };
};

export default useBrushPreview;
