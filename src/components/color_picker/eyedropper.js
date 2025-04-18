// src/components/color_picker/eyedropper.js

/**
 * Gets color from a canvas at the specified x,y coordinates
 * @param {HTMLCanvasElement} canvas - The canvas to get color from
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {string} - Color in hex or rgba format
 */
export const getColorFromCanvas = (canvas, x, y) => {
  if (!canvas) return 'rgba(0, 0, 0, 0)';

  const ctx = canvas.getContext('2d');
  if (!ctx) return 'rgba(0, 0, 0, 0)';

  const pixel = ctx.getImageData(x, y, 1, 1).data;

  // If pixel is transparent, return rgba format
  if (pixel[3] < 255) {
    return `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
  }

  // Otherwise convert to hex
  return `#${pixel[0].toString(16).padStart(2, '0')}${pixel[1].toString(16).padStart(2, '0')}${pixel[2].toString(16).padStart(2, '0')}`;
};

/**
 * Initializes the eyedropper tool
 * @param {HTMLCanvasElement} canvas - The source canvas
 * @param {Function} onColorSelect - Callback function when color is selected
 * @returns {Function} - Function to disable the eyedropper
 */
export const initializeEyeDropper = (canvas, onColorSelect) => {
  if (!canvas || typeof onColorSelect !== 'function') {
    return () => {}; // Return no-op cleanup function
  }

  const handleMouseMove = e => {
    const rect = canvas.getBoundingClientRect();
    // These coordinates are captured but not used in this implementation
    // They would be used for previewing the color under the cursor
    // eslint-disable-next-line no-unused-vars
    const x = e.clientX - rect.left;
    // eslint-disable-next-line no-unused-vars
    const y = e.clientY - rect.top;
  };

  const handleClick = e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = getColorFromCanvas(canvas, x, y);
    onColorSelect(color);
  };

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('click', handleClick);

  // Return cleanup function
  return () => {
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('click', handleClick);
  };
};
