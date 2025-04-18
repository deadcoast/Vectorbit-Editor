/**
 * BrushPreviewGenerator component
 *
 * This component handles the generation of brush previews
 */
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import { isPositionInBrush } from './utils/brushUtils';
import { determineCellColor } from './utils/colorUtils';

/**
 * Component for generating brush previews
 */
const BrushPreviewGenerator = ({
  activeColor,
  brushShape,
  brushSize,
  brushType,
  generatePattern,
  gradientSettings,
  gridSize,
  patternCache,
  patternSettings,
}) => {
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
          const colorSettings = {
            brushType,
            activeColor,
            gridSize,
            patternSettings,
            gradientSettings,
            brushSize,
            patternCache: patternCache.current,
            generatePattern,
          };
          const color = determineCellColor(x, y, colorSettings);
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }

    return canvas;
  }, [
    activeColor,
    brushShape,
    brushSize,
    brushType,
    generatePattern,
    gradientSettings,
    gridSize,
    patternCache,
    patternSettings,
  ]);

  return { generateBrushPreview };
};

// Add PropTypes for type checking
BrushPreviewGenerator.propTypes = {
  activeColor: PropTypes.string.isRequired,
  brushShape: PropTypes.string,
  brushSize: PropTypes.number.isRequired,
  brushType: PropTypes.string.isRequired,
  generatePattern: PropTypes.func.isRequired,
  gradientSettings: PropTypes.shape({
    angle: PropTypes.number,
    endColor: PropTypes.string,
    startColor: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  gridSize: PropTypes.number.isRequired,
  patternCache: PropTypes.shape({
    current: PropTypes.object,
  }).isRequired,
  patternSettings: PropTypes.shape({
    angle: PropTypes.number,
    density: PropTypes.number,
    scale: PropTypes.number,
    type: PropTypes.string,
  }).isRequired,
};

export default BrushPreviewGenerator;
