# Enhancing Bucket Fill and Rectangle Tools

**NOTE:** ALL DOCUMENTATION IS SUBJECT TO CHANGE, EXAMPLES LISTED ARE NOT DIRECT AND OR LITTERAL
TRANSLATIONS TO THE SOURCE CODE.

---

We’ll enhance the Bucket Fill Tool to flood-fill an area with the selected color and implement the
Rectangle Tool for drawing rectangles on the grid.

## Step 1: Enhance Bucket Fill Tool

The Bucket Fill Tool will use a flood-fill algorithm to fill connected cells of the same color with
the selected color.

### Bucket Fill for File: src/frontend/Grid.js

```javascript
const floodFill = (index, targetColor, fillColor) => {
  if (targetColor === fillColor) return; // No need to fill if the colors are the same

  const updatedColors = { ...cellColors };
  const queue = [index];
  const width = gridSize;

  while (queue.length > 0) {
    const currentIndex = queue.shift();
    const currentColor = updatedColors[currentIndex] || '#f9f9f9';

    if (currentColor === targetColor) {
      updatedColors[currentIndex] = fillColor;

      // Add neighboring cells to the queue
      const neighbors = [
        currentIndex - 1, // Left
        currentIndex + 1, // Right
        currentIndex - width, // Top
        currentIndex + width, // Bottom
      ];

      neighbors.forEach(neighbor => {
        if (
          neighbor >= 0 &&
          neighbor < gridSize * gridSize && // Bounds check
          !queue.includes(neighbor)
        ) {
          queue.push(neighbor);
        }
      });
    }
  }

  setCellColors(updatedColors); // Update grid colors
};

// Use the Bucket Fill Tool
const handleCellClick = index => {
  const targetColor = cellColors[index] || '#f9f9f9';
  if (activeTool === 'bucket') {
    floodFill(index, targetColor, activeColor);
  } else if (activeTool === 'brush') {
    setCellColors(prev => ({ ...prev, [index]: activeColor }));
  } else if (activeTool === 'eraser') {
    setCellColors(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  }
};
```

## Step 2: Add Rectangle Tool

The Rectangle Tool allows users to draw rectangles by clicking and dragging across the grid.

### Rectangle Tool for File: src/frontend/Grid.js

````javascript
const drawRectangle = (startIndex, endIndex) => {
const updatedColors = { ...cellColors };
const startX = startIndex % gridSize;
const startY = Math.floor(startIndex / gridSize);
const endX = endIndex % gridSize;
const endY = Math.floor(endIndex / gridSize);

const [minX, maxX] = [Math.min(startX, endX), Math.max(startX, endX)];
const [minY, maxY] = [Math.min(startY, endY), Math.max(startY, endY)];

for (let y = minY; y <= maxY; y++) {
for (let x = minX; x <= maxX; x++) {
const index = y \* gridSize + x;
updatedColors[index] = activeColor;
}
}

setCellColors(updatedColors);
};

// Handle Mouse Drag for Rectangle Tool
const handleMouseDown = (index) => {
if (activeTool === "rectangle") {
setIsDrawing(true);
setStartIndex(index);
}
};

const handleMouseUp = (index) => {
if (activeTool === "rectangle" && isDrawing) {
drawRectangle(startIndex, index);
setIsDrawing(false);
setStartIndex(null);
}
};

Update the Grid component to track the drawing state (isDrawing) and start index for the rectangle:

const [isDrawing, setIsDrawing] = useState(false);
const [startIndex, setStartIndex] = useState(null);

## Step 3: Integrate Tools in Toolbar

Add buttons for Bucket Fill and Rectangle Tool in the Toolbar component.

### Toolbar for File: src/frontend/Toolbar.js

```javascript
const Toolbar = ({ setActiveTool, setActiveColor }) => {
  return (
    <div className="toolbar">
      <button onClick={() => setActiveTool("brush")}>Brush</button>
      <button onClick={() => setActiveTool("eraser")}>Eraser</button>
      <button onClick={() => setActiveTool("bucket")}>Bucket Fill</button>
      <button onClick={() => setActiveTool("rectangle")}>Rectangle</button>
      <input
        type="color"
        onChange={(e) => setActiveColor(e.target.value)}
        title="Color Picker"
      />
    </div>
  );
};
````

## Step 4: Test Bucket Fill and Rectangle Tools

1. Run the development server: npm start
1. Test Bucket Fill: • Select the Bucket Fill Tool from the toolbar. • Click on a grid cell to
   flood-fill all connected cells of the same color with the selected color.
1. Test Rectangle Tool: • Select the Rectangle Tool from the toolbar. • Click and drag across the
   grid to draw a rectangle.

## Enhancing the Grid Further and Adding Multiple Layers Export

We will:

1. Enhance the grid with snapping and alignment features.

1. Implement the foundation for multiple layers with export functionality, allowing different layers
   to be saved/exported.

## Step 1: Enhance the Grid with Snapping and Alignment

1.1 Add Snapping to Grid

Snapping ensures tools (e.g., Brush, Rectangle) align to the grid cells.

### Snapping for File: src/frontend/Grid.js

````javascript
const snapToGrid = (index) => {
const x = index % gridSize;
const y = Math.floor(index / gridSize);
return y \* gridSize + x; // Return the snapped cell index
};

// Modify tools to use snapping
const handleCellClick = (index) => {
const snappedIndex = snapToGrid(index);
if (activeTool === "brush") {
setCellColors((prev) => ({ ...prev, [snappedIndex]: activeColor }));
} else if (activeTool === "eraser") {
setCellColors((prev) => {
const updated = { ...prev };
delete updated[snappedIndex];
return updated;
});
} else if (activeTool === "bucket") {
const targetColor = cellColors[snappedIndex] || "#f9f9f9";
floodFill(snappedIndex, targetColor, activeColor);
}
};

## 1.2 Add Alignment Guide

We’ll add a horizontal and vertical line to show alignment guides when hovering over the grid.

### File: src/frontend/Grid.js

```javascript
const [hoverIndex, setHoverIndex] = useState(null);

const handleMouseEnter = (index) => {
setHoverIndex(index); // Track the hovered cell
};

const handleMouseLeave = () => {
setHoverIndex(null); // Reset hover state
};

const createGrid = () => {
const cells = [];
for (let i = 0; i < gridSize \* gridSize; i++) {
const cellStyle = {
backgroundColor: cellColors[i] || "#f9f9f9",
border:
hoverIndex === i
? "1px solid red" // Highlight hovered cell
: "1px solid #eee",
};
cells.push(
<div
key={i}
className="grid-cell"
style={cellStyle}
onMouseEnter={() => handleMouseEnter(i)}
onMouseLeave={handleMouseLeave}
onClick={() => handleCellClick(i)} ></div>
);
}
return cells;
};
````

## 1.3 Add CSS for Alignment Guides

### File: src/frontend/Grid.css

```css
.grid-cell {
position: relative;
transition: border 0.2s;
}

.grid-cell:hover {
outline: 1px dashed red; /_ Temporary highlight _/
}
```

## Step 2: Add Multiple Layers Export

We’ll allow users to create, manage, and export multiple layers of the grid.

### 2.1 Add Layer Management

Update the App component to manage multiple layers.

### File: src/frontend/App.js

```javascript
const App = () => {
const [layers, setLayers] = useState([{ id: 1, name: "Layer 1", cellColors: {} }]);
const [activeLayerIndex, setActiveLayerIndex] = useState(0);

const addLayer = () => {
const newLayer = {
id: layers.length + 1,
name: `Layer ${layers.length + 1}`,
cellColors: {},
};
setLayers([...layers, newLayer]);
setActiveLayerIndex(layers.length); // Set the new layer as active
};

const deleteLayer = (index) => {
const updatedLayers = layers.filter((\_, i) => i !== index);
setLayers(updatedLayers);
setActiveLayerIndex(Math.max(0, index - 1)); // Adjust active layer
};

const updateLayerColors = (cellColors) => {
const updatedLayers = [...layers];
updatedLayers[activeLayerIndex].cellColors = cellColors;
setLayers(updatedLayers);
};

return (
<div>
<h1>Vectorbit</h1>
<Menus toggleGrid={toggleGrid} setGridSize={setGridSize} />
<Toolbar setActiveTool={setActiveTool} setActiveColor={setActiveColor} />
<div className="layer-controls">
<button onClick={addLayer}>Add Layer</button>
<button
onClick={() => deleteLayer(activeLayerIndex)}
disabled={layers.length === 1} >
Delete Layer
</button>
<div>
{layers.map((layer, index) => (
<button
key={layer.id}
onClick={() => setActiveLayerIndex(index)}
style={{
                fontWeight: activeLayerIndex === index ? "bold" : "normal",
              }} >
{layer.name}
</button>
))}
</div>
</div>
<Grid
        gridSize={gridSize}
        gridVisible={gridVisible}
        activeTool={activeTool}
        activeColor={activeColor}
        cellColors={layers[activeLayerIndex].cellColors}
        setCellColors={updateLayerColors}
      />
</div>
);
};

### 2.2 Add Multiple Layers Export

We’ll update the export functionality to include all layers.

#### File: src/frontend/Grid.js

const exportAllLayersToSVG = () => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");
const resolution = 500;

canvas.width = resolution;
canvas.height = resolution;

ctx.clearRect(0, 0, canvas.width, canvas.height);

layers.forEach((layer) => {
Object.keys(layer.cellColors).forEach((key) => {
const index = parseInt(key);
const x = (index % gridSize) _ (resolution / gridSize);
const y = Math.floor(index / gridSize) _ (resolution / gridSize);
ctx.fillStyle = layer.cellColors[key];
ctx.fillRect(x, y, resolution / gridSize, resolution / gridSize);
});
});

const link = document.createElement("a");
link.href = canvas.toDataURL("image/svg+xml");
link.download = "all-layers-export.svg";
link.click();
};

### Add an export button for all layers:

<div className="grid-controls">
  <button onClick={exportAllLayersToSVG}>Export All Layers to SVG</button>
</div>

Testing the Features

1. Run the development server:

npm start

2. Test Snapping and Alignment:

• Verify that tools snap to the grid and hover alignment guides are shown.

3. Test Layer Management:

• Add, delete, and switch between layers.

• Verify grid data updates with each layer.

4. Test Multiple Layers Export:

• Export all layers to a single .svg file.

---

---

## Refining Layer Features

We’ll refine layer functionality by introducing:

1. Layer Opacity Control to allow users to adjust transparency for each layer.

2. Visibility Toggles to show or hide layers.

3. Layer Reordering to adjust the stacking order.

## Step 1: Add Opacity Control for Layers

### 1.1 Update Layer Data Structure

Modify the layer structure to include an opacity property.

#### File: src/frontend/App.js

const App = () => {
const [layers, setLayers] = useState([
{ id: 1, name: "Layer 1", cellColors: {}, opacity: 1, visible: true },
]);
const [activeLayerIndex, setActiveLayerIndex] = useState(0);

const updateLayerOpacity = (index, newOpacity) => {
const updatedLayers = [...layers];
updatedLayers[index].opacity = newOpacity;
setLayers(updatedLayers);
};

const toggleLayerVisibility = (index) => {
const updatedLayers = [...layers];
updatedLayers[index].visible = !updatedLayers[index].visible;
setLayers(updatedLayers);
};

return (
<div>
<h1>Vectorbit</h1>
<div className="layer-controls">
<button onClick={addLayer}>Add Layer</button>
<button
onClick={() => deleteLayer(activeLayerIndex)}
disabled={layers.length === 1} >
Delete Layer
</button>
<div>
{layers.map((layer, index) => (
<div key={layer.id} style={{ display: "flex", alignItems: "center" }}>
<button
onClick={() => setActiveLayerIndex(index)}
style={{
                  fontWeight: activeLayerIndex === index ? "bold" : "normal",
                }} >
{layer.name}
</button>
<input
type="range"
min="0"
max="1"
step="0.1"
value={layer.opacity}
onChange={(e) => updateLayerOpacity(index, parseFloat(e.target.value))}
style={{ marginLeft: "10px", width: "80px" }}
/>
<button onClick={() => toggleLayerVisibility(index)}>
{layer.visible ? "Hide" : "Show"}
</button>
</div>
))}
</div>
</div>
<Grid
        gridSize={gridSize}
        gridVisible={gridVisible}
        activeTool={activeTool}
        activeColor={activeColor}
        cellColors={layers[activeLayerIndex].cellColors}
        setCellColors={updateLayerColors}
        layers={layers}
      />
</div>
);
};

## Step 2: Add Layer Opacity and Visibility to Grid Rendering

Update the Grid component to apply opacity and visibility settings when rendering.

#### File: src/frontend/Grid.js

const renderLayer = (ctx, layer, scale = 1) => {
if (!layer.visible) return; // Skip hidden layers

const cellSize = (canvas.width / gridSize) \* scale;

Object.keys(layer.cellColors).forEach((key) => {
const index = parseInt(key);
const x = (index % gridSize) _ cellSize;
const y = Math.floor(index / gridSize) _ cellSize;
ctx.globalAlpha = layer.opacity; // Set layer opacity
ctx.fillStyle = layer.cellColors[key];
ctx.fillRect(x, y, cellSize, cellSize);
});
};

const renderToCanvas = (scale = 1) => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");
const resolution = 500 \* scale;

canvas.width = resolution;
canvas.height = resolution;

ctx.clearRect(0, 0, canvas.width, canvas.height);

layers.forEach((layer) => renderLayer(ctx, layer, scale));
};

## Step 3: Add Layer Reordering

Allow users to move layers up or down in the stack.

### 3.1 Update Layer Controls

Add buttons to move layers up and down.

#### File: src/frontend/App.js

const reorderLayer = (fromIndex, toIndex) => {
if (toIndex < 0 || toIndex >= layers.length) return; // Prevent out-of-bounds
const updatedLayers = [...layers];
const [movedLayer] = updatedLayers.splice(fromIndex, 1);
updatedLayers.splice(toIndex, 0, movedLayer);
setLayers(updatedLayers);
};

return (

  <div className="layer-controls">
    {layers.map((layer, index) => (
      <div key={layer.id} style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={() => setActiveLayerIndex(index)}
          style={{
            fontWeight: activeLayerIndex === index ? "bold" : "normal",
          }}
        >
          {layer.name}
        </button>
        <button onClick={() => reorderLayer(index, index - 1)}>Up</button>
        <button onClick={() => reorderLayer(index, index + 1)}>Down</button>
      </div>
    ))}
  </div>
);
```

## Step 4: Style Layer Controls

Update the App.css or LayerControls.css file to style the new layer controls.

### File: src/frontend/LayerControls.css

```css
.layer-controls {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.layer-controls button {
  margin: 0 5px;
  padding: 5px;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
}

.layer-controls button:hover {
  background-color: #555;
}

.layer-controls input[type='range'] {
  width: 100px;
  margin-left: 10px;
}
```

## Testing the Features

1. Run the development server: npm start
1. Test Layer Opacity: • Adjust the opacity slider for a layer and verify transparency updates.
1. Test Layer Visibility: • Toggle visibility for a layer and verify it hides or shows.
1. Test Layer Reordering: • Move layers up or down in the stack and verify the drawing order
   updates.

## 1. Layer Grouping

Layer grouping allows users to organize multiple layers into a group, making it easier to manage
opacity, visibility, and transformations collectively.

## Step 1.1: Update the Layer Data Structure

Introduce a concept of groups in the layer data structure.

### Layer Data Structure for File: src/frontend/App.js

```javascript
const App = () => {
  const [layers, setLayers] = useState([
    {
      id: 1,
      name: 'Layer 1',
      cellColors: {},
      opacity: 1,
      visible: true,
      group: null,
    },
  ]);
  const [groups, setGroups] = useState([{ id: 1, name: 'Group 1', layers: [] }]);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);

  const addGroup = () => {
    const newGroup = {
      id: groups.length + 1,
      name: `Group ${groups.length + 1}`,
      layers: [],
    };
    setGroups([...groups, newGroup]);
  };

  const assignLayerToGroup = (layerIndex, groupId) => {
    const updatedLayers = [...layers];
    updatedLayers[layerIndex].group = groupId;
    setLayers(updatedLayers);

    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? { ...group, layers: [...group.layers, updatedLayers[layerIndex].id] }
        : group
    );
    setGroups(updatedGroups);
  };

  return (
    <div>
      <h1>Vectorbit</h1>
      <div className="group-controls">
        <button onClick={addGroup}>Add Group</button>
        <div>
          {groups.map(group => (
            <div key={group.id}>
              <span>{group.name}</span>
              {layers
                .filter(layer => layer.group === group.id)
                .map(layer => (
                  <div key={layer.id} style={{ marginLeft: '20px' }}>
                    {layer.name}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
      <Grid
        gridSize={gridSize}
        gridVisible={gridVisible}
        activeTool={activeTool}
        activeColor={activeColor}
        cellColors={layers[activeLayerIndex].cellColors}
        setCellColors={updateLayerColors}
        layers={layers}
      />
    </div>
  );
};
```

## Step 1.2: Update Layer Rendering for Groups

Ensure grouped layers are rendered together, applying group-level settings like opacity and
visibility.

### Group Rendering for File: src/frontend/Grid.js

```javascript
const renderGroup = (ctx, group, scale = 1) => {
const groupLayers = layers.filter((layer) => group.layers.includes(layer.id));
groupLayers.forEach((layer) => renderLayer(ctx, layer, scale));
};

const renderToCanvas = (scale = 1) => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");
const resolution = 500 \* scale;

canvas.width = resolution;
canvas.height = resolution;

ctx.clearRect(0, 0, canvas.width, canvas.height);

groups.forEach((group) => renderGroup(ctx, group, scale));
layers.filter((layer) => !layer.group).forEach((layer) => renderLayer(ctx, layer, scale));
};
```

## Step 2: Advanced Drawing Tools

We’ll implement:

• Ellipse Tool for drawing ellipses.

• Freehand Tool for smoother, continuous drawing.

## Step 2.1: Add Ellipse Tool

The ellipse tool will calculate and render ellipses based on two points: the starting point (mouse
down) and the ending point (mouse up).

### Ellipse Tool for File: src/frontend/Grid.js

```javascript
const drawEllipse = (startIndex, endIndex) => {
const updatedColors = { ...cellColors };

const startX = startIndex % gridSize;
const startY = Math.floor(startIndex / gridSize);
const endX = endIndex % gridSize;
const endY = Math.floor(endIndex / gridSize);

const centerX = (startX + endX) / 2;
const centerY = (startY + endY) / 2;
const radiusX = Math.abs(endX - startX) / 2;
const radiusY = Math.abs(endY - startY) / 2;

for (let y = 0; y < gridSize; y++) {
for (let x = 0; x < gridSize; x++) {
const normalizedX = (x - centerX) / radiusX;
const normalizedY = (y - centerY) / radiusY;
if (normalizedX ** 2 + normalizedY ** 2 <= 1) {
const index = y \* gridSize + x;
updatedColors[index] = activeColor;
}
}
}

setCellColors(updatedColors);
};

Integrate drawing ellipsis tool with mouse movements

const handleMouseDown = (index) => {
if (activeTool === "ellipse") {
setIsDrawing(true);
setStartIndex(index);
}
};

const handleMouseUp = (index) => {
if (activeTool === "ellipse" && isDrawing) {
drawEllipse(startIndex, index);
setIsDrawing(false);
setStartIndex(null);
}
};
```

## Step 2.2: Add Freehand Tool

The freehand tool draws a continuous line as the user drags the mouse.

### Freehand Tool for File: src/frontend/Grid.js

```javascript
const handleMouseMove = (index) => {
if (activeTool === "freehand" && isDrawing) {
setCellColors((prev) => ({ ...prev, [index]: activeColor }));
}
};

Attach the event handlers:

<div
  key={i}
  className="grid-cell"
  onMouseDown={() => handleMouseDown(i)}
  onMouseUp={() => handleMouseUp(i)}
  onMouseMove={() => handleMouseMove(i)}
></div>
```

## Step 3: Update Toolbar

Add buttons for the Ellipse Tool and Freehand Tool.

### src/frontend/Toolbar.js

```javascript
<button onClick={() => setActiveTool("ellipse")}>Ellipse</button>
<button onClick={() => setActiveTool("freehand")}>Freehand</button>
```

## Step 4: Test Features

1. Run the development server: npm start
1. Test Layer Grouping: • Create groups and assign layers to them. • Verify grouped layers are
   rendered and managed together.
1. Test Advanced Tools: • Use the Ellipse Tool to draw ellipses. • Use the Freehand Tool to draw
   continuous lines.
