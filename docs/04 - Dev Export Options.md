# Feature 4: Export Options Placeholder

**NOTE:** ALL DOCUMENTATION IS SUBJECT TO CHANGE, EXAMPLES LISTED ARE NOT DIRECT AND OR LITTERAL TRANSLATIONS TO THE SOURCE CODE.

---

The export functionality will enable saving the current grid as .svg, .png, or .jpg files. For now, we’ll create a working placeholder that:

1. Exports the grid as an SVG.
1. Prepares the structure for future .png and .jpg exports.
1. Integrates with the existing grid and menus.

## Step 1: Add Export Functionality in the Grid Component

We’ll implement a function to generate an SVG representation of the current grid state.

## File: src/frontend/Grid.js

```javascript
import React from "react";
import "./Grid.css";

const Grid = ({
  gridSize,
  gridVisible,
  activeTool,
  activeColor,
  cellColors,
  setCellColors,
}) => {
  const handleCellClick = (index) => {
    setCellColors((prev) => {
      const updatedColors = { ...prev };
      if (activeTool === "brush") {
        updatedColors[index] = activeColor; // Paint cell
      } else if (activeTool === "eraser") {
        delete updatedColors[index]; // Erase cell
      }
      return updatedColors;
    });
  };

  const createGrid = () => {
    const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const cellStyle = {
        backgroundColor: cellColors[i] || "#f9f9f9", // Default color
      };
      cells.push(
        <div
          key={i}
          className="grid-cell"
          style={cellStyle}
          onClick={() => handleCellClick(i)}
        ></div>
      );
    }
    return cells;
  };

  // Generate SVG string based on grid state
  const exportToSVG = () => {
    const cellSize = 500 / gridSize; // Calculate cell size
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">`;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellIndex = i * gridSize + j;
        const color = cellColors[cellIndex] || "#f9f9f9";
        svgContent += `<rect x="${j * cellSize}" y="${
          i * cellSize
        }" width="${cellSize}" height="${cellSize}" fill="${color}" />`;
      }
    }

    svgContent += `</svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "exported-grid.svg";
    link.click();
  };

  return (
    <div>
      <div className="grid-controls">
        <button onClick={exportToSVG}>Export to SVG</button>
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
    </div>
  );
};

export default Grid;
```

## Step 2: Pass State Management from App

Update the App component to manage cell states globally, so we can reuse the state for export operations.

## File: src/frontend/App.js

```javascript
import React, { useState } from "react";
import Grid from "./Grid";
import Menus from "./Menus";
import Toolbar from "./Toolbar";

const App = () => {
  const [gridVisible, setGridVisible] = useState(true);
  const [gridSize, setGridSize] = useState(16);
  const [activeTool, setActiveTool] = useState("brush");
  const [activeColor, setActiveColor] = useState("#000000");
  const [cellColors, setCellColors] = useState({}); // State for cell colors

  const toggleGrid = () => {
    setGridVisible(!gridVisible);
  };

  return (
    <div>
      <h1>Vectorbit</h1>
      <Menus toggleGrid={toggleGrid} setGridSize={setGridSize} />
      <Toolbar setActiveTool={setActiveTool} setActiveColor={setActiveColor} />
      <Grid
        gridSize={gridSize}
        gridVisible={gridVisible}
        activeTool={activeTool}
        activeColor={activeColor}
        cellColors={cellColors}
        setCellColors={setCellColors}
      />
    </div>
  );
};

export default App;
```

## Step 3: Add Placeholder Buttons for .png and .jpg

We will update the grid controls to include buttons for .png and .jpg export, although they will currently only log a message.

### File: src/frontend/Grid.js (Updated Snippet)

```javascript
<div className="grid-controls">
  <button onClick={exportToSVG}>Export to SVG</button>
  <button onClick={() => console.log("Export to PNG coming soon!")}>
    Export to PNG
  </button>
  <button onClick={() => console.log("Export to JPG coming soon!")}>
    Export to JPG
  </button>
</div>
```

## Step 4: Add CSS for Export Controls

### File: src/frontend/Grid.css (Updated Snippet)

```css
.grid-controls {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.grid-controls button {
  padding: 5px 10px;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.grid-controls button:hover {
  background-color: #555;
}
```

## Testing Feature 4

1. Run the development server:
   npm start
1. Verify functionality:
   • Clicking Export to SVG downloads the current grid as an .svg file.
   • Clicking Export to PNG or Export to JPG logs placeholders in the console.

## Step 1: Add a Canvas Element for Rendering

To implement full functionality for exporting to .png and .jpg, we’ll use the Canvas API to render the grid and convert it into rasterized image formats. Here’s how we’ll integrate this functionality step-by-step:

We’ll add a hidden canvas element to the Grid component to handle rasterizing the grid.

### Canvas Element for File: src/frontend/Grid.js

```javascript
import React, { useRef } from "react";
import "./Grid.css";

const Grid = ({
  gridSize,
  gridVisible,
  activeTool,
  activeColor,
  cellColors,
  setCellColors,
}) => {
  const canvasRef = useRef(); // Reference to the hidden canvas element

  const handleCellClick = (index) => {
    setCellColors((prev) => {
      const updatedColors = { ...prev };
      if (activeTool === "brush") {
        updatedColors[index] = activeColor; // Paint cell
      } else if (activeTool === "eraser") {
        delete updatedColors[index]; // Erase cell
      }
      return updatedColors;
    });
  };

  const createGrid = () => {
    const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const cellStyle = {
        backgroundColor: cellColors[i] || "#f9f9f9", // Default color
      };
      cells.push(
        <div
          key={i}
          className="grid-cell"
          style={cellStyle}
          onClick={() => handleCellClick(i)}
        ></div>
      );
    }
    return cells;
  };

  // Render the grid to the canvas
  const renderToCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cellSize = canvas.width / gridSize;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const cellIndex = i * gridSize + j;
        const color = cellColors[cellIndex] || "#f9f9f9";
        ctx.fillStyle = color;
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  };

  // Export the canvas as PNG or JPG
  const exportCanvas = (format) => {
    renderToCanvas(); // Render the grid to the canvas
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL(`image/${format}`);
    link.download = `exported-grid.${format}`;
    link.click();
  };

  return (
    <div>
      <div className="grid-controls">
        <button onClick={() => renderToCanvas()}>Render to Canvas</button>
        <button onClick={() => exportCanvas("png")}>Export to PNG</button>
        <button onClick={() => exportCanvas("jpeg")}>Export to JPG</button>
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
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        style={{ display: "none" }} // Hidden canvas
      ></canvas>
    </div>
  );
};

export default Grid;
```

## Step 2: Update the App Component

Ensure the App component passes the necessary props (cellColors and setCellColors) to the Grid.

### App Component Props for File: src/frontend/App.js

```javascript
import React, { useState } from "react";
import Grid from "./Grid";
import Menus from "./Menus";
import Toolbar from "./Toolbar";

const App = () => {
  const [gridVisible, setGridVisible] = useState(true);
  const [gridSize, setGridSize] = useState(16);
  const [activeTool, setActiveTool] = useState("brush");
  const [activeColor, setActiveColor] = useState("#000000");
  const [cellColors, setCellColors] = useState({}); // State for cell colors

  const toggleGrid = () => {
    setGridVisible(!gridVisible);
  };

  return (
    <div>
      <h1>Vectorbit</h1>
      <Menus toggleGrid={toggleGrid} setGridSize={setGridSize} />
      <Toolbar setActiveTool={setActiveTool} setActiveColor={setActiveColor} />
      <Grid
        gridSize={gridSize}
        gridVisible={gridVisible}
        activeTool={activeTool}
        activeColor={activeColor}
        cellColors={cellColors}
        setCellColors={setCellColors}
      />
    </div>
  );
};

export default App;
```

## Step 3: Add Styling for Export Controls

Update the Grid.css file to ensure the export controls are styled consistently.

### File: src/frontend/Grid.css

```css
.grid-controls {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.grid-controls button {
  padding: 5px 10px;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.grid-controls button:hover {
  background-color: #555;
}

## Testing Full Export Functionality

1. Run the development server:

npm start

2. Test features:

• Render to Canvas: Clicking the button should render the grid to the canvas (even though it’s hidden).

• Export to PNG: Clicking the button downloads the grid as a .png file.

• Export to JPG: Clicking the button downloads the grid as a .jpg file.

3. Verify image quality:

• The exported images should have the correct colors and match the current grid state.

---
---

1. Refining Grid Rendering for Higher Resolutions

We will:

• Improve canvas rendering to support higher resolutions dynamically based on the grid size.

• Allow users to export high-resolution images while preserving the current grid’s state.

## Step 1.1: Modify renderToCanvas for High Resolution

Update the canvas rendering function to support scaling for high resolutions dynamically. This involves increasing the canvas size and scaling the content accordingly.

### File: src/frontend/Grid.js

const renderToCanvas = (scale = 1) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  const cellSize = (canvas.width / gridSize) *scale; // Adjust cell size for scaling
  const resolution = 500* scale; // Scale canvas resolution

  // Set canvas dimensions for high resolution
  canvas.width = resolution;
  canvas.height = resolution;

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cellIndex = i *gridSize + j;
      const color = cellColors[cellIndex] || "#f9f9f9";
      ctx.fillStyle = color;
      ctx.fillRect(j* cellSize, i * cellSize, cellSize, cellSize);
    }
  }
};

const exportCanvas = (format, scale = 1) => {
  renderToCanvas(scale); // Render the grid at the specified scale
  const canvas = canvasRef.current;
  const link = document.createElement("a");
  link.href = canvas.toDataURL(`image/${format}`);
  link.download = `exported-grid-${scale}x.${format}`;
  link.click();
};

## Step 1.2: Update Controls for High-Resolution Export

Add buttons to export the grid at different resolutions (e.g., 2x, 4x).

#### File: src/frontend/Grid.js (Updated Snippet)

<div className="grid-controls">
  <button onClick={() => exportCanvas("png")}>Export to PNG</button>
  <button onClick={() => exportCanvas("jpeg")}>Export to JPG</button>
  <button onClick={() => exportCanvas("png", 2)}>Export to PNG (2x)</button>
  <button onClick={() => exportCanvas("jpeg", 4)}>Export to JPG (4x)</button>
</div>

2. Advanced Drawing Tools and Undo/Redo

We will:

• Add line tool, rectangle tool, and bucket fill tool.

• Implement undo/redo functionality.

## Step 2.1: Add Line Tool

Enhance handleCellClick to support line drawing.

#### File: src/frontend/Grid.js

const handleCellClick = (index, endIndex = null) => {
  setCellColors((prev) => {
    const updatedColors = { ...prev };

    if (activeTool === "brush") {
      updatedColors[index] = activeColor; // Paint cell
    } else if (activeTool === "eraser") {
      delete updatedColors[index]; // Erase cell
    } else if (activeTool === "line" && endIndex !== null) {
      // Line drawing logic (Bresenham's line algorithm)
      const [startX, startY] = [index % gridSize, Math.floor(index / gridSize)];
      const [endX, endY] = [endIndex % gridSize, Math.floor(endIndex / gridSize)];
      const dx = Math.abs(endX - startX);
      const dy = Math.abs(endY - startY);
      const sx = startX < endX ? 1 : -1;
      const sy = startY < endY ? 1 : -1;
      let err = dx - dy;

      let x = startX;
      let y = startY;

      while (true) {
        updatedColors[y * gridSize + x] = activeColor; // Paint along the line
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
    }

    return updatedColors;
  });
};

## Step 2.2: Add Undo/Redo Functionality

Implement undo/redo by tracking the grid’s state history.

#### File: src/frontend/Grid.js

const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const updateHistory = (newState) => {
  const newHistory = [...history.slice(0, historyIndex + 1), newState];
  setHistory(newHistory);
  setHistoryIndex(newHistory.length - 1);
};

// Update the state and history on cell click
const handleCellClick = (index) => {
  setCellColors((prev) => {
    const updatedColors = { ...prev, [index]: activeColor };
    updateHistory(updatedColors); // Save to history
    return updatedColors;
  });
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

Add buttons for undo/redo in the grid controls:

<div className="grid-controls">
  <button onClick={undo}>Undo</button>
  <button onClick={redo}>Redo</button>
</div>

Step 3: Test the New Features

1. Run the development server:

npm start

2. Test features:

• Export at different resolutions (e.g., 1x, 2x, 4x).

• Use the line tool to draw straight lines between two cells.

• Verify undo/redo functionality works as expected.
```
