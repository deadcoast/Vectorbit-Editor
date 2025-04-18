/**
 * Layout Manager Component
 *
 * Provides a system for customizable UI layouts with draggable and resizable panels
 */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import './LayoutManager.css';

// Create context for layout management
const LayoutContext = createContext({
  registerPanel: () => {},
  unregisterPanel: () => {},
  getPanelPosition: () => ({ x: 0, y: 0, width: 0, height: 0 }),
  setPanelPosition: () => {},
  isPanelVisible: () => true,
  togglePanelVisibility: () => {},
  restoreDefaultLayout: () => {},
  saveCurrentLayout: () => {},
  getAvailableLayouts: () => [],
  applyLayout: () => {},
});

// Default panel positions
const DEFAULT_PANEL_POSITIONS = {
  toolbox: { x: 0, y: 60, width: 60, height: 'calc(100% - 60px)', isVisible: true },
  properties: { x: 60, y: 60, width: 240, height: 'calc(50% - 60px)', isVisible: true },
  layers: { x: 60, y: 'calc(50%)', width: 240, height: '50%', isVisible: true },
  canvas: {
    x: 300,
    y: 60,
    width: 'calc(100% - 500px)',
    height: 'calc(100% - 60px)',
    isVisible: true,
  },
  colors: { x: 'calc(100% - 200px)', y: 60, width: 200, height: 200, isVisible: true },
  history: {
    x: 'calc(100% - 200px)',
    y: 260,
    width: 200,
    height: 'calc(100% - 260px)',
    isVisible: true,
  },
};

// Panel definitions with component mappings
export const PANEL_DEFINITIONS = {
  toolbox: { title: 'Tools', icon: 'paintbrush', minWidth: 60, minHeight: 200 },
  properties: { title: 'Properties', icon: 'settings', minWidth: 200, minHeight: 200 },
  layers: { title: 'Layers', icon: 'layers', minWidth: 200, minHeight: 200 },
  canvas: { title: 'Canvas', icon: 'canvas', minWidth: 300, minHeight: 300 },
  colors: { title: 'Colors', icon: 'palette', minWidth: 180, minHeight: 180 },
  history: { title: 'History', icon: 'history', minWidth: 180, minHeight: 180 },
};

// Layout Provider component
export const LayoutProvider = ({ children, initialLayout = {} }) => {
  // Combine default layout with any user-customized layout
  const [panelPositions, setPanelPositions] = useState(() => {
    // Try to load user-customized layout from localStorage
    try {
      const savedLayout = localStorage.getItem('vectorbit_layout');
      const parsedLayout = savedLayout ? JSON.parse(savedLayout) : {};

      // Deep merge default layout with saved layout
      return { ...DEFAULT_PANEL_POSITIONS, ...parsedLayout };
    } catch (error) {
      console.error('Error loading layout from localStorage:', error);
      return { ...DEFAULT_PANEL_POSITIONS, ...initialLayout };
    }
  });

  // User-saved layouts
  const [savedLayouts, setSavedLayouts] = useState(() => {
    try {
      const layouts = localStorage.getItem('vectorbit_saved_layouts');
      return layouts ? JSON.parse(layouts) : {};
    } catch (error) {
      console.error('Error loading saved layouts from localStorage:', error);
      return {};
    }
  });

  // Register a panel
  const registerPanel = useCallback((panelId, config) => {
    setPanelPositions(prev => {
      if (!prev[panelId]) {
        const newPositions = { ...prev };
        newPositions[panelId] = {
          x: config.x || 0,
          y: config.y || 0,
          width: config.width || 200,
          height: config.height || 200,
          isVisible: config.isVisible !== undefined ? config.isVisible : true,
        };
        return newPositions;
      }
      return prev;
    });
  }, []);

  // Unregister a panel
  const unregisterPanel = useCallback(panelId => {
    setPanelPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[panelId];
      return newPositions;
    });
  }, []);

  // Get panel position
  const getPanelPosition = useCallback(
    panelId => {
      return panelPositions[panelId] || { x: 0, y: 0, width: 0, height: 0, isVisible: false };
    },
    [panelPositions]
  );

  // Set panel position
  const setPanelPosition = useCallback(
    (panelId, position) => {
      if (!panelId) return;

      setPanelPositions(prev => {
        const newPositions = { ...prev };
        if (newPositions[panelId]) {
          newPositions[panelId] = { ...newPositions[panelId], ...position };
        }
        return newPositions;
      });

      // Save to localStorage
      saveLayoutToLocalStorage({
        ...panelPositions,
        [panelId]: { ...panelPositions[panelId], ...position },
      });
    },
    [panelPositions]
  );

  // Check if panel is visible
  const isPanelVisible = useCallback(
    panelId => {
      return panelPositions[panelId]?.isVisible !== false;
    },
    [panelPositions]
  );

  // Toggle panel visibility
  const togglePanelVisibility = useCallback(panelId => {
    setPanelPositions(prev => {
      const newPositions = { ...prev };
      if (newPositions[panelId]) {
        newPositions[panelId] = {
          ...newPositions[panelId],
          isVisible: !newPositions[panelId].isVisible,
        };
      }

      // Save to localStorage
      saveLayoutToLocalStorage(newPositions);

      return newPositions;
    });
  }, []);

  // Restore default layout
  const restoreDefaultLayout = useCallback(() => {
    setPanelPositions(DEFAULT_PANEL_POSITIONS);
    saveLayoutToLocalStorage(DEFAULT_PANEL_POSITIONS);
  }, []);

  // Save current layout with a name
  const saveCurrentLayout = useCallback(
    layoutName => {
      if (!layoutName) return false;

      const newSavedLayouts = {
        ...savedLayouts,
        [layoutName]: { ...panelPositions, timestamp: Date.now() },
      };

      setSavedLayouts(newSavedLayouts);
      localStorage.setItem('vectorbit_saved_layouts', JSON.stringify(newSavedLayouts));

      return true;
    },
    [panelPositions, savedLayouts]
  );

  // Get available saved layouts
  const getAvailableLayouts = useCallback(() => {
    return Object.keys(savedLayouts).map(name => ({
      name,
      timestamp: savedLayouts[name].timestamp,
    }));
  }, [savedLayouts]);

  // Apply a saved layout
  const applyLayout = useCallback(
    layoutName => {
      if (!savedLayouts[layoutName]) return false;

      setPanelPositions(savedLayouts[layoutName]);
      saveLayoutToLocalStorage(savedLayouts[layoutName]);

      return true;
    },
    [savedLayouts]
  );

  // Helper function to save layout to localStorage
  const saveLayoutToLocalStorage = useCallback(layout => {
    try {
      localStorage.setItem('vectorbit_layout', JSON.stringify(layout));
    } catch (error) {
      console.error('Error saving layout to localStorage:', error);
    }
  }, []);

  // Value for the context provider
  const contextValue = {
    registerPanel,
    unregisterPanel,
    getPanelPosition,
    setPanelPosition,
    isPanelVisible,
    togglePanelVisibility,
    restoreDefaultLayout,
    saveCurrentLayout,
    getAvailableLayouts,
    applyLayout,
  };

  return <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>;
};

// Hook for using layout context
export const useLayout = () => {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }

  return context;
};

// Draggable Panel component
export const DraggablePanel = ({
  id,
  children,
  title,
  icon,
  className = '',
  minWidth = 200,
  minHeight = 100,
  onClose = null,
  collapsible = false,
  initialCollapsed = false,
  hideHeader = false,
  disableDrag = false,
  disableResize = false,
}) => {
  const { getPanelPosition, setPanelPosition, isPanelVisible, togglePanelVisibility } = useLayout();

  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartDim, setResizeStartDim] = useState({ width: 0, height: 0 });
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  // Load position from context
  useEffect(() => {
    const pos = getPanelPosition(id);
    setPosition({
      x: pos.x,
      y: pos.y,
      width: pos.width,
      height: pos.height,
    });
  }, [id, getPanelPosition]);

  // Start dragging
  const handleMouseDown = e => {
    if (disableDrag) return;

    e.preventDefault();
    setIsDragging(true);

    // Calculate offset from panel origin
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Start resizing
  const handleResizeStart = e => {
    if (disableResize) return;

    e.preventDefault();
    setIsResizing(true);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartDim({ width: position.width, height: position.height });
  };

  // Handle mouse move for dragging and resizing
  useEffect(() => {
    const handleMouseMove = e => {
      if (isDragging) {
        // Calculate new position
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        setPosition(prev => ({
          ...prev,
          x: newX,
          y: newY,
        }));
      } else if (isResizing) {
        // Calculate new dimensions
        const deltaX = e.clientX - resizeStartPos.x;
        const deltaY = e.clientY - resizeStartPos.y;

        const newWidth = Math.max(minWidth, resizeStartDim.width + deltaX);
        const newHeight = Math.max(minHeight, resizeStartDim.height + deltaY);

        setPosition(prev => ({
          ...prev,
          width: newWidth,
          height: newHeight,
        }));
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        setIsDragging(false);
        setIsResizing(false);

        // Save position to context
        setPanelPosition(id, position);
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    id,
    isDragging,
    isResizing,
    dragOffset,
    resizeStartPos,
    resizeStartDim,
    position,
    minWidth,
    minHeight,
    setPanelPosition,
  ]);

  // Toggle collapsed state
  const toggleCollapsed = () => {
    setIsCollapsed(prev => !prev);
  };

  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      togglePanelVisibility(id);
    }
  };

  // Early return if panel is not visible
  if (!isPanelVisible(id)) return null;

  // Calculate styles
  const panelStyle = {
    left: typeof position.x === 'string' ? position.x : `${position.x}px`,
    top: typeof position.y === 'string' ? position.y : `${position.y}px`,
    width: isCollapsed
      ? 'auto'
      : typeof position.width === 'string'
        ? position.width
        : `${position.width}px`,
    height: isCollapsed
      ? 'auto'
      : typeof position.height === 'string'
        ? position.height
        : `${position.height}px`,
  };

  return (
    <div
      className={`draggable-panel ${className} ${isDragging ? 'dragging' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      style={panelStyle}
    >
      {!hideHeader && (
        <div className="panel-header" onMouseDown={handleMouseDown}>
          {icon && <span className={`panel-icon icon-${icon}`} />}
          <h3 className="panel-title">{title}</h3>
          <div className="panel-controls">
            {collapsible && (
              <button
                aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
                className="panel-collapse-btn"
                onClick={toggleCollapsed}
              >
                {isCollapsed ? '⋯' : '−'}
              </button>
            )}
            <button aria-label="Close panel" className="panel-close-btn" onClick={handleClose}>
              ×
            </button>
          </div>
        </div>
      )}

      <div className="panel-content">{children}</div>

      {!disableResize && !isCollapsed && (
        <div aria-hidden="true" className="panel-resize-handle" onMouseDown={handleResizeStart} />
      )}
    </div>
  );
};

// Main layout component
const LayoutManager = ({ children }) => {
  return <div className="layout-manager">{children}</div>;
};

// Panel visibility toggle component
export const PanelToggle = ({ panelId, tooltip }) => {
  const { togglePanelVisibility, isPanelVisible } = useLayout();
  const isVisible = isPanelVisible(panelId);
  const panelDef = PANEL_DEFINITIONS[panelId] || {};

  return (
    <button
      aria-pressed={isVisible}
      className={`panel-toggle-btn ${isVisible ? 'active' : ''}`}
      title={tooltip || `${isVisible ? 'Hide' : 'Show'} ${panelDef.title || panelId}`}
      onClick={() => togglePanelVisibility(panelId)}
    >
      <span className={`icon-${panelDef.icon || panelId}`} />
      <span className="panel-toggle-label">{panelDef.title || panelId}</span>
    </button>
  );
};

// Layout manager settings panel
export const LayoutSettings = ({ isOpen, onClose }) => {
  const { restoreDefaultLayout, saveCurrentLayout, getAvailableLayouts, applyLayout } = useLayout();

  const [layoutName, setLayoutName] = useState('');
  const [savedLayouts, setSavedLayouts] = useState([]);

  // Load saved layouts
  useEffect(() => {
    setSavedLayouts(getAvailableLayouts());
  }, [getAvailableLayouts]);

  // Handle layout save
  const handleSaveLayout = () => {
    if (!layoutName.trim()) return;

    const success = saveCurrentLayout(layoutName.trim());
    if (success) {
      setLayoutName('');
      setSavedLayouts(getAvailableLayouts());
    }
  };

  // Handle layout application
  const handleApplyLayout = name => {
    applyLayout(name);
  };

  // Format timestamp
  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="layout-settings-overlay">
      <div className="layout-settings-panel">
        <div className="layout-settings-header">
          <h2>Layout Settings</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="layout-settings-content">
          <div className="layout-save-section">
            <h3>Save Current Layout</h3>
            <div className="layout-save-form">
              <input
                placeholder="Layout name"
                type="text"
                value={layoutName}
                onChange={e => setLayoutName(e.target.value)}
              />
              <button
                className="save-layout-btn"
                disabled={!layoutName.trim()}
                onClick={handleSaveLayout}
              >
                Save
              </button>
            </div>
          </div>

          <div className="saved-layouts-section">
            <h3>Saved Layouts</h3>
            {savedLayouts.length > 0 ? (
              <ul className="saved-layouts-list">
                {savedLayouts.map(layout => (
                  <li key={layout.name} className="saved-layout-item">
                    <div className="layout-info">
                      <span className="layout-name">{layout.name}</span>
                      <span className="layout-timestamp">{formatTimestamp(layout.timestamp)}</span>
                    </div>
                    <button
                      className="apply-layout-btn"
                      onClick={() => handleApplyLayout(layout.name)}
                    >
                      Apply
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-layouts-message">No saved layouts yet.</p>
            )}
          </div>

          <div className="layout-reset-section">
            <button className="reset-layout-btn" onClick={restoreDefaultLayout}>
              Reset to Default Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes
LayoutProvider.propTypes = {
  children: PropTypes.node.isRequired,
  initialLayout: PropTypes.object,
};

DraggablePanel.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string,
  minWidth: PropTypes.number,
  minHeight: PropTypes.number,
  onClose: PropTypes.func,
  collapsible: PropTypes.bool,
  initialCollapsed: PropTypes.bool,
  hideHeader: PropTypes.bool,
  disableDrag: PropTypes.bool,
  disableResize: PropTypes.bool,
};

PanelToggle.propTypes = {
  panelId: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
};

LayoutSettings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

LayoutManager.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LayoutManager;
