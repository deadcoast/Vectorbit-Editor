import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import { createContext, useState, useEffect, useCallback } from 'react';

export const ColorContext = createContext();

export const ColorProvider = ({ children, defaultColor = '#000000' }) => {
  const [activeColor, setActiveColor] = useState(defaultColor);
  const [recentColors, setRecentColors] = useState([]);
  const [gradientStops, setGradientStops] = useState([0, 100]); // Default gradient stops

  // Load recent colors from localStorage on mount
  useEffect(() => {
    const savedColors = JSON.parse(localStorage.getItem('recentColors')) || [];
    setRecentColors(savedColors);
  }, []);

  // Save recent colors to localStorage on change
  useEffect(() => {
    localStorage.setItem('recentColors', JSON.stringify(recentColors));
  }, [recentColors]);

  // Add a color to recent colors (debounced for performance)
  const debouncedSetRecentColors = useCallback(
    debounce(colors => setRecentColors(colors), 300),
    []
  );

  const addToRecentColors = color => {
    const updatedColors = [color, ...recentColors.filter(c => c !== color)].slice(0, 10); // Limit to 10
    debouncedSetRecentColors(updatedColors);
  };

  // Gradient Management Functions
  const addGradientStop = (position = 50) => {
    setGradientStops(stops => [...stops, position].sort((a, b) => a - b));
  };

  const removeGradientStop = index => {
    setGradientStops(stops => stops.filter((_, i) => i !== index));
  };

  const resetGradientStops = () => {
    setGradientStops([0, 100]); // Default stops
  };

  // Reset recent colors
  const resetRecentColors = () => {
    setRecentColors([]);
    localStorage.removeItem('recentColors');
  };

  return (
    <ColorContext.Provider
      value={{
        activeColor,
        setActiveColor,
        recentColors,
        addToRecentColors,
        gradientStops,
        setGradientStops,
        addGradientStop,
        removeGradientStop,
        resetGradientStops,
        resetRecentColors,
      }}
    >
      {children}
    </ColorContext.Provider>
  );
};

ColorProvider.propTypes = {
  children: PropTypes.node.isRequired,
  defaultColor: PropTypes.string,
};

ColorProvider.defaultProps = {
  defaultColor: '#000000',
};
