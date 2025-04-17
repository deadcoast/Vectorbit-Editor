# Enhancing the Brush for Pixel Art Consistency

We will enhance the brush to ensure it always draws square blocks that align perfectly with the grid, regardless of the grid bit size. The brush will dynamically adjust to the grid cell size to maintain pixel-perfect alignment.

## Step 1: Update Brush Logic

The brush should draw in grid-aligned blocks. This requires calculating the exact grid cell size and ensuring the brush respects these boundaries.

### File: src/frontend/Grid.js

const handleMouseDown = (event) => {
if (activeTool === "brush") {
const canvas = canvasRef.current;
const rect = canvas.getBoundingClientRect();
const x = Math.floor((event.clientX - rect.left) / cellSize);
const y = Math.floor((event.clientY - rect.top) / cellSize);
applyBrush(x, y);
setIsDrawing(true);
}
};

const handleMouseMove = (event) => {
if (isDrawing && activeTool === "brush") {
const canvas = canvasRef.current;
const rect = canvas.getBoundingClientRect();
const x = Math.floor((event.clientX - rect.left) / cellSize);
const y = Math.floor((event.clientY - rect.top) / cellSize);
applyBrush(x, y);
}
};

const handleMouseUp = () => {
if (isDrawing) {
setIsDrawing(false);
}
};

## Step 2: Calculate Grid Cell Size

Ensure the grid dynamically adjusts to the correct cell size based on the bit size.

const [cellSize, setCellSize] = useState(32); // Default cell size

useEffect(() => {
const calculateCellSize = () => {
const canvas = canvasRef.current;
if (canvas) {
const gridDimension = canvas.width; // Assume square grid
const newCellSize = gridDimension / gridSize;
setCellSize(newCellSize);
}
};

calculateCellSize();
}, [gridSize]);

Step 3: Brush Implementation

The brush will paint square cells that align perfectly with the grid.

const applyBrush = (x, y) => {
const updatedColors = { ...cellColors };
const index = y * gridSize + x;

if (index >= 0 && index < gridSize * gridSize) {
updatedColors[index] = activeColor; // Paint the cell
}

setCellColors(updatedColors);
};

## Step 4: Enhance Brush Preview

Show a preview of the brush size as the user moves the mouse over the grid.

const [hoverCell, setHoverCell] = useState(null);

const handleMouseOver = (event) => {
if (activeTool === "brush") {
const canvas = canvasRef.current;
const rect = canvas.getBoundingClientRect();
const x = Math.floor((event.clientX - rect.left) / cellSize);
const y = Math.floor((event.clientY - rect.top) / cellSize);
setHoverCell({ x, y });
}
};

const handleMouseOut = () => {
setHoverCell(null); // Clear hover preview when the mouse leaves the canvas
};

Render the hover preview:

const renderHoverPreview = (ctx) => {
if (hoverCell) {
ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Semi-transparent preview
ctx.fillRect(
hoverCell.x _cellSize,
hoverCell.y_ cellSize,
cellSize,
cellSize
);
}
};

Call renderHoverPreview in the canvas rendering logic.

## Step 5: Style Updates

Ensure the brush interface is visually clear and intuitive.

### Brush interface for File: src/frontend/Grid.css

````css
.canvas {
border: 1px solid #ccc;
cursor: crosshair;
}

.grid-cell {
box-sizing: border-box;
border: 1px solid rgba(0, 0, 0, 0.1);
}

.brush-preview {
position: absolute;
pointer-events: none;
background-color: rgba(0, 0, 0, 0.2);
}

## Step 6: Test the Brush

1. Run the Development Server:
   npm start
2. Test Brush Alignment:
   • Draw on grids of different bit sizes (8x8, 16x16, 32x32, etc.).
   • Ensure the brush aligns perfectly with the grid cells.
3. Test Dynamic Adjustment:
   • Change the grid size and verify the brush adjusts automatically.
4. Test Brush Preview:
   • Move the mouse over the grid and confirm the preview matches the active grid cell.

---

---

Implementing an Advanced Eraser Tool and Multiple Brush Types with QoL Features

We will thoroughly enhance the Eraser Tool and Brush Types to integrate seamlessly with the pixel art grid, including advanced functionality and quality-of-life improvements.

## Step 1: Advanced Eraser Tool

The eraser will use the same grid alignment logic as the brush but will clear colors instead of applying them.

### 1.1 Update Eraser Logic

#### Eraser Logic for File: src/frontend/Grid.js

```javascript
const applyEraser = (x, y) => {
const updatedColors = { ...cellColors };
const index = y \* gridSize + x;

if (index >= 0 && index < gridSize \* gridSize) {
updatedColors[index] = null; // Clear the cell
}

setCellColors(updatedColors);
};

const handleMouseDown = (event) => {
const canvas = canvasRef.current;
const rect = canvas.getBoundingClientRect();
const x = Math.floor((event.clientX - rect.left) / cellSize);
const y = Math.floor((event.clientY - rect.top) / cellSize);

if (activeTool === "brush") {
applyBrush(x, y);
} else if (activeTool === "eraser") {
applyEraser(x, y);
}
setIsDrawing(true);
};

const handleMouseMove = (event) => {
if (isDrawing) {
const canvas = canvasRef.current;
const rect = canvas.getBoundingClientRect();
const x = Math.floor((event.clientX - rect.left) / cellSize);
const y = Math.floor((event.clientY - rect.top) / cellSize);

if (activeTool === "brush") {
  applyBrush(x, y);
} else if (activeTool === "eraser") {
  applyEraser(x, y);
}
};

const handleMouseUp = () => {
if (isDrawing) {
setIsDrawing(false);
}
};
````

### 1.2 Add Eraser Preview

Show a preview of the eraser’s action, similar to the brush preview.

#### Eraser Preview for File: src/frontend/Grid.js

const renderEraserPreview = (ctx) => {
if (hoverCell && activeTool === "eraser") {
ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Semi-transparent white
ctx.fillRect(
hoverCell.x _cellSize,
hoverCell.y_ cellSize,
cellSize,
cellSize
);
}
};

Add the preview rendering to the canvas logic:

const renderCanvas = (ctx) => {
renderGrid(ctx);
renderHoverPreview(ctx);
renderEraserPreview(ctx);
};

## Step 2: Implement Multiple Brush Types

We will add different brush types, such as filled squares, outlined squares, and patterned strokes.

### 2.1 Extend Brush Logic

Modify the applyBrush function to support multiple brush types.

#### Brush Logic for File: src/frontend/Grid.js

```javascript
const applyBrush = (x, y, type = "filled") => {
const updatedColors = { ...cellColors };

const paintCell = (x, y, color) => {
const index = y _gridSize + x;
if (index >= 0 && index < gridSize_ gridSize) {
updatedColors[index] = color;
}
};

if (type === "filled") {
paintCell(x, y, activeColor);
} else if (type === "outline") {
// Draw only the border of the square
const neighbors = \[
[x - 1, y], // Left
[x + 1, y], // Right
[x, y - 1], // Top
[x, y + 1], // Bottom
\];
neighbors.forEach(([nx, ny]) => paintCell(nx, ny, activeColor));
} else if (type === "patterned") {
// Add a simple checkerboard pattern
if ((x + y) % 2 === 0) {
paintCell(x, y, activeColor);
}
}

setCellColors(updatedColors);
};
```

## 2.2 Add Brush Type Selector

Let users choose the brush type from a dropdown menu.

### Brush Type Dropdown for File: src/frontend/Toolbar.js

```javascript
const [brushType, setBrushType] = useState("filled");

return (
  <div className="toolbar">
    <label>Brush Type:</label>
    <select value={brushType} onChange={(e) => setBrushType(e.target.value)}>
      <option value="filled">Filled</option>
      <option value="outline">Outline</option>
      <option value="patterned">Patterned</option>
    </select>
  </div>
);
```

Update handleMouseDown to pass the selected brush type:

```javascript
if (activeTool === "brush") {
  applyBrush(x, y, brushType);
}
```

## Step 3: QoL Enhancements

3.1 Undo/Redo Functionality

Track changes to the grid for undo/redo actions.

### Grid changes for File: src/frontend/Grid.js

````javascript
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const saveToHistory = () => {
const newHistory = [...history.slice(0, historyIndex + 1), cellColors];
setHistory(newHistory);
setHistoryIndex(newHistory.length - 1);
};

const undo = () => {
if (historyIndex > 0) {
setHistoryIndex((prev) => prev - 1);
setCellColors(history[historyIndex - 1]);
}
};

const redo = () => {
if (historyIndex < history.length - 1) {
setHistoryIndex((prev) => prev + 1);
setCellColors(history[historyIndex + 1]);
}
};

Save the state after each action:

const applyBrush = (x, y, type = "filled") => {
// ... Brush logic
saveToHistory();
};

Add undo/redo buttons to the toolbar:

<button onClick={undo}>Undo</button>
<button onClick={redo}>Redo</button>

## 3.2 Eraser Shortcut

Enable quick toggling between the brush and eraser using the E key.

### File: src/frontend/Grid.js

```javascript
useEffect(() => {
const handleKeyDown = (e) => {
if (e.key === "e" || e.key === "E") {
setActiveTool((prev) => (prev === "eraser" ? "brush" : "eraser"));
}
};

window.addEventListener("keydown", handleKeyDown);
return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
````

## Step 4: Style Updates

4.1 Brush Type Dropdown

### File: src/frontend/Toolbar.css

```css
.toolbar select {
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 3px;
}
```

## 4.2 Eraser Preview

### Eraser Preview for File: src/frontend/Grid.css

```css
.eraser-preview {
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid #ccc;
}
```

## Step 5: Test the Features

1. Run the Development Server:
   npm start
1. Test the Eraser Tool:
   • Erase cells accurately on different grid sizes.
   • Verify the eraser preview aligns with the grid.
1. Test Brush Types:
   • Use filled, outline, and patterned brushes.
   • Verify alignment with the grid.
1. Test QoL Enhancements:
   • Undo and redo brush/eraser actions.
   • Use the E shortcut to toggle between the brush and eraser.
