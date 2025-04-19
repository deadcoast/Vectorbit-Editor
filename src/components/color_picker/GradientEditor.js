// File: src/components/color_picker/GradientEditor.js
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';

/**
 * GradientStop component for individual gradient control points
 */
const GradientStop = ({
  addGradientToHistory,
  gradientStops,
  handleGradientDrag,
  index,
  setGradientStops,
  stop,
}) => {
  return (
    <div
      key={index}
      aria-label={`Gradient stop at ${stop}%`}
      aria-valuemax="100"
      aria-valuemin="0"
      aria-valuenow={stop}
      className="gradient-stop"
      role="slider"
      style={{ left: `${stop}%` }}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'ArrowLeft') {
          const newValue = Math.max(0, stop - 5);
          setGradientStops(stops => stops.map((s, i) => (i === index ? newValue : s)));
        } else if (e.key === 'ArrowRight') {
          const newValue = Math.min(100, stop + 5);
          setGradientStops(stops => stops.map((s, i) => (i === index ? newValue : s)));
        }
      }}
      onMouseDown={_e => {
        const onMouseMove = ev => handleGradientDrag(index, ev);
        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          addGradientToHistory([...gradientStops]);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }}
    />
  );
};

GradientStop.propTypes = {
  addGradientToHistory: PropTypes.func.isRequired,
  gradientStops: PropTypes.arrayOf(PropTypes.number).isRequired,
  handleGradientDrag: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  setGradientStops: PropTypes.func.isRequired,
  stop: PropTypes.number.isRequired,
};

/**
 * GradientControls component for gradient manipulation buttons
 */
const GradientControls = ({ addGradientStop, removeGradientStop, undoGradient, redoGradient }) => (
  <div className="gradient-controls">
    <button
      aria-label="Add Gradient Stop"
      title="Add Gradient Stop"
      onClick={addGradientStop}
    >
      Add Stop
    </button>
    <button
      aria-label="Remove Gradient Stop"
      title="Remove Gradient Stop"
      onClick={removeGradientStop}
    >
      Remove Stop
    </button>
    <button
      aria-label="Undo Gradient Change"
      title="Undo Gradient Change"
      onClick={undoGradient}
    >
      Undo
    </button>
    <button
      aria-label="Redo Gradient Change"
      title="Redo Gradient Change"
      onClick={redoGradient}
    >
      Redo
    </button>
  </div>
);

GradientControls.propTypes = {
  addGradientStop: PropTypes.func.isRequired,
  redoGradient: PropTypes.func.isRequired,
  removeGradientStop: PropTypes.func.isRequired,
  undoGradient: PropTypes.func.isRequired,
};

/**
 * GradientEditor component that provides UI for creating and editing color gradients
 */
const GradientEditor = ({ activeColor }) => {
  const [gradientStops, setGradientStops] = useState([0, 100]); // Positions for gradient stops
  const gradientPreviewRef = useRef(null);
  const [gradientHistory, setGradientHistory] = useState([]);
  const [gradientIndex, setGradientIndex] = useState(-1);

  // Helper function to snap values to a grid
  const snapToGrid = (value, step = 5) => Math.round(value / step) * step;

  // Handle dragging gradient stops
  const handleGradientDrag = (index, event) => {
    const rect = gradientPreviewRef.current.getBoundingClientRect();
    const percentage = snapToGrid(((event.clientX - rect.left) / rect.width) * 100);
    setGradientStops(stops =>
      stops.map((stop, i) => (i === index ? Math.min(Math.max(percentage, 0), 100) : stop))
    );
  };

  // Add or remove gradient stops
  const addGradientStop = () => {
    setGradientStops([...gradientStops, 50]); // Add a stop at the center
  };

  const removeGradientStop = () => {
    if (gradientStops.length > 2) {
      setGradientStops(stops => stops.slice(0, -1));
    }
  };

  // Gradient history management
  const addGradientToHistory = gradient => {
    const newHistory = [...gradientHistory.slice(0, gradientIndex + 1), gradient];
    setGradientHistory(newHistory);
    setGradientIndex(newHistory.length - 1);
  };

  const undoGradient = () => {
    if (gradientIndex > 0) {
      setGradientIndex(gradientIndex - 1);
      const previousGradient = gradientHistory[gradientIndex - 1];
      setGradientStops(previousGradient || [0, 100]);
    }
  };

  const redoGradient = () => {
    if (gradientIndex < gradientHistory.length - 1) {
      setGradientIndex(gradientIndex + 1);
      const nextGradient = gradientHistory[gradientIndex + 1];
      setGradientStops(nextGradient || [0, 100]);
    }
  };

  const gradientStyle = {
    background: `linear-gradient(to right, ${gradientStops
      .map(stop => `${activeColor} ${stop}%`)
      .join(', ')})`,
  };

  return (
    <div className="gradient-generator">
      <h4>Gradient Editor</h4>
      <div ref={gradientPreviewRef} className="gradient-preview" style={gradientStyle}>
        {gradientStops.map((stop, index) => (
          <GradientStop
            key={index}
            addGradientToHistory={addGradientToHistory}
            gradientStops={gradientStops}
            handleGradientDrag={handleGradientDrag}
            index={index}
            setGradientStops={setGradientStops}
            stop={stop}
          />
        ))}
      </div>
      <GradientControls
        addGradientStop={addGradientStop}
        redoGradient={redoGradient}
        removeGradientStop={removeGradientStop}
        undoGradient={undoGradient}
      />
    </div>
  );
};

GradientEditor.propTypes = {
  activeColor: PropTypes.string.isRequired,
};

export default GradientEditor;
