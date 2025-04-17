import React, { useState, useRef } from "react";
import "./Grid.css";

const Grid = ({ gridSize, gridVisible, activeTool, activeColor }) => {
const [cellColors, setCellColors] = useState({});
const [isDrawing, setIsDrawing] = useState(false);
const [startIndex, setStartIndex] = useState(null);
const [hoverIndex, setHoverIndex] = useState(null);
const canvasRef = useRef();
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

```
const updateHistory = (newState) => {
    const newHistory = [...history.slice(0, historyIndex + 1), newState];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
};

const handleCellClick = (index, endIndex = null) => {
    const updatedColors = { ...cellColors };

    if (activeTool === "brush") {
        updatedColors[index] = activeColor;
    } else if (activeTool === "eraser") {
        delete updatedColors[index];
    } else if (activeTool === "rectangle" && endIndex !== null) {
        drawRectangle(index, endIndex);
    } else if (activeTool === "line" && endIndex !== null) {
        drawLine(index, endIndex);
    } else if (activeTool === "bucket") {
        floodFill(index, cellColors[index] || "#f9f9f9", activeColor);
    }

    setCellColors(updatedColors);
    updateHistory(updatedColors);
};

const drawRectangle = (startIndex, endIndex) => {
    const updatedColors = { ...cellColors };
    const [startX, startY] = [startIndex % gridSize, Math.floor(startIndex / gridSize)];
    const [endX, endY] = [endIndex % gridSize, Math.floor(endIndex / gridSize)];
    const [minX, maxX] = [Math.min(startX, endX), Math.max(startX, endX)];
    const [minY, maxY] = [Math.min(startY, endY), Math.max(startY, endY)];

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            updatedColors[y * gridSize + x] = activeColor;
        }
    }
    setCellColors(updatedColors);
};

const drawLine = (startIndex, endIndex) => {
    const updatedColors = { ...cellColors };
    const [startX, startY] = [startIndex % gridSize, Math.floor(startIndex / gridSize)];
    const [endX, endY] = [endIndex % gridSize, Math.floor(endIndex / gridSize)];
    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = startX < endX ? 1 : -1;
    const sy = startY < endY ? 1 : -1;
    let err = dx - dy;

    let x = startX;
    let y = startY;

    while (true) {
        updatedColors[y * gridSize + x] = activeColor;
        if (x === endX && y === endY) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
    setCellColors(updatedColors);
};

const floodFill = (index, targetColor, fillColor) => {
    if (targetColor === fillColor) return;

    const updatedColors = { ...cellColors };
    const queue = [index];

    while (queue.length > 0) {
        const currentIndex = queue.shift();
        const currentColor = updatedColors[currentIndex] || "#f9f9f9";

        if (currentColor === targetColor) {
            updatedColors[currentIndex] = fillColor;

            const neighbors = [
                currentIndex - 1,
                currentIndex + 1,
                currentIndex - gridSize,
                currentIndex + gridSize,
            ];

            neighbors.forEach((neighbor) => {
                if (
                    neighbor >= 0 &&
                    neighbor < gridSize * gridSize &&
                    !queue.includes(neighbor)
                ) {
                    queue.push(neighbor);
                }
            });
        }
    }
    setCellColors(updatedColors);
};

const undo = () => {
    if (historyIndex > 0) {
        setCellColors(history[historyIndex - 1]);
        setHistoryIndex(historyIndex - 1);
    }
};

const redo = () => {
    if (historyIndex < history.length - 1) {
        setCellColors(history[historyIndex + 1]);
        setHistoryIndex(historyIndex + 1);
    }
};

const createGrid = () => {
    const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
        cells.push(
            <div
                key={i}
                className="grid-cell"
                style={{
                    backgroundColor: cellColors[i] || "#f9f9f9",
                    border: hoverIndex === i ? "1px solid red" : "1px solid #eee",
                }}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onClick={() => handleCellClick(i)}
            ></div>
        );
    }
    return cells;
};

const renderToCanvas = (scale = 1) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cellSize = (500 / gridSize) * scale;

    canvas.width = 500 * scale;
    canvas.height = 500 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.keys(cellColors).forEach((key) => {
        const index = parseInt(key);
        const x = (index % gridSize) * cellSize;
        const y = Math.floor(index / gridSize) * cellSize;
        ctx.fillStyle = cellColors[key];
        ctx.fillRect(x, y, cellSize, cellSize);
    });
};

const exportCanvas = (format, scale = 1) => {
    renderToCanvas(scale);
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL(`image/${format}`);
    link.download = `grid-export.${format}`;
    link.click();
};

return (
    <div>
        <div className="grid-controls">
            <button onClick={() => renderToCanvas()}>Render to Canvas</button>
            <button onClick={() => exportCanvas("png")}>Export to PNG</button>
            <button onClick={() => exportCanvas("jpeg")}>Export to JPG</button>
            <button onClick={undo}>Undo</button>
            <button onClick={redo}>Redo</button>
        </div>
        <div
            className="grid"
            style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                display: gridVisible ? "grid" : "none",
            }}
        >
            {createGrid()}
        </div>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
);
```

};

export default Grid;
