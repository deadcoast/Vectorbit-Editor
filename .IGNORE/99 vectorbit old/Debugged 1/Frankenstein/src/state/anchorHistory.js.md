
export const useAnchorHistory = () => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = (newAnchors) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newAnchors];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  };

  return { addToHistory, undo, redo, history, historyIndex };
};
