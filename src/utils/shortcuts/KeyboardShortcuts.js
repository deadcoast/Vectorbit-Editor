/**
 * Keyboard Shortcuts System
 *
 * Provides a centralized system for registering, managing and triggering keyboard shortcuts
 * throughout the application, with support for context-aware shortcuts and user customization.
 */

import {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
} from "react";

// Create context for keyboard shortcuts
const ShortcutsContext = createContext({
  registerShortcut: () => {},
  unregisterShortcut: () => {},
  getActiveShortcuts: () => [],
  setContext: () => {},
  getShortcutsByContext: () => [],
  getContexts: () => [],
  customizeShortcut: () => false,
  resetShortcuts: () => {},
});

// Define default shortcut configurations
export const DEFAULT_SHORTCUTS = {
  global: {
    save: {
      keys: ["Control+s", "Meta+s"],
      description: "Save project",
      action: null,
    },
    undo: { keys: ["Control+z", "Meta+z"], description: "Undo", action: null },
    redo: {
      keys: ["Control+Shift+z", "Meta+Shift+z", "Control+y", "Meta+y"],
      description: "Redo",
      action: null,
    },
    copy: { keys: ["Control+c", "Meta+c"], description: "Copy", action: null },
    paste: {
      keys: ["Control+v", "Meta+v"],
      description: "Paste",
      action: null,
    },
    cut: { keys: ["Control+x", "Meta+x"], description: "Cut", action: null },
    selectAll: {
      keys: ["Control+a", "Meta+a"],
      description: "Select all",
      action: null,
    },
    newProject: {
      keys: ["Control+n", "Meta+n"],
      description: "New project",
      action: null,
    },
    openProject: {
      keys: ["Control+o", "Meta+o"],
      description: "Open project",
      action: null,
    },
    zoomIn: {
      keys: ["Control+=", "Meta+="],
      description: "Zoom in",
      action: null,
    },
    zoomOut: {
      keys: ["Control+-", "Meta+-"],
      description: "Zoom out",
      action: null,
    },
    zoomReset: {
      keys: ["Control+0", "Meta+0"],
      description: "Reset zoom",
      action: null,
    },
    toggleHelp: {
      keys: ["?", "F1"],
      description: "Show/hide help",
      action: null,
    },
    closeModal: {
      keys: ["Escape"],
      description: "Close modal or cancel action",
      action: null,
    },
  },

  drawingTools: {
    brush: { keys: ["b"], description: "Brush tool", action: null },
    eraser: { keys: ["e"], description: "Eraser tool", action: null },
    eyedropper: { keys: ["i"], description: "Color picker", action: null },
    fill: { keys: ["g"], description: "Fill tool", action: null },
    line: { keys: ["l"], description: "Line tool", action: null },
    rectangle: { keys: ["r"], description: "Rectangle tool", action: null },
    ellipse: { keys: ["c"], description: "Ellipse tool", action: null },
    select: { keys: ["s"], description: "Selection tool", action: null },
    hand: { keys: ["h"], description: "Hand tool (pan)", action: null },
    increaseBrushSize: {
      keys: ["]"],
      description: "Increase brush size",
      action: null,
    },
    decreaseBrushSize: {
      keys: ["["],
      description: "Decrease brush size",
      action: null,
    },
  },

  layers: {
    newLayer: { keys: ["Shift+n"], description: "New layer", action: null },
    deleteLayer: {
      keys: ["Shift+Delete", "Shift+Backspace"],
      description: "Delete layer",
      action: null,
    },
    duplicateLayer: {
      keys: ["Shift+d"],
      description: "Duplicate layer",
      action: null,
    },
    mergeDown: { keys: ["Shift+m"], description: "Merge down", action: null },
    layerUp: {
      keys: ["Shift+ArrowUp"],
      description: "Move layer up",
      action: null,
    },
    layerDown: {
      keys: ["Shift+ArrowDown"],
      description: "Move layer down",
      action: null,
    },
    toggleVisibility: {
      keys: ["Shift+v"],
      description: "Toggle layer visibility",
      action: null,
    },
    toggleLock: {
      keys: ["Shift+l"],
      description: "Toggle layer lock",
      action: null,
    },
  },

  selection: {
    selectAll: {
      keys: ["Control+a", "Meta+a"],
      description: "Select all in layer",
      action: null,
    },
    deselect: {
      keys: ["Control+d", "Meta+d"],
      description: "Deselect",
      action: null,
    },
    invertSelection: {
      keys: ["Control+Shift+i", "Meta+Shift+i"],
      description: "Invert selection",
      action: null,
    },
    delete: {
      keys: ["Delete", "Backspace"],
      description: "Delete selection",
      action: null,
    },
    copySelection: {
      keys: ["Control+c", "Meta+c"],
      description: "Copy selection",
      action: null,
    },
    cutSelection: {
      keys: ["Control+x", "Meta+x"],
      description: "Cut selection",
      action: null,
    },
    pasteSelection: {
      keys: ["Control+v", "Meta+v"],
      description: "Paste",
      action: null,
    },
    moveLeft: {
      keys: ["ArrowLeft"],
      description: "Move selection left",
      action: null,
    },
    moveRight: {
      keys: ["ArrowRight"],
      description: "Move selection right",
      action: null,
    },
    moveUp: {
      keys: ["ArrowUp"],
      description: "Move selection up",
      action: null,
    },
    moveDown: {
      keys: ["ArrowDown"],
      description: "Move selection down",
      action: null,
    },
  },
};

// Provider component for keyboard shortcuts
export const ShortcutsProvider = ({ children, initialShortcuts = {} }) => {
  // Combine default shortcuts with any user-customized shortcuts
  const [shortcuts, setShortcuts] = useState(() => {
    // Try to load user-customized shortcuts from localStorage
    try {
      const savedShortcuts = localStorage.getItem("vectorbit_shortcuts");
      const parsedShortcuts = savedShortcuts ? JSON.parse(savedShortcuts) : {};

      // Deep merge default shortcuts with saved shortcuts
      return mergeShortcuts(DEFAULT_SHORTCUTS, {
        ...initialShortcuts,
        ...parsedShortcuts,
      });
    } catch (error) {
      console.error("Error loading shortcuts from localStorage:", error);
      return mergeShortcuts(DEFAULT_SHORTCUTS, initialShortcuts);
    }
  });

  // Track active contexts
  const [activeContexts, setActiveContexts] = useState(["global"]);

  // Register a shortcut
  const registerShortcut = useCallback(
    (id, context, keys, description, action) => {
      setShortcuts((prevShortcuts) => {
        const updatedShortcuts = { ...prevShortcuts };

        // Ensure context exists
        if (!updatedShortcuts[context]) {
          updatedShortcuts[context] = {};
        }

        // Register the shortcut
        updatedShortcuts[context][id] = {
          keys: Array.isArray(keys) ? keys : [keys],
          description,
          action,
        };

        // Save to localStorage
        saveShortcuts(updatedShortcuts);

        return updatedShortcuts;
      });
    },
    []
  );

  // Unregister a shortcut
  const unregisterShortcut = useCallback((id, context) => {
    setShortcuts((prevShortcuts) => {
      const updatedShortcuts = { ...prevShortcuts };

      if (updatedShortcuts[context] && updatedShortcuts[context][id]) {
        delete updatedShortcuts[context][id];
      }

      // Save to localStorage
      saveShortcuts(updatedShortcuts);

      return updatedShortcuts;
    });
  }, []);

  // Set active context(s)
  const setContext = useCallback((contexts) => {
    // Ensure 'global' is always included
    const contextsArray = Array.isArray(contexts) ? contexts : [contexts];

    setActiveContexts([
      "global",
      ...contextsArray.filter((context) => context !== "global"),
    ]);
  }, []);

  // Get all shortcuts for a specific context
  const getShortcutsByContext = useCallback(
    (context) => {
      return shortcuts[context] || {};
    },
    [shortcuts]
  );

  // Get currently active shortcuts
  const getActiveShortcuts = useCallback(() => {
    return activeContexts.reduce((active, context) => {
      if (shortcuts[context]) {
        return { ...active, ...shortcuts[context] };
      }
      return active;
    }, {});
  }, [activeContexts, shortcuts]);

  // Get all available contexts
  const getContexts = useCallback(() => {
    return Object.keys(shortcuts);
  }, [shortcuts]);

  // Customize a shortcut
  const customizeShortcut = useCallback(
    (id, context, newKeys) => {
      if (!shortcuts[context] || !shortcuts[context][id]) {
        console.error(`Shortcut ${id} in context ${context} not found`);
        return false;
      }

      // Validate key combination
      try {
        newKeys.forEach((key) => parseKeyCombination(key));
      } catch (error) {
        console.error("Invalid key combination:", error);
        return false;
      }

      setShortcuts((prevShortcuts) => {
        const updatedShortcuts = { ...prevShortcuts };
        updatedShortcuts[context][id] = {
          ...updatedShortcuts[context][id],
          keys: newKeys,
        };

        // Save to localStorage
        saveShortcuts(updatedShortcuts);

        return updatedShortcuts;
      });

      return true;
    },
    [shortcuts]
  );

  // Reset shortcuts to defaults
  const resetShortcuts = useCallback(() => {
    setShortcuts(DEFAULT_SHORTCUTS);
    localStorage.removeItem("vectorbit_shortcuts");
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Skip if in input field
      if (isInputField(event.target)) {
        return;
      }

      const keyCombination = getKeyCombinationFromEvent(event);
      const activeShortcuts = getActiveShortcuts();

      // Check if any active shortcut matches the key combination
      for (const [id, shortcut] of Object.entries(activeShortcuts)) {
        if (
          shortcut.keys.some((key) =>
            matchesKeyCombination(key, keyCombination)
          ) &&
          shortcut.action
        ) {
          event.preventDefault();
          shortcut.action(event);
          return;
        }
      }
    };

    // Add global event listener
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [getActiveShortcuts]);

  // Context value
  const contextValue = {
    registerShortcut,
    unregisterShortcut,
    getActiveShortcuts,
    setContext,
    getShortcutsByContext,
    getContexts,
    customizeShortcut,
    resetShortcuts,
  };

  return (
    <ShortcutsContext.Provider value={contextValue}>
      {children}
    </ShortcutsContext.Provider>
  );
};

// Hook for using shortcuts
export const useShortcuts = () => {
  const context = useContext(ShortcutsContext);

  if (!context) {
    throw new Error("useShortcuts must be used within a ShortcutsProvider");
  }

  return context;
};

// Helper function to save shortcuts to localStorage
const saveShortcuts = (shortcuts) => {
  try {
    localStorage.setItem("vectorbit_shortcuts", JSON.stringify(shortcuts));
  } catch (error) {
    console.error("Error saving shortcuts to localStorage:", error);
  }
};

// Helper function to check if the event target is an input field
const isInputField = (target) => {
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
};

// Helper function to get key combination string from event
const getKeyCombinationFromEvent = (event) => {
  const keyCombination = [];

  if (event.ctrlKey) keyCombination.push("Control");
  if (event.altKey) keyCombination.push("Alt");
  if (event.shiftKey) keyCombination.push("Shift");
  if (event.metaKey) keyCombination.push("Meta");

  // Add the key if it's not a modifier
  if (
    ![
      "Control",
      "Alt",
      "Shift",
      "Meta",
      "ControlLeft",
      "ControlRight",
      "AltLeft",
      "AltRight",
      "ShiftLeft",
      "ShiftRight",
      "MetaLeft",
      "MetaRight",
    ].includes(event.key)
  ) {
    keyCombination.push(event.key);
  }

  return keyCombination.join("+");
};

// Helper function to parse key combination
const parseKeyCombination = (combination) => {
  if (typeof combination !== "string") {
    throw new Error("Key combination must be a string");
  }

  return combination.split("+").map((key) => key.trim());
};

// Helper function to check if a key combination matches
const matchesKeyCombination = (definedCombination, actualCombination) => {
  // Parse defined combination if it's a string
  const parsedDefinedCombination =
    typeof definedCombination === "string"
      ? parseKeyCombination(definedCombination)
      : definedCombination;

  // Parse actual combination if it's a string
  const parsedActualCombination =
    typeof actualCombination === "string"
      ? parseKeyCombination(actualCombination)
      : actualCombination;

  // For direct equality
  if (definedCombination === actualCombination) {
    return true;
  }

  // For component-wise equality
  if (
    Array.isArray(parsedDefinedCombination) &&
    Array.isArray(parsedActualCombination)
  ) {
    return (
      parsedDefinedCombination.length === parsedActualCombination.length &&
      parsedDefinedCombination.every((key) =>
        parsedActualCombination.includes(key)
      )
    );
  }

  return false;
};

// Helper function to merge shortcuts
const mergeShortcuts = (defaults, customized) => {
  const merged = { ...defaults };

  // Merge each context
  Object.entries(customized).forEach(([context, shortcuts]) => {
    if (!merged[context]) {
      merged[context] = {};
    }

    // Merge shortcuts within context
    Object.entries(shortcuts).forEach(([id, shortcut]) => {
      if (merged[context][id]) {
        merged[context][id] = {
          ...merged[context][id],
          ...shortcut,
        };
      } else {
        merged[context][id] = shortcut;
      }
    });
  });

  return merged;
};
