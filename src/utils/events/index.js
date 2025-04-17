/**
 * Centralized Event Handling Utilities
 * 
 * This module provides standardized event handling functions to prevent
 * duplicate implementations across components.
 */

// Common event handlers for mouse interactions
export const mouseHandlers = {
  /**
   * Creates a standardized mouse drag handler with start, move, and end callbacks
   * @param {Function} onDragStart - Called when drag starts with (event, initialPosition)
   * @param {Function} onDragMove - Called during drag with (event, currentPosition, initialPosition)
   * @param {Function} onDragEnd - Called when drag ends with (event, finalPosition, initialPosition)
   * @returns {Object} Mouse event handlers to spread into a component
   */
  useDrag: (onDragStart, onDragMove, onDragEnd) => {
    let isDragging = false;
    let initialPosition = { x: 0, y: 0 };
    
    const handleMouseDown = (event) => {
      isDragging = true;
      initialPosition = { x: event.clientX, y: event.clientY };
      
      if (onDragStart) {
        onDragStart(event, initialPosition);
      }
      
      // Add document-level event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (event) => {
      if (!isDragging) return;
      
      const currentPosition = { x: event.clientX, y: event.clientY };
      
      if (onDragMove) {
        onDragMove(event, currentPosition, initialPosition);
      }
    };
    
    const handleMouseUp = (event) => {
      if (!isDragging) return;
      
      isDragging = false;
      const finalPosition = { x: event.clientX, y: event.clientY };
      
      if (onDragEnd) {
        onDragEnd(event, finalPosition, initialPosition);
      }
      
      // Clean up document-level event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    return {
      onMouseDown: handleMouseDown,
      // We don't return onMouseMove or onMouseUp since they're added to document
    };
  },
  
  /**
   * Creates a mouse hover handler with enter and leave callbacks
   * @param {Function} onHoverStart - Called when hover starts
   * @param {Function} onHoverEnd - Called when hover ends
   * @returns {Object} Mouse event handlers for hover state
   */
  useHover: (onHoverStart, onHoverEnd) => {
    return {
      onMouseEnter: onHoverStart,
      onMouseLeave: onHoverEnd
    };
  }
};

// Keyboard event handlers
export const keyboardHandlers = {
  /**
   * Creates keyboard event handlers with callback for specific keys
   * @param {Array<string>} keys - Array of key names to listen for
   * @param {Function} onKeyPressed - Callback when key is pressed
   * @param {Object} options - Additional options like preventDefault
   * @returns {Object} Keyboard event handler
   */
  useKeyPress: (keys, onKeyPressed, options = { preventDefault: false }) => {
    const handleKeyDown = (event) => {
      if (keys.includes(event.key)) {
        if (options.preventDefault) {
          event.preventDefault();
        }
        onKeyPressed(event.key, event);
      }
    };
    
    return {
      onKeyDown: handleKeyDown
    };
  },
  
  /**
   * Handles arrow key navigation
   * @param {Function} onArrowKey - Callback with direction information
   * @returns {Object} Keyboard event handler for arrow keys
   */
  useArrowKeys: (onArrowKey) => {
    const handleKeyDown = (event) => {
      const directions = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right'
      };
      
      if (directions[event.key]) {
        event.preventDefault();
        onArrowKey(directions[event.key], event);
      }
    };
    
    return {
      onKeyDown: handleKeyDown
    };
  }
};

// Touch event handlers (for mobile support)
export const touchHandlers = {
  /**
   * Creates touch drag handler similar to mouse drag
   * @param {Function} onDragStart - Called when touch starts
   * @param {Function} onDragMove - Called during touch move
   * @param {Function} onDragEnd - Called when touch ends
   * @returns {Object} Touch event handlers
   */
  useTouchDrag: (onDragStart, onDragMove, onDragEnd) => {
    let isDragging = false;
    let initialPosition = { x: 0, y: 0 };
    
    const handleTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      
      isDragging = true;
      initialPosition = { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      };
      
      if (onDragStart) {
        onDragStart(event, initialPosition);
      }
    };
    
    const handleTouchMove = (event) => {
      if (!isDragging || event.touches.length !== 1) return;
      
      const currentPosition = { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      };
      
      if (onDragMove) {
        onDragMove(event, currentPosition, initialPosition);
      }
    };
    
    const handleTouchEnd = (event) => {
      if (!isDragging) return;
      
      isDragging = false;
      
      // Get the position from the changedTouches as touches is empty on touchend
      const finalPosition = event.changedTouches.length > 0 
        ? { 
            x: event.changedTouches[0].clientX, 
            y: event.changedTouches[0].clientY 
          }
        : initialPosition;
      
      if (onDragEnd) {
        onDragEnd(event, finalPosition, initialPosition);
      }
    };
    
    return {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    };
  }
};

// Combined handlers for both mouse and touch
export const combinedHandlers = {
  /**
   * Creates handlers that work for both mouse and touch events
   * @param {Function} onDragStart - Called when drag starts
   * @param {Function} onDragMove - Called during drag
   * @param {Function} onDragEnd - Called when drag ends
   * @returns {Object} Combined event handlers
   */
  useDrag: (onDragStart, onDragMove, onDragEnd) => {
    const mouse = mouseHandlers.useDrag(onDragStart, onDragMove, onDragEnd);
    const touch = touchHandlers.useTouchDrag(onDragStart, onDragMove, onDragEnd);
    
    return {
      ...mouse,
      ...touch
    };
  }
};
