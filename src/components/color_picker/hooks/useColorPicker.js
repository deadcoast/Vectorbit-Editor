import { useState, useRef, useContext, useCallback } from 'react';

import { ColorContext } from '../ColorContext';

/**
 * Custom hook for managing color selection and recent colors
 */
const useColorManagement = () => {
  const { activeColor, setActiveColor, recentColors, addToRecentColors } = useContext(ColorContext);

  // Add a color to recent colors
  const addRecentColor = useCallback(
    color => {
      if (!recentColors.includes(color)) {
        addToRecentColors(color);
      }
    },
    [recentColors, addToRecentColors]
  );

  // Handle color change
  const handleColorChange = useCallback(
    color => {
      const hexColor = color.hex || color;
      setActiveColor(hexColor);
      addRecentColor(hexColor);
    },
    [setActiveColor, addRecentColor]
  );

  return {
    activeColor,
    recentColors,
    addRecentColor,
    handleColorChange,
  };
};

/**
 * Custom hook for the eyedropper tool functionality
 */
const useEyeDropper = (gridRef, handleColorChange) => {
  const [eyeDropperActive, setEyeDropperActive] = useState(false);

  // Toggle eye dropper tool
  const handleEyeDropperToggle = useCallback(() => {
    setEyeDropperActive(prev => !prev);
  }, []);

  // Handle eye dropper activation
  const handleEyeDropper = useCallback(
    event => {
      if (!gridRef?.current) {
        return;
      }
      const canvas = gridRef.current.querySelector('canvas');
      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      const x = Math.floor(event.clientX - rect.left);
      const y = Math.floor(event.clientY - rect.top);
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const rgbaColor = `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`;
      handleColorChange({ hex: rgbaColor });
    },
    [gridRef, handleColorChange]
  );

  return {
    eyeDropperActive,
    handleEyeDropperToggle,
    handleEyeDropper,
  };
};

/**
 * Custom hook for gradient management
 */
const useGradient = (activeColor, onAddToPalette) => {
  const [gradientStops, setGradientStops] = useState([0, 100]);
  const [gradientStart, setGradientStart] = useState('#ffffff');
  const [gradientEnd, setGradientEnd] = useState('#000000');
  const gradientPreviewRef = useRef(null);

  // Save gradient
  const handleGradientSave = useCallback(() => {
    const gradient = `linear-gradient(to right, ${gradientStart}, ${gradientEnd})`;
    onAddToPalette(gradient);
  }, [gradientStart, gradientEnd, onAddToPalette]);

  // Handle gradient drag
  const handleGradientDrag = useCallback(
    (index, event) => {
      if (!gradientPreviewRef.current) return;

      const preview = gradientPreviewRef.current;
      const rect = preview.getBoundingClientRect();
      const percentage = ((event.clientX - rect.left) / rect.width) * 100;
      setGradientStops(stops =>
        stops.map((stop, i) => (i === index ? Math.min(Math.max(percentage, 0), 100) : stop))
      );
    },
    [gradientPreviewRef]
  );

  // Create gradient style
  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops
      .map(stop => `${activeColor} ${stop}%`)
      .join(', ')})`,
  };

  return {
    gradientEnd,
    gradientPreviewRef,
    gradientStart,
    gradientStops,
    gradientStyle,
    handleGradientDrag,
    handleGradientSave,
    setGradientEnd,
    setGradientStart,
    setGradientStops,
  };
};

/**
 * Custom hook for palette management
 */
const usePalette = (recentColors, addToRecentColors, activeColor, onAssignToAnchor) => {
  const [savedPalettes, setSavedPalettes] = useState({});
  const [paletteName, setPaletteName] = useState('');

  // Handle saving a palette
  const handleSavePalette = useCallback(() => {
    if (paletteName.trim() && !savedPalettes[paletteName]) {
      setSavedPalettes(prev => ({
        ...prev,
        [paletteName]: [...recentColors],
      }));
      setPaletteName(''); // Reset input
    } else {
      alert('Palette name is invalid or already exists.');
    }
  }, [paletteName, savedPalettes, recentColors]);

  // Handle loading a saved palette
  const handleLoadPalette = useCallback(
    name => {
      const palette = savedPalettes[name];
      if (palette) {
        palette.forEach(color => addToRecentColors(color));
      }
    },
    [savedPalettes, addToRecentColors]
  );

  // Handle preset application
  const handleApplyPreset = useCallback(
    preset => {
      // Map of preset names to their color values
      const presets = {
        warmTones: ['#FF5733', '#FF8C42', '#FFBA49'],
        coolTones: ['#4286f4', '#42b0f4', '#42f4d1'],
        grayscale: ['#111111', '#777777', '#DDDDDD'],
        earthy: ['#5D4037', '#795548', '#A1887F'],
      };

      if (presets[preset]) {
        presets[preset].forEach(color => addToRecentColors(color));
      }
    },
    [addToRecentColors]
  );

  // Assign color to anchor
  const handleAssignToAnchor = useCallback(() => {
    onAssignToAnchor(activeColor);
  }, [activeColor, onAssignToAnchor]);

  return {
    paletteName,
    savedPalettes,
    handleApplyPreset,
    handleAssignToAnchor,
    handleLoadPalette,
    handleSavePalette,
    setPaletteName,
  };
};

/**
 * Main custom hook for the ColorPicker component functionality
 * Combines all sub-hooks to provide complete functionality
 */
const useColorPicker = ({ onAddToPalette, onAssignToAnchor, gridRef }) => {
  const colorManagement = useColorManagement();
  const eyeDropper = useEyeDropper(gridRef, colorManagement.handleColorChange);
  const gradient = useGradient(colorManagement.activeColor, onAddToPalette);
  const palette = usePalette(
    colorManagement.recentColors,
    colorManagement.addRecentColor,
    colorManagement.activeColor,
    onAssignToAnchor
  );

  // Setup mouse event handlers for gradient stops
  const handleGradientStopMouseDown = useCallback(
    index => {
      return () => {
        const onMouseMove = ev => gradient.handleGradientDrag(index, ev);
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };
    },
    [gradient]
  );

  // Handle keyboard navigation for gradient stops
  const handleGradientStopKeyDown = useCallback(
    ({ stop, index }) => {
      return event => {
        if (event.key === 'ArrowLeft') {
          const newStop = Math.max(stop - 1, 0);
          gradient.setGradientStops(stops => stops.map((s, i) => (i === index ? newStop : s)));
        } else if (event.key === 'ArrowRight') {
          const newStop = Math.min(stop + 1, 100);
          gradient.setGradientStops(stops => stops.map((s, i) => (i === index ? newStop : s)));
        }
      };
    },
    [gradient]
  );

  // Return all necessary state and handlers combined from sub-hooks
  return {
    ...colorManagement,
    ...eyeDropper,
    ...gradient,
    ...palette,
    handleGradientStopKeyDown,
    handleGradientStopMouseDown,
  };
};

export default useColorPicker;
export { useColorManagement, useEyeDropper, useGradient, usePalette };
