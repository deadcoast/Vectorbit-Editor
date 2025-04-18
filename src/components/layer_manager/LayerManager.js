import React, { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { BLEND_MODES } from '../../utils/blend/BlendModeProcessor';
import { setLayerLock, setLayerOpacity, setLayerBlendMode } from '../grid/GridManager';
import { useAnchorHistory } from '../state/useAnchorHistory';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import './LayerManager.css';

const LayerManager = ({ layers, setLayers, activeLayer, setActiveLayer }) => {
  const [renamingLayer, setRenamingLayer] = useState(null);
  const [newLayerName, setNewLayerName] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { addToHistory, undo, redo } = useAnchorHistory();

  // Maximum number of layers allowed
  const MAX_LAYERS = 50;

  // Layer template for consistent layer creation
  const createLayerTemplate = (name, options = {}) => ({
    id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    visible: true,
    opacity: 1,
    locked: false,
    blendMode: 'normal',
    mask: null,
    effects: [],
    gridData: {},
    ...options,
  });

  // Enhanced layer management functions
  const handleAddLayer = useCallback(() => {
    if (layers.length >= MAX_LAYERS) {
      showNotification('Maximum layer limit reached', 'error');
      return;
    }

    const newLayer = createLayerTemplate(`Layer ${layers.length + 1}`);
    const updatedLayers = [...layers, newLayer];
    setLayers(updatedLayers);
    addToHistory(updatedLayers);
    setActiveLayer(newLayer.id);
  }, [layers, setLayers, addToHistory, setActiveLayer]);

  const handleDuplicateLayer = useCallback(
    layerId => {
      const sourceLayers = layers.find(layer => layer.id === layerId);
      if (!sourceLayers) {
        return;
      }

      const duplicatedLayer = {
        ...createLayerTemplate(`${sourceLayers.name} Copy`),
        gridData: { ...sourceLayers.gridData },
        opacity: sourceLayers.opacity,
        blendMode: sourceLayers.blendMode,
      };

      const updatedLayers = [...layers, duplicatedLayer];
      setLayers(updatedLayers);
      addToHistory(updatedLayers);
    },
    [layers, setLayers, addToHistory]
  );

  const handleRemoveLayer = useCallback(
    id => {
      if (layers.length === 1) {
        showNotification('Cannot delete the only layer', 'error');
        return;
      }

      const updatedLayers = layers.filter(layer => layer.id !== id);
      setLayers(updatedLayers);
      addToHistory(updatedLayers);

      // If deleting active layer, select another layer
      if (id === activeLayer) {
        setActiveLayer(updatedLayers[updatedLayers.length - 1].id);
      }
    },
    [layers, activeLayer, setLayers, setActiveLayer, addToHistory]
  );

  const handleLayerPropertyChange = useCallback(
    (id, property, value) => {
      const updatedLayers = layers.map(layer =>
        layer.id === id ? { ...layer, [property]: value } : layer
      );
      setLayers(updatedLayers);
      addToHistory(updatedLayers);
    },
    [layers, setLayers, addToHistory]
  );

  // Layer organization functions
  const handleMoveLayer = useCallback(
    (sourceIndex, destinationIndex) => {
      const updatedLayers = Array.from(layers);
      const [removed] = updatedLayers.splice(sourceIndex, 1);
      updatedLayers.splice(destinationIndex, 0, removed);
      setLayers(updatedLayers);
      addToHistory(updatedLayers);
    },
    [layers, setLayers, addToHistory]
  );

  const handleMergeLayers = useCallback(
    (topLayerId, bottomLayerId) => {
      const topLayer = layers.find(layer => layer.id === topLayerId);
      const bottomLayer = layers.find(layer => layer.id === bottomLayerId);

      if (!topLayer || !bottomLayer) {
        return;
      }

      const mergedGridData = { ...bottomLayer.gridData };
      Object.entries(topLayer.gridData).forEach(([key, value]) => {
        if (value) {
          mergedGridData[key] = value;
        }
      });

      const mergedLayer = createLayerTemplate(`Merged Layer`, {
        gridData: mergedGridData,
        opacity: Math.max(topLayer.opacity, bottomLayer.opacity),
      });

      const updatedLayers = layers.filter(
        layer => layer.id !== topLayerId && layer.id !== bottomLayerId
      );
      updatedLayers.push(mergedLayer);

      setLayers(updatedLayers);
      addToHistory(updatedLayers);
      setActiveLayer(mergedLayer.id);
    },
    [layers, setLayers, setActiveLayer, addToHistory]
  );

  // Layer effects and blending modes
  const handleSetBlendMode = useCallback(
    (id, blendMode) => {
      handleLayerPropertyChange(id, 'blendMode', blendMode);
      // Also update with the new grid manager function
      setLayerBlendMode(id, blendMode, layers, setLayers);
    },
    [handleLayerPropertyChange, layers, setLayers]
  );

  // Layer opacity control
  const handleOpacityChange = useCallback(
    (id, opacity) => {
      handleLayerPropertyChange(id, 'opacity', opacity);
      // Also update with the new grid manager function
      setLayerOpacity(id, opacity, layers, setLayers);
    },
    [handleLayerPropertyChange, layers, setLayers]
  );

  // Layer locking functionality
  const handleLayerLockToggle = useCallback(
    id => {
      const layer = layers.find(layer => layer.id === id);
      if (!layer) return;

      const newLockedState = !layer.locked;
      handleLayerPropertyChange(id, 'locked', newLockedState);
      // Also update with the new grid manager function
      setLayerLock(id, newLockedState, layers, setLayers);

      // If locking the active layer, show a notification
      if (newLockedState && id === activeLayer) {
        showNotification('Active layer is now locked. Select another layer to draw.', 'info');
      }
    },
    [handleLayerPropertyChange, layers, setLayers, activeLayer]
  );

  const handleAddEffect = useCallback(
    (id, effect) => {
      const layer = layers.find(layer => layer.id === id);
      if (!layer) {
        return;
      }

      const updatedEffects = [...layer.effects, effect];
      handleLayerPropertyChange(id, 'effects', updatedEffects);
    },
    [layers, handleLayerPropertyChange]
  );

  // Notification system
  const showNotification = (message, type = 'info') => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = e => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'j':
            handleAddLayer();
            break;
          case 'd':
            if (activeLayer) {
              handleDuplicateLayer(activeLayer);
            }
            break;
          case 'z':
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleAddLayer, handleDuplicateLayer, activeLayer, undo, redo]);

  return (
    <div className="layer-manager">
      <h3>Layer Manager</h3>

      {showAlert && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      <DragDropContext
        onDragEnd={result => {
          if (!result.destination) {
            return;
          }
          handleMoveLayer(result.source.index, result.destination.index);
        }}
      >
        <Droppable droppableId="layers">
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {layers.map((layer, index) => (
                <Draggable key={layer.id} draggableId={layer.id} index={index}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`layer-item ${layer.id === activeLayer ? 'active' : ''}`}
                    >
                      {renamingLayer === layer.id ? (
                        <div className="rename-input">
                          <input
                            placeholder="Rename layer..."
                            type="text"
                            value={newLayerName}
                            onChange={e => setNewLayerName(e.target.value)}
                            onKeyPress={e => {
                              if (e.key === 'Enter') {
                                handleLayerPropertyChange(layer.id, 'name', newLayerName);
                              }
                            }}
                          />
                          <button
                            onClick={() =>
                              handleLayerPropertyChange(layer.id, 'name', newLayerName)
                            }
                          >
                            Save
                          </button>
                          <button onClick={() => setRenamingLayer(null)}>Cancel</button>
                        </div>
                      ) : (
                        <span onClick={() => setActiveLayer(layer.id)}>{layer.name}</span>
                      )}

                      <div className="layer-controls">
                        <button
                          className={`visibility-toggle ${layer.visible ? '' : 'hidden'}`}
                          onClick={() =>
                            handleLayerPropertyChange(layer.id, 'visible', !layer.visible)
                          }
                        >
                          {layer.visible ? 'Hide' : 'Show'}
                        </button>

                        <select
                          className="blend-mode-select"
                          disabled={layer.locked}
                          value={layer.blendMode}
                          onChange={e => handleSetBlendMode(layer.id, e.target.value)}
                        >
                          <option value={BLEND_MODES.NORMAL}>Normal</option>
                          <option value={BLEND_MODES.MULTIPLY}>Multiply</option>
                          <option value={BLEND_MODES.SCREEN}>Screen</option>
                          <option value={BLEND_MODES.OVERLAY}>Overlay</option>
                          <option value={BLEND_MODES.DARKEN}>Darken</option>
                          <option value={BLEND_MODES.LIGHTEN}>Lighten</option>
                          <option value={BLEND_MODES.COLOR_DODGE}>Color Dodge</option>
                          <option value={BLEND_MODES.COLOR_BURN}>Color Burn</option>
                          <option value={BLEND_MODES.HARD_LIGHT}>Hard Light</option>
                          <option value={BLEND_MODES.SOFT_LIGHT}>Soft Light</option>
                          <option value={BLEND_MODES.DIFFERENCE}>Difference</option>
                          <option value={BLEND_MODES.EXCLUSION}>Exclusion</option>
                        </select>

                        <label className="opacity-control">
                          Opacity:
                          <input
                            disabled={layer.locked}
                            max="1"
                            min="0"
                            step="0.01"
                            type="range"
                            value={layer.opacity}
                            onChange={e =>
                              handleOpacityChange(layer.id, parseFloat(e.target.value))
                            }
                          />
                          <span>{Math.round(layer.opacity * 100)}%</span>
                        </label>

                        <button onClick={() => handleDuplicateLayer(layer.id)}>Duplicate</button>
                        <button onClick={() => setRenamingLayer(layer.id)}>Rename</button>
                        <button
                          className={`lock-toggle ${layer.locked ? 'locked' : ''}`}
                          title={
                            layer.locked
                              ? 'Unlock this layer'
                              : 'Lock this layer to prevent editing'
                          }
                          onClick={() => handleLayerLockToggle(layer.id)}
                        >
                          {layer.locked ? 'Unlock' : 'Lock'}
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleRemoveLayer(layer.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="layer-actions">
        <button
          className="add-layer-button"
          disabled={layers.length >= MAX_LAYERS}
          onClick={handleAddLayer}
        >
          + Add Layer
        </button>
        {layers.length >= 2 && (
          <button
            className="merge-layers-button"
            onClick={() => {
              const activeIndex = layers.findIndex(layer => layer.id === activeLayer);
              if (activeIndex > 0) {
                handleMergeLayers(activeLayer, layers[activeIndex - 1].id);
              }
            }}
          >
            Merge Down
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(LayerManager);
