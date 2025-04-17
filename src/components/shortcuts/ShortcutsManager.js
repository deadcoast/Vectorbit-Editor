/**
 * Shortcuts Manager Component
 *
 * Provides a user interface for viewing and customizing keyboard shortcuts
 */
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useShortcuts } from "../../utils/shortcuts/KeyboardShortcuts";
import "./ShortcutsManager.css";

const ShortcutsManager = ({
  isOpen,
  onClose,
  title = "Keyboard Shortcuts",
}) => {
  const {
    getContexts,
    getShortcutsByContext,
    customizeShortcut,
    resetShortcuts,
  } = useShortcuts();

  const [activeTab, setActiveTab] = useState("global");
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customizingShortcut, setCustomizingShortcut] = useState(null);
  const [keysPressed, setKeysPressed] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredShortcuts, setFilteredShortcuts] = useState({});

  const keyListenerRef = useRef(null);
  const contexts = getContexts();

  // Format key for display
  const formatKey = (key) => {
    switch (key) {
      case " ":
        return "Space";
      case "ArrowUp":
        return "↑";
      case "ArrowDown":
        return "↓";
      case "ArrowLeft":
        return "←";
      case "ArrowRight":
        return "→";
      case "Control":
        return "Ctrl";
      case "Meta":
        return navigator.platform.includes("Mac") ? "⌘" : "Win";
      case "Alt":
        return navigator.platform.includes("Mac") ? "Option" : "Alt";
      case "Shift":
        return "Shift";
      case "Escape":
        return "Esc";
      case "Delete":
        return "Del";
      case "Backspace":
        return "⌫";
      case "Enter":
        return "↵";
      case "Tab":
        return "⇥";
      default:
        return key.length === 1 ? key.toUpperCase() : key;
    }
  };

  // Format shortcut keys for display
  const formatShortcut = (keys) => {
    return keys
      .map((combo) => {
        return combo.split("+").map(formatKey).join(" + ");
      })
      .join(" or ");
  };

  // Handle key down while customizing
  const handleKeyDown = (event) => {
    if (!isCustomizing) return;

    event.preventDefault();

    const { key } = event;

    // Ignore standalone modifier keys
    if (["Control", "Alt", "Shift", "Meta"].includes(key)) {
      return;
    }

    const modifiers = [];
    if (event.ctrlKey) modifiers.push("Control");
    if (event.altKey) modifiers.push("Alt");
    if (event.shiftKey) modifiers.push("Shift");
    if (event.metaKey) modifiers.push("Meta");

    const combination = [...modifiers, key].join("+");
    setKeysPressed([combination]);
  };

  // Handle key up while customizing
  const handleKeyUp = (event) => {
    if (!isCustomizing || !customizingShortcut) return;

    // Check if all modifiers are released
    if (
      !event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey &&
      keysPressed.length > 0
    ) {
      applyCustomShortcut();
    }
  };

  // Apply custom shortcut
  const applyCustomShortcut = () => {
    if (!customizingShortcut || keysPressed.length === 0) return;

    const { id, context } = customizingShortcut;
    const success = customizeShortcut(id, context, keysPressed);

    if (success) {
      setIsCustomizing(false);
      setCustomizingShortcut(null);
      setKeysPressed([]);
    } else {
      // Handle error
      console.error("Failed to customize shortcut");
    }
  };

  // Start customizing a shortcut
  const startCustomizing = (id, context) => {
    setIsCustomizing(true);
    setCustomizingShortcut({ id, context });
    setKeysPressed([]);
  };

  // Cancel customizing
  const cancelCustomizing = () => {
    setIsCustomizing(false);
    setCustomizingShortcut(null);
    setKeysPressed([]);
  };

  // Reset all shortcuts to defaults
  const handleResetShortcuts = () => {
    if (window.confirm("Reset all shortcuts to default values?")) {
      resetShortcuts();
    }
  };

  // Filter shortcuts based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredShortcuts({});
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = {};

    contexts.forEach((context) => {
      const shortcuts = getShortcutsByContext(context);
      const matchingShortcuts = {};

      Object.entries(shortcuts).forEach(([id, shortcut]) => {
        if (
          id.toLowerCase().includes(term) ||
          shortcut.description.toLowerCase().includes(term) ||
          shortcut.keys.some((key) => key.toLowerCase().includes(term))
        ) {
          matchingShortcuts[id] = shortcut;
        }
      });

      if (Object.keys(matchingShortcuts).length > 0) {
        filtered[context] = matchingShortcuts;
      }
    });

    setFilteredShortcuts(filtered);
  }, [searchTerm, contexts, getShortcutsByContext]);

  // Setup key listeners for customizing shortcuts
  useEffect(() => {
    if (isCustomizing) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isCustomizing, keysPressed, customizingShortcut]);

  // Automatically focus the customizing shortcut
  useEffect(() => {
    if (isCustomizing && keyListenerRef.current) {
      keyListenerRef.current.focus();
    }
  }, [isCustomizing]);

  // Early return if not open
  if (!isOpen) return null;

  // Determine which shortcuts to display
  const shortcutsToDisplay = searchTerm.trim()
    ? filteredShortcuts
    : { [activeTab]: getShortcutsByContext(activeTab) };

  const hasSearchResults = Object.keys(shortcutsToDisplay).length > 0;

  // Render category tabs
  const renderTabs = () => {
    return (
      <div className="shortcuts-tabs">
        {contexts.map((context) => (
          <button
            key={context}
            className={`tab-button ${activeTab === context ? "active" : ""}`}
            onClick={() => {
              setActiveTab(context);
              setSearchTerm("");
            }}
          >
            {context.charAt(0).toUpperCase() + context.slice(1)}
          </button>
        ))}
      </div>
    );
  };

  // Render shortcuts table for a specific context
  const renderShortcutsTable = (context, shortcuts) => {
    return (
      <div key={context} className="shortcuts-section">
        {searchTerm && (
          <h3 className="context-heading">
            {context.charAt(0).toUpperCase() + context.slice(1)}
          </h3>
        )}

        <table className="shortcuts-table">
          <thead>
            <tr>
              <th>Command</th>
              <th>Shortcut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(shortcuts).map(([id, shortcut]) => (
              <tr key={`${context}-${id}`}>
                <td className="command-name">{shortcut.description}</td>
                <td className="shortcut-keys">
                  {isCustomizing &&
                  customizingShortcut &&
                  customizingShortcut.id === id &&
                  customizingShortcut.context === context ? (
                    <div
                      className="key-listener"
                      ref={keyListenerRef}
                      tabIndex={0}
                    >
                      {keysPressed.length > 0
                        ? formatShortcut(keysPressed)
                        : "Press keys..."}
                    </div>
                  ) : (
                    <div className="key-combination">
                      {formatShortcut(shortcut.keys)}
                    </div>
                  )}
                </td>
                <td className="shortcut-actions">
                  {isCustomizing &&
                  customizingShortcut &&
                  customizingShortcut.id === id &&
                  customizingShortcut.context === context ? (
                    <>
                      <button
                        className="action-button apply"
                        onClick={applyCustomShortcut}
                        disabled={keysPressed.length === 0}
                      >
                        Apply
                      </button>
                      <button
                        className="action-button cancel"
                        onClick={cancelCustomizing}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="action-button edit"
                      onClick={() => startCustomizing(id, context)}
                      disabled={isCustomizing}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="shortcuts-manager-overlay">
      <div className="shortcuts-manager">
        <div className="shortcuts-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="shortcuts-search">
          <input
            type="text"
            placeholder="Search shortcuts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isCustomizing}
          />
        </div>

        {!searchTerm && renderTabs()}

        <div className="shortcuts-content">
          {hasSearchResults ? (
            Object.entries(shortcutsToDisplay).map(([context, shortcuts]) =>
              renderShortcutsTable(context, shortcuts)
            )
          ) : (
            <div className="no-results">
              No shortcuts found matching "{searchTerm}"
            </div>
          )}
        </div>

        <div className="shortcuts-footer">
          <button
            className="reset-button"
            onClick={handleResetShortcuts}
            disabled={isCustomizing}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

ShortcutsManager.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default ShortcutsManager;
