/**
 * Utility functions for brush event handling
 */

/**
 * Sets up mouse event listeners for brush cursor tracking
 * @param {object} options - Options for event handling
 * @param {object} options.gridRef - Reference to the grid element
 * @param {function} options.setCursorPosition - Function to set cursor position
 * @param {function} options.setIsDrawing - Function to set drawing state
 * @returns {function} Cleanup function to remove event listeners
 */
export const setupBrushEvents = ({ gridRef, setCursorPosition, setIsDrawing }) => {
  if (!gridRef || !gridRef.current) return () => {};

  const handleMouseMove = e => {
    // Get the mouse position relative to the grid
    setCursorPosition({
      x: e.clientX,
      y: e.clientY,
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

  // Return cleanup function
  return () => {
    grid.removeEventListener('mousemove', handleMouseMove);
    grid.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mouseup', handleMouseUp);
    grid.removeEventListener('mouseleave', handleMouseLeave);
  };
};
