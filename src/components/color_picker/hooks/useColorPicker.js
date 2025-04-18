import { useState, useRef, useContext, useCallback } from 'react';
import { ColorContext } from '../ColorContext';

/**
 * Custom hook for the ColorPicker component functionality
 */
const useColorPicker = ({ onAddToPalette, onAssignToAnchor, gridRef }) => {
  // Get color context
  const { activeColor, setActiveColor, recentColors, addToRecentColors } = useContext(ColorContext);

  // State for gradient management
  const [gradientStops, setGradientStops] = useState([0, 100]);
  const [gradientStart, setGradientStart] = useState('#ffffff');
  const [gradientEnd, setGradientEnd] = useState('#000000');
  const gradientPreviewRef = useRef(null);

  // State for palettes management
  const [savedPalettes, setSavedPalettes] = useState({});
  const [paletteName, setPaletteName] = useState('');

  // Eye dropper tool state
  const [eyeDropperActive, setEyeDropperActive] = useState(false);

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

  // Create gradient style
  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops
      .map(stop => `${activeColor} ${stop}%`)
      .join(', ')})`,
  };

  // Setup mouse event handlers for gradient stops
  const handleGradientStopMouseDown = useCallback(
    index => {
      return () => {
        const onMouseMove = ev => handleGradientDrag(index, ev);
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };
    },
    [handleGradientDrag]
  );

  // Handle keyboard navigation for gradient stops
  const handleGradientStopKeyDown = useCallback((index, stop) => {
    return event => {
      if (event.key === 'ArrowLeft') {
        const newStop = Math.max(stop - 1, 0);
        setGradientStops(stops => stops.map((s, i) => (i === index ? newStop : s)));
      } else if (event.key === 'ArrowRight') {
        const newStop = Math.min(stop + 1, 100);
        setGradientStops(stops => stops.map((s, i) => (i === index ? newStop : s)));
      }
    };
  }, []);

  return {
    activeColor,
    recentColors,
    gradientStops,
    gradientStart,
    gradientEnd,
    gradientPreviewRef,
    gradientStyle,
    paletteName,
    savedPalettes,
    eyeDropperActive,
    setPaletteName,
    setGradientStart,
    setGradientEnd,
    handleColorChange,
    handleEyeDropperToggle,
    handleEyeDropper,
    handleGradientSave,
    handleGradientDrag,
    handleSavePalette,
    handleLoadPalette,
    handleGradientStopMouseDown,
    handleGradientStopKeyDown,
  };
};

export default useColorPicker;
