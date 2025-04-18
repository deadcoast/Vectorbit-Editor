/**
 * Tooltip Component
 *
 * Provides contextual tooltips for UI elements
 */
import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 400,
  shortcut = null,
  disabled = false,
  className = '',
  maxWidth = 250,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  // Show tooltip after delay
  const showTooltip = () => {
    if (disabled) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  // Hide tooltip
  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  // Update tooltip position
  const updatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 8;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + 8;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        left = targetRect.right + 8;
        break;
      default:
        top = targetRect.top - tooltipRect.height - 8;
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    }

    // Ensure tooltip stays within viewport
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add scroll position to get absolute position
    top += scrollTop;
    left += scrollLeft;

    // Check right boundary
    if (left + tooltipRect.width > window.innerWidth + scrollLeft) {
      left = window.innerWidth + scrollLeft - tooltipRect.width - 8;
    }

    // Check left boundary
    if (left < scrollLeft) {
      left = scrollLeft + 8;
    }

    // Check top boundary
    if (top < scrollTop) {
      top = targetRect.bottom + scrollTop + 8;
    }

    // Check bottom boundary
    if (top + tooltipRect.height > window.innerHeight + scrollTop) {
      top = targetRect.top + scrollTop - tooltipRect.height - 8;
    }

    setTooltipPosition({ top, left });
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // Update position if visible
  useEffect(() => {
    if (isVisible) {
      updatePosition();

      // Add resize listener to update position on window resize
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible]);

  // Format shortcut for display
  const formatShortcut = shortcutKey => {
    if (!shortcutKey) return null;

    return shortcutKey
      .split('+')
      .map(key => {
        switch (key) {
          case 'Control':
            return navigator.platform.includes('Mac') ? '⌃' : 'Ctrl';
          case 'Meta':
            return navigator.platform.includes('Mac') ? '⌘' : 'Win';
          case 'Alt':
            return navigator.platform.includes('Mac') ? '⌥' : 'Alt';
          case 'Shift':
            return '⇧';
          case 'ArrowUp':
            return '↑';
          case 'ArrowDown':
            return '↓';
          case 'ArrowLeft':
            return '←';
          case 'ArrowRight':
            return '→';
          default:
            return key.length === 1 ? key.toUpperCase() : key;
        }
      })
      .join(' + ');
  };

  return (
    <div
      ref={targetRef}
      className={`tooltip-container ${className}`}
      onBlur={hideTooltip}
      onFocus={showTooltip}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip-${position}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            maxWidth: `${maxWidth}px`,
          }}
        >
          <div className="tooltip-content">
            {content}
            {shortcut && <span className="tooltip-shortcut">{formatShortcut(shortcut)}</span>}
          </div>
          <div className={`tooltip-arrow tooltip-arrow-${position}`} />
        </div>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  shortcut: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  maxWidth: PropTypes.number,
};

export default Tooltip;
