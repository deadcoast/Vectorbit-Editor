/**
 * Help System Component
 *
 * Provides a comprehensive help system with contextual help, tooltips,
 * and integration with keyboard shortcuts
 */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';

import { useShortcuts } from '../../utils/shortcuts/KeyboardShortcuts';
import ShortcutsManager from '../shortcuts/ShortcutsManager';
import './HelpSystem.css';

// Help topics data structure
const HELP_TOPICS = {
  'getting-started': {
    title: 'Getting Started',
    content: `
      <h3>Welcome to Vectorbit</h3>
      <p>Vectorbit is a powerful pixel art editor with vector capabilities. This guide will help you get started with the basics.</p>
      
      <h4>Creating a New Project</h4>
      <p>To create a new project, click on <strong>File > New</strong> or press <kbd>Ctrl+N</kbd> (or <kbd>⌘+N</kbd> on Mac).</p>
      
      <h4>Basic Controls</h4>
      <ul>
        <li><strong>Navigation:</strong> Hold the spacebar and drag to pan around the canvas.</li>
        <li><strong>Zoom:</strong> Use the mouse wheel or trackpad to zoom in and out.</li>
        <li><strong>Drawing:</strong> Click and drag to draw with the active tool.</li>
      </ul>
    `,
  },
  tools: {
    title: 'Drawing Tools',
    content: `
      <h3>Drawing Tools</h3>
      <p>Vectorbit provides a variety of tools for creating and editing pixel art.</p>
      
      <h4>Brush Tool (B)</h4>
      <p>The primary drawing tool. Click and drag to draw on the canvas.</p>
      <ul>
        <li>Adjust brush size with [ and ]</li>
        <li>Change brush opacity in the brush settings panel</li>
        <li>Choose from different brush types: Filled, Patterned, Gradient</li>
      </ul>
      
      <h4>Eraser Tool (E)</h4>
      <p>Removes pixels from the canvas. Works similar to the brush tool.</p>
      
      <h4>Color Picker Tool (I)</h4>
      <p>Click on any pixel to sample its color.</p>
      
      <h4>Fill Tool (G)</h4>
      <p>Click on an area to fill it with the selected color.</p>
      
      <h4>Selection Tools (S)</h4>
      <p>Select areas of your artwork for manipulation:</p>
      <ul>
        <li>Rectangle selection</li>
        <li>Ellipse selection</li>
        <li>Magic Wand for color-based selection</li>
        <li>Lasso for freehand selection</li>
      </ul>
    `,
  },
  layers: {
    title: 'Working with Layers',
    content: `
      <h3>Layer Management</h3>
      <p>Layers help organize your artwork and work non-destructively.</p>
      
      <h4>Creating Layers</h4>
      <p>Click the "+" button in the Layers panel or press <kbd>Shift+N</kbd> to create a new layer.</p>
      
      <h4>Layer Controls</h4>
      <ul>
        <li><strong>Visibility:</strong> Click the eye icon to toggle layer visibility</li>
        <li><strong>Lock:</strong> Lock a layer to prevent editing</li>
        <li><strong>Opacity:</strong> Adjust layer transparency</li>
        <li><strong>Blend Mode:</strong> Change how layers blend together</li>
      </ul>
      
      <h4>Layer Operations</h4>
      <ul>
        <li>Rearrange layers by dragging</li>
        <li>Merge down with <kbd>Shift+M</kbd></li>
        <li>Duplicate layers with <kbd>Shift+D</kbd></li>
        <li>Delete layers with <kbd>Shift+Delete</kbd></li>
      </ul>
    `,
  },
  export: {
    title: 'Exporting Artwork',
    content: `
      <h3>Exporting Your Artwork</h3>
      <p>Vectorbit supports multiple export formats to suit your needs.</p>
      
      <h4>Export Formats</h4>
      <ul>
        <li><strong>PNG:</strong> Raster image with transparency</li>
        <li><strong>SVG:</strong> Vector graphics with full layer support</li>
        <li><strong>JSON:</strong> Project file format for future editing</li>
      </ul>
      
      <h4>Export Options</h4>
      <p>Access export options via <strong>File > Export</strong> or use the Export panel.</p>
      <ul>
        <li>Scale your export to different resolutions</li>
        <li>Choose to export all layers or only visible layers</li>
        <li>Select specific layers to export</li>
        <li>Configure SVG optimization settings</li>
      </ul>
    `,
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    content: `
      <h3>Keyboard Shortcuts</h3>
      <p>Vectorbit offers extensive keyboard shortcuts to speed up your workflow.</p>
      <p>Open the Shortcuts Manager by pressing <kbd>?</kbd> or <kbd>F1</kbd> to view and customize all available shortcuts.</p>
      
      <h4>Common Shortcuts</h4>
      <ul>
        <li><kbd>Ctrl+S</kbd> / <kbd>⌘+S</kbd>: Save project</li>
        <li><kbd>Ctrl+Z</kbd> / <kbd>⌘+Z</kbd>: Undo</li>
        <li><kbd>Ctrl+Shift+Z</kbd> / <kbd>⌘+Shift+Z</kbd>: Redo</li>
        <li><kbd>B</kbd>: Brush tool</li>
        <li><kbd>E</kbd>: Eraser tool</li>
        <li><kbd>I</kbd>: Color picker tool</li>
        <li><kbd>S</kbd>: Selection tool</li>
        <li><kbd>G</kbd>: Fill tool</li>
        <li><kbd>Space</kbd> (hold) + drag: Pan canvas</li>
      </ul>
      
      <p>Click "Show All Shortcuts" below to see the complete list and customize them.</p>
    `,
  },
  vector: {
    title: 'Vector Features',
    content: `
      <h3>Working with Vector Elements</h3>
      <p>Vectorbit combines pixel art with vector capabilities for unprecedented flexibility.</p>
      
      <h4>Importing SVG</h4>
      <p>Import SVG files via <strong>File > Import > SVG</strong> to convert vector graphics into layers.</p>
      <ul>
        <li>Preserve layer structure from SVG groups</li>
        <li>Configure import settings for optimal results</li>
        <li>Automatically optimize imported graphics</li>
      </ul>
      
      <h4>Vector Transformations</h4>
      <p>Apply transformations to selections:</p>
      <ul>
        <li>Scale</li>
        <li>Rotate</li>
        <li>Flip</li>
        <li>Move</li>
      </ul>
      
      <h4>Exporting to SVG</h4>
      <p>Export your artwork as SVG with full layer support:</p>
      <ul>
        <li>Preserve layer structure in SVG groups</li>
        <li>Maintain blend modes and opacity</li>
        <li>Optimize SVG for file size or quality</li>
      </ul>
    `,
  },
};

const HelpSystem = ({ onClose, initialTopic = 'getting-started' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(initialTopic);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const { setContext } = useShortcuts();

  // Register keyboard shortcut to toggle help
  useEffect(() => {
    const handleToggleHelp = event => {
      if (event.key === '?' || event.key === 'F1') {
        event.preventDefault();
        setIsOpen(prev => !prev);
      }

      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleToggleHelp);

    return () => {
      window.removeEventListener('keydown', handleToggleHelp);
    };
  }, [isOpen]);

  // Set shortcuts context when help system is open
  useEffect(() => {
    if (isOpen) {
      setContext(['global', 'help']);
    }
  }, [isOpen, setContext]);

  // Handle closing
  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Toggle shortcuts manager
  const toggleShortcutsManager = () => {
    setIsShortcutsOpen(prev => !prev);
  };

  if (!isOpen) return null;

  const topics = Object.keys(HELP_TOPICS);
  const currentTopicData = HELP_TOPICS[currentTopic] || HELP_TOPICS['getting-started'];

  return (
    <div className="help-system-container">
      <div className="help-panel">
        <div className="help-header">
          <h2>Vectorbit Help</h2>
          <button className="help-close-button" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="help-content">
          <div className="help-sidebar">
            <h3>Topics</h3>
            <ul className="help-topics-list">
              {topics.map(topic => (
                <li
                  key={topic}
                  className={topic === currentTopic ? 'active' : ''}
                  onClick={() => setCurrentTopic(topic)}
                >
                  {HELP_TOPICS[topic].title}
                </li>
              ))}
            </ul>

            <div className="help-shortcuts-button">
              <button onClick={toggleShortcutsManager}>Show All Shortcuts</button>
            </div>
          </div>

          <div className="help-topic-content">
            <h2>{currentTopicData.title}</h2>
            <div
              className="topic-html-content"
              dangerouslySetInnerHTML={{ __html: currentTopicData.content }}
            />
          </div>
        </div>
      </div>

      <ShortcutsManager isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
};

// Context hook for using the help system
export const HelpProvider = ({ children }) => {
  const [helpState, setHelpState] = useState({
    isOpen: false,
    currentTopic: 'getting-started',
  });

  const openHelp = useCallback((topic = 'getting-started') => {
    setHelpState({
      isOpen: true,
      currentTopic: topic,
    });
  }, []);

  const closeHelp = useCallback(() => {
    setHelpState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return (
    <HelpContext.Provider value={{ openHelp, closeHelp }}>
      {children}
      {helpState.isOpen && <HelpSystem initialTopic={helpState.currentTopic} onClose={closeHelp} />}
    </HelpContext.Provider>
  );
};

// Create context for help system
const HelpContext = React.createContext({
  openHelp: () => {},
  closeHelp: () => {},
});

// Hook for using help system
export const useHelp = () => {
  const context = React.useContext(HelpContext);

  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }

  return context;
};

HelpSystem.propTypes = {
  onClose: PropTypes.func,
  initialTopic: PropTypes.string,
};

export default HelpSystem;
