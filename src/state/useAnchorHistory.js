
// File: src/state/useAnchorHistory.js
import { useState, useCallback } from "react";

/**
 * Custom Hook for managing anchor history with advanced features.
 * Provides undo/redo functionality, state persistence, and branching history support.
 */
export const useAnchorHistory = () => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [maxHistoryLength, setMaxHistoryLength] = useState(50); // Limit history size to optimize performance

  /**
   * Add new anchors to the history.
   * Clears forward history if new anchors are added after an undo operation.
   *
   * @param {Object} newAnchors - The new state of the anchors.
   */
  const addToHistory = useCallback(
    (newAnchors) => {
      const truncatedHistory = history.slice(0, historyIndex + 1);
      const updatedHistory = [...truncatedHistory, newAnchors];

      // Limit the history length to improve performance
      if (updatedHistory.length > maxHistoryLength) {
        updatedHistory.shift();
      }

      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    },
    [history, historyIndex, maxHistoryLength]
  );

  /**
   * Undo the last action and revert to the previous anchors.
   *
   * @returns {Object|null} - The previous state of the anchors or null if undo is unavailable.
   */
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prevIndex) => prevIndex - 1);
      return history[historyIndex - 1];
    }
    console.warn("No more undo steps available.");
    return null;
  }, [history, historyIndex]);

  /**
   * Redo the next action and move forward in the history.
   *
   * @returns {Object|null} - The next state of the anchors or null if redo is unavailable.
   */
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prevIndex) => prevIndex + 1);
      return history[historyIndex + 1];
    }
    console.warn("No more redo steps available.");
    return null;
  }, [history, historyIndex]);

  /**
   * Clear the entire history and reset the state.
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
    console.log("Anchor history cleared.");
  }, []);

  /**
   * Jump to a specific point in history.
   *
   * @param {number} index - The target index in the history array.
   * @returns {Object|null} - The anchors at the target index or null if invalid.
   */
  const jumpTo = useCallback(
    (index) => {
      if (index >= 0 && index < history.length) {
        setHistoryIndex(index);
        return history[index];
      }
      console.warn("Invalid history index.");
      return null;
    },
    [history]
  );

  /**
   * Persist the current history to localStorage.
   *
   * @param {string} key - The key to use for localStorage.
   */
  const saveHistoryToLocalStorage = useCallback(
    (key = "anchorHistory") => {
      try {
        const historyData = JSON.stringify({ history, historyIndex });
        localStorage.setItem(key, historyData);
        console.log("Anchor history saved to localStorage.");
      } catch (err) {
        console.error("Failed to save history to localStorage:", err);
      }
    },
    [history, historyIndex]
  );

  /**
   * Load history from localStorage.
   *
   * @param {string} key - The key to use for localStorage.
   */
  const loadHistoryFromLocalStorage = useCallback(
    (key = "anchorHistory") => {
      try {
        const savedData = localStorage.getItem(key);
        if (savedData) {
          const { history: loadedHistory, historyIndex: loadedIndex } = JSON.parse(savedData);
          setHistory(loadedHistory || []);
          setHistoryIndex(loadedIndex || -1);
          console.log("Anchor history loaded from localStorage.");
        }
      } catch (err) {
        console.error("Failed to load history from localStorage:", err);
      }
    },
    []
  );

  /**
   * Set a custom maximum length for the history array.
   *
   * @param {number} length - Maximum length of the history array.
   */
  const setHistoryLimit = useCallback((length) => {
    if (length > 0) {
      setMaxHistoryLength(length);
      console.log(`Max history length set to ${length}.`);
    } else {
      console.warn("Invalid history length.");
    }
  }, []);

  return {
    addToHistory,
    undo,
    redo,
    clearHistory,
    jumpTo,
    saveHistoryToLocalStorage,
    loadHistoryFromLocalStorage,
    setHistoryLimit,
    history,
    historyIndex,
  };
};
