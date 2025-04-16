
import React, { useRef, useState } from "react";
import "./Grid.css";
import { updateCell, floodFill, toggleGridOverlay } from "./GridManager";

const Grid = ({
  gridSize,
  layers,
  activeLayer,
  setLayers,
  activeTool,
  activeColor,
  gridOverlay, // New prop for grid overlay
  setGridOverlay, // New prop to toggle grid overlay
}) => {
  const gridRef = useRef();
  const [hoveredCell, setHoveredCell] = useState(null); // For cell preview functionality

  // Handle individual cell click based on active tool
  const handleCellClick = (x, y) => {
    if (activeTool === "brush") {
      updateCell(x, y, activeColor, gridSize, setLayers, layers, activeLayer);
    } else if (activeTool === "eraser") {
      updateCell(x, y, null, gridSize, setLayers, layers, activeLayer);
    } else if (activeTool === "fill") {
      const currentLayer = layers.find((layer) => layer.id === activeLayer);
      const targetColor = currentLayer?.gridData?.[`${x},${y}`] || "transparent";
      floodFill(x, y, targetColor, activeColor, currentLayer.gridData, gridSize, (updatedColors) => {
        setLayers((prevLayers) =>
          prevLayers.map((layer) =>
            layer.id === activeLayer
              ? { ...layer, gridData: updatedColors }
              : layer
          )
        );
      });
    }
  };

  // Handle mouse hover for cell preview
  const handleCellHover = (x, y) => {
    setHoveredCell({ x, y });
  };

  // Render grid cells
  return (
    <div
      ref={gridRef}
      className={`grid-container ${gridOverlay ? "grid-overlay" : ""}`} // Toggle overlay
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        const currentLayer = layers.find((layer) => layer.id === activeLayer);
        const isActiveCell = currentLayer?.gridData?.[`${x},${y}`];

        return (
          <div
            key={index}
            className="grid-cell"
            style={{
              backgroundColor:
                hoveredCell?.x === x && hoveredCell?.y === y
                  ? activeTool === "brush"
                    ? activeColor
                    : activeTool === "eraser"
                    ? "transparent"
                    : isActiveCell || "transparent"
                  : isActiveCell || "transparent",
              border: "1px solid var(--border-color)",
            }}
            onClick={() => handleCellClick(x, y)}
            onMouseEnter={() => handleCellHover(x, y)}
          />
        );
      })}
      {/* Toggle grid overlay button */}
      <button
        className="grid-toggle-button"
        onClick={() => toggleGridOverlay(!gridOverlay, setGridOverlay)}
      >
        {gridOverlay ? "Hide Grid" : "Show Grid"}
      </button>
    </div>
  );
};

export default Grid;
