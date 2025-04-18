import { useState, useRef, useEffect } from 'react';

import Grid from './components/grid/Grid';
import Controls from './components/Toolbar/Controls.js';
import { usePresetStorage } from './state/presets';
import { useAnchorHistory } from './state/useAnchorHistory';
import { handleNewFile, handleOpenFile, handleSaveFile } from './utils/fileHandlers';
import { renderGridOverlay } from './utils/grid/gridUtils';
import './App.css';

const App = () => {
  const [gridSize, setGridSize] = useState(16); // Initial grid size
  const [gridVisible, setGridVisible] = useState(true); // Grid visibility toggle
  const [activeTool, setActiveTool] = useState('brush'); // Active tool selection
  const [activeColor, setActiveColor] = useState('#000000'); // Initial color
  const [exportFormat, setExportFormat] = useState('png'); // Add state for export format
  const [layers, setLayers] = useState([
    {
      id: 'layer-1',
      name: 'Background',
      visible: true,
      opacity: 1,
      gridData: {},
    },
  ]); // Layer management
  const [activeLayer, setActiveLayer] = useState('layer-1'); // Active layer selection

  const gridCanvasRef = useRef(null); // Ref for the grid canvas
  const { addToHistory, undo, redo, history, historyIndex } = useAnchorHistory(); // Undo/Redo integration
  const { presets, savePreset, deletePreset } = usePresetStorage(); // Preset management

  // Handlers for file operations
  const createNewFile = () => {
    handleNewFile(() => {
      setGridSize(16);
      setActiveTool('brush');
      setActiveColor('#000000');
      setLayers([
        {
          id: 'layer-1',
          name: 'Background',
          visible: true,
          opacity: 1,
          gridData: {},
        },
      ]);
      setActiveLayer('layer-1');
    });
  };

  const openExistingFile = () => {
    handleOpenFile(loadedState => {
      setGridSize(loadedState.gridSize || 16);
      setLayers(loadedState.layers || []);
      setActiveLayer(loadedState.activeLayer || 'layer-1');
      setActiveColor(loadedState.activeColor || '#000000');
      console.log('File opened successfully:', loadedState);
    });
  };

  const saveCurrentFile = () => {
    const currentState = {
      gridSize,
      layers,
      activeLayer,
      activeColor,
      presets,
    };
    handleSaveFile(currentState);
  };

  // Placeholder for saving default export format
  const saveDefaultExportFormat = () => {
    console.log(`Default export format set to: ${exportFormat}`);
    // Here you might save to localStorage or user settings
    alert(`Default export format saved as ${exportFormat.toUpperCase()}`);
  };

  // Toggle grid visibility
  const toggleGridVisibility = () => {
    setGridVisible(prev => !prev);
  };

  // Undo and redo operations
  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      setLayers(previousState.layers || []);
      setActiveLayer(previousState.activeLayer || 'layer-1');
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setLayers(nextState.layers || []);
      setActiveLayer(nextState.activeLayer || 'layer-1');
    }
  };

  // Automatically save to history on layer or tool change
  useEffect(() => {
    addToHistory({ layers, activeLayer, activeColor });
  }, [layers, activeLayer, activeColor, addToHistory]);

  // Render grid overlay dynamically
  useEffect(() => {
    if (gridVisible && gridCanvasRef.current) {
      const ctx = gridCanvasRef.current.getContext('2d');
      renderGridOverlay(ctx, gridSize, 512); // Assuming 512px canvas size
    }
  }, [gridVisible, gridSize]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Vectorbit</h1>
      </header>

      <main className="main">
        {/* Controls Component */}
        <Controls
          availableTools={['brush', 'eraser', 'fill']}
          exportFormat={exportFormat}
          gridOverlay={gridVisible}
          handleNewFile={createNewFile}
          handleOpenFile={openExistingFile}
          handleSaveFile={saveCurrentFile}
          redo={handleRedo}
          resetState={createNewFile}
          saveDefaultExportFormat={saveDefaultExportFormat}
          setActiveColor={setActiveColor}
          setActiveTool={setActiveTool}
          setExportFormat={setExportFormat}
          setGridOverlay={setGridVisible}
          setGridSize={setGridSize}
          setState={newState => {
            setGridSize(newState.gridSize || 16);
            setLayers(newState.layers || []);
            setActiveLayer(newState.activeLayer || 'layer-1');
            setActiveColor(newState.activeColor || '#000000');
          }}
          state={{ activeColor, canvasRef: gridCanvasRef }}
          toggleGrid={toggleGridVisibility}
          undo={handleUndo}
        />

        {/* Grid Component */}
        <Grid
          ref={gridCanvasRef}
          activeColor={activeColor}
          activeLayer={activeLayer}
          activeTool={activeTool}
          gridSize={gridSize}
          gridVisible={gridVisible}
          layers={layers}
          setGridOverlay={setGridVisible} // Pass the setter function
          setLayers={setLayers}
        />
      </main>

      <footer className="footer">
        <p>Created with ❤️ for pixel artists.</p>
      </footer>
    </div>
  );
};

export default App;
