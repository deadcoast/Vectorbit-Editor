# Enhancing the Freehand Tool with Smoothing Algorithms and Adding Layer Manipulation Features

**NOTE:** ALL DOCUMENTATION IS SUBJECT TO CHANGE, EXAMPLES LISTED ARE NOT DIRECT AND OR LITTERAL TRANSLATIONS TO THE SOURCE CODE.

---

We’ll refine the Freehand Tool to create smoother, more natural strokes and enhance layer manipulation features with drag-and-drop reordering and additional group management options.

1. Enhance the Freehand Tool with Smoothing Algorithms

To achieve smoother strokes, we’ll implement a Bezier curve-based smoothing algorithm.

## Step 1.1: Track Freehand Points

Modify the handleMouseMove function to record the points as the user drags.

### File: src/frontend/Grid.js

```javascript
const [freehandPoints, setFreehandPoints] = useState([]);

const handleMouseDown = (index) => {
  if (activeTool === "freehand") {
    setIsDrawing(true);
    setFreehandPoints([index]); // Start tracking points
  }
};

const handleMouseMove = (index) => {
  if (activeTool === "freehand" && isDrawing) {
    setFreehandPoints((prev) => [...prev, index]); // Add points to the path
  }
};

const handleMouseUp = () => {
  if (activeTool === "freehand" && isDrawing) {
    smoothFreehand(freehandPoints); // Smooth the stroke
    setIsDrawing(false);
    setFreehandPoints([]);
  }
};
```

## Step 1.2: Implement Smoothing with Bezier Curves

Smooth the points using a Bezier curve algorithm.

### Smooth Points for File: src/frontend/Grid.js

```javascript
const smoothFreehand = (points) => {
  const updatedColors = { ...cellColors };

  for (let i = 0; i < points.length - 1; i++) {
    const startX = points[i] % gridSize;
    const startY = Math.floor(points[i] / gridSize);
    const endX = points[i + 1] % gridSize;
    const endY = Math.floor(points[i + 1] / gridSize);

    // Calculate Bezier points
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    const controlX = (startX + midX) / 2;
    const controlY = (startY + midY) / 2;

    // Draw the curve
    for (let t = 0; t <= 1; t += 0.05) {
      const x = Math.round(
        (1 - t) ** 2 * startX + 2 * (1 - t) * t * controlX + t ** 2 * endX
      );
      const y = Math.round(
        (1 - t) ** 2 * startY + 2 * (1 - t) * t * controlY + t ** 2 * endY
      );
      const index = y * gridSize + x;
      updatedColors[index] = activeColor;
    }
  }

  setCellColors(updatedColors);
};
```

## Step 2.1: Add Drag-and-Drop for Reordering

Implement drag-and-drop functionality for reordering layers.

### Reorder for File: src/frontend/App.js

```javascript
import { useDrag, useDrop } from "react-dnd";

const reorderLayer = (dragIndex, hoverIndex) => {
  const updatedLayers = [...layers];
  const [draggedLayer] = updatedLayers.splice(dragIndex, 1);
  updatedLayers.splice(hoverIndex, 0, draggedLayer);
  setLayers(updatedLayers);
};

const LayerItem = ({ layer, index }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: "layer",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
    accept: "layer",
    hover: (item) => {
      if (item.index !== index) {
        reorderLayer(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => dragRef(dropRef(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      {layer.name}
    </div>
  );
};

Render the layers in a draggable list

<div className="layer-list">
  {layers.map((layer, index) => (
    <LayerItem key={layer.id} layer={layer} index={index} />
  ))}
</div>
```

## Step 2.2: Add Group Management Options

Allow users to rename and delete groups.

### Rename/Remove for File: src/frontend/App.js

```javascript
const renameGroup = (groupId, newName) => {
  const updatedGroups = groups.map((group) =>
    group.id === groupId ? { ...group, name: newName } : group
  );
  setGroups(updatedGroups);
};

const deleteGroup = (groupId) => {
  const updatedGroups = groups.filter((group) => group.id !== groupId);
  const updatedLayers = layers.map((layer) =>
    layer.group === groupId ? { ...layer, group: null } : layer
  );
  setGroups(updatedGroups);
  setLayers(updatedLayers);
};

<div className="group-controls">
  {groups.map((group) => (
    <div key={group.id}>
      <span>{group.name}</span>
      <button onClick={() => renameGroup(group.id, prompt("New Group Name:"))}>
        Rename
      </button>
      <button onClick={() => deleteGroup(group.id)}>Delete</button>
    </div>
  ))}
</div>;
```

## Step 3: Style Updates for Layer Manipulation

### Layer List for File: src/frontend/App.css

```css
.layer-list {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.layer-list div {
  padding: 5px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  cursor: move;
}

.layer-list div:hover {
  background-color: #eee;
}
```

## Testing the Features

1. Run the development server:
   npm start
1. Test Freehand Tool:
   • Verify the smoothness of strokes when using the freehand tool.
1. Test Layer Reordering:
   • Drag and drop layers to reorder them in the stack.
1. Test Group Management:
   • Create, rename, and delete groups. Verify layers are updated accordingly.

## Undo/Redo Support for Groups and Layer Reordering + Enhancing Export Functionality for Groups

We will:

1. Add undo/redo functionality for group operations and layer reordering.
1. Enhance export functionality to respect group-level transformations, such as opacity and visibility.

## Undo/Redo Support for Groups and Layer Reordering

We’ll expand the existing undo/redo system to include group and layer reordering changes.

## Step 1.1: Extend History Management

Modify the updateHistory function to handle both group and layer changes.

### History for File: src/frontend/App.js

```javascript
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const updateHistory = (newState) => {
  const newHistory = [...history.slice(0, historyIndex + 1), newState];
  setHistory(newHistory);
  setHistoryIndex(newHistory.length - 1);
};

// Save the current state of layers and groups
const saveState = () => {
  updateHistory({ layers, groups });
};

// Undo and redo functions
const undo = () => {
  if (historyIndex > 0) {
    const { layers: prevLayers, groups: prevGroups } =
      history[historyIndex - 1];
    setLayers(prevLayers);
    setGroups(prevGroups);
    setHistoryIndex(historyIndex - 1);
  }
};

const redo = () => {
  if (historyIndex < history.length - 1) {
    const { layers: nextLayers, groups: nextGroups } =
      history[historyIndex + 1];
    setLayers(nextLayers);
    setGroups(nextGroups);
    setHistoryIndex(historyIndex + 1);
  }
};
```

## Step 1.2: Hook History into Layer and Group Actions

Call saveState whenever layers or groups are modified.

### History Management for File: src/frontend/App.js (Updated Snippets)

Add Layer:

```javascript
const addLayer = () => {
  const newLayer = {
    id: layers.length + 1,
    name: `Layer ${layers.length + 1}`,
    cellColors: {},
    opacity: 1,
    visible: true,
    group: null,
  };
  setLayers([...layers, newLayer]);
  saveState(); // Save state
};

// Reorder Layer:

const reorderLayer = (dragIndex, hoverIndex) => {
  const updatedLayers = [...layers];
  const [draggedLayer] = updatedLayers.splice(dragIndex, 1);
  updatedLayers.splice(hoverIndex, 0, draggedLayer);
  setLayers(updatedLayers);
  saveState(); // Save state
};

// Add Group:

const addGroup = () => {
  const newGroup = {
    id: groups.length + 1,
    name: `Group ${groups.length + 1}`,
    layers: [],
  };
  setGroups([...groups, newGroup]);
  saveState(); // Save state
};
```

## Step 1.3: Add Undo/Redo Buttons

Add buttons to trigger undo and redo operations.

### Undo/Redo Buttons for File: src/frontend/App.js

```javascript
<div className="history-controls">
  <button onClick={undo} disabled={historyIndex <= 0}>
    Undo
  </button>
  <button onClick={redo} disabled={historyIndex >= history.length - 1}>
    Redo
  </button>
</div>
```

## Step 2: Enhancing Export Functionality for Groups

## Step 2.1: Render Groups Respecting Opacity and Visibility

Update the rendering logic in Grid.js to account for group-level transformations.

### Render Group in File: src/frontend/Grid.js

```javascript
const renderGroup = (ctx, group, scale = 1) => {
  const groupLayers = layers.filter((layer) => group.layers.includes(layer.id));
  ctx.globalAlpha = Math.min(...groupLayers.map((layer) => layer.opacity)); // Use the lowest opacity
  groupLayers.forEach((layer) => {
    if (layer.visible) {
      renderLayer(ctx, layer, scale);
    }
  });
};

const renderToCanvas = (scale = 1) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  const resolution = 500 * scale;

  canvas.width = resolution;
  canvas.height = resolution;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  groups.forEach((group) => renderGroup(ctx, group, scale));
  layers
    .filter((layer) => !layer.group)
    .forEach((layer) => renderLayer(ctx, layer, scale));
};
```

## Step 2.2: Add Export Options for Groups

Enable exporting groups as separate files or combined into one file.

### Export Groups in File: src/frontend/Grid.js

```javascript
const exportGroupsToSVG = () => {
  groups.forEach((group) => {
    renderToCanvas(1); // Render the group
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/svg+xml");
    link.download = `${group.name}.svg`;
    link.click();
  });
};

const exportAllGroupsToSVG = () => {
  renderToCanvas(1); // Render all groups together
  const canvas = canvasRef.current;
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/svg+xml");
  link.download = `all-groups.svg`;
  link.click();
};
```

### Add buttons for these export options

```html
<div className="grid-controls">
  <button onClick="{exportGroupsToSVG}">Export Each Group</button>
  <button onClick="{exportAllGroupsToSVG}">Export All Groups</button>
</div>
```

## 3. Style Updates for History and Export Controls

### File: src/frontend/App.css

```css
.history-controls {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.history-controls button {
  padding: 5px 10px;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
}

.history-controls button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.grid-controls {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
```

## Step 7: Testing the Features

1. Run the development server:
   npm start
1. Test Undo/Redo:
   • Perform actions like adding layers/groups or reordering layers.
   • Undo/redo changes and verify the state updates correctly.
1. Test Group Export:
   • Export each group as separate .svg files.
   • Export all groups combined into a single .svg file.

## Advanced Transformation Tools for Groups: Scaling and Rotation

We will implement tools to allow scaling and rotation of groups. These transformations will affect all layers within a group, and the changes will be reflected during rendering and export.

## Step 1: Update Group Data Structure

Enhance the group structure to include transformation properties for scaling and rotation.

### Update Group Data Structure in File: src/frontend/App.js

````javascript
const App = () => {
  const [groups, setGroups] = useState([
    { id: 1, name: "Group 1", layers: [], scale: 1, rotation: 0 },
  ]);

  const updateGroupTransform = (groupId, transform) => {
    const updatedGroups = groups.map((group) =>
      group.id === groupId ? { ...group, ...transform } : group
    );
    setGroups(updatedGroups);
  };

  return (
    <div>
      <h1>Vectorbit</h1>
      <div className="group-controls">
        {groups.map((group) => (
          <div key={group.id}>
            <span>{group.name}</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={group.scale}
              onChange={(e) =>
                updateGroupTransform(group.id, { scale: parseFloat(e.target.value) })
              }
            />
            <span>Scale: {group.scale.toFixed(1)}x</span>
            <input
              type="range"
              min="-180"
              max="180"
              step="10"
              value={group.rotation}
              onChange={(e) =>
                updateGroupTransform(group.id, { rotation: parseInt(e.target.value) })
              }
            />
            <span>Rotation: {group.rotation}°</span>
          </div>
        ))}
      </div>
    </div>
  );
};

## Step 2: Apply Transformations During Rendering

Update the rendering logic to apply transformations for each group.

### File: src/frontend/Grid.js

```javascript
const renderGroup = (ctx, group, scale = 1) => {
  const groupLayers = layers.filter((layer) => group.layers.includes(layer.id));

  // Save the canvas state
  ctx.save();

  // Apply group transformations
  const centerX = ctx.canvas.width / 2;
  const centerY = ctx.canvas.height / 2;

  ctx.translate(centerX, centerY);
  ctx.scale(group.scale, group.scale);
  ctx.rotate((group.rotation * Math.PI) / 180);
  ctx.translate(-centerX, -centerY);

  groupLayers.forEach((layer) => {
    if (layer.visible) {
      renderLayer(ctx, layer, scale);
    }
  });

  // Restore the canvas state
  ctx.restore();
};

const renderToCanvas = (scale = 1) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  const resolution = 500 * scale;

  canvas.width = resolution;
  canvas.height = resolution;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  groups.forEach((group) => renderGroup(ctx, group, scale));
  layers.filter((layer) => !layer.group).forEach((layer) => renderLayer(ctx, layer, scale));
};

## Step 3: Export Groups with Transformations

Ensure transformations are respected during export.

### File: src/frontend/Grid.js

```javascript
const exportTransformedGroupsToSVG = () => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  groups.forEach((group) => {
    renderGroup(ctx, group, 1); // Render the group with transformations
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/svg+xml");
    link.download = `${group.name}-transformed.svg`;
    link.click();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for next group
  });
};

<div className="grid-controls">
  <button onClick={exportTransformedGroupsToSVG}>Export Groups with Transformations</button>
</div>;
````

## Step 4: Style Updates for Transformation Controls

Add styling for the new transformation controls.

### Styling for Transformation Controls in File: src/frontend/App.css

```css
.group-controls {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-controls input[type="range"] {
  margin-left: 10px;
  width: 100px;
}

.group-controls span {
  margin-left: 10px;
  font-size: 14px;
}
```

## Step 5: Testing the Features

1. Run the development server:
   npm start
1. Test Group Transformations:
   • Adjust the scale and rotation for each group.
   • Verify the transformations are applied correctly during rendering.
1. Test Group Export:
   • Export groups as .svg files with transformations applied.
   • Verify each file respects the group’s scale and rotation.

## Step 6: Adding Drag-and-Drop Positioning for Groups

We will implement a drag-and-drop positioning tool to allow users to move entire groups around the grid.

## Step 1: Add Positioning to the Group Data Structure

Enhance the group structure to include positionX and positionY.

### Add Positioning to Group Data Structure in File: src/frontend/App.js

```javascript
const App = () => {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Group 1",
      layers: [],
      scale: 1,
      rotation: 0,
      positionX: 0,
      positionY: 0,
    },
  ]);

  const updateGroupPosition = (groupId, position) => {
    const updatedGroups = groups.map((group) =>
      group.id === groupId ? { ...group, ...position } : group
    );
    setGroups(updatedGroups);
  };

  return (
    <div>
      <h1>Vectorbit</h1>
      <div className="group-controls">
        {groups.map((group) => (
          <div key={group.id}>
            <span>{group.name}</span>
            <span>
              Position: ({group.positionX}, {group.positionY})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Step 2: Implement Dragging for Groups

Use mouse events to allow users to drag groups on the grid.

### Handle Dragging in File: src/frontend/Grid.js

```javascript
const handleDragStart = (groupId, startX, startY) => {
  setDraggingGroup({
    groupId,
    startX,
    startY,
  });
};

const handleDrag = (event) => {
  if (draggingGroup) {
    const { groupId, startX, startY } = draggingGroup;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    updateGroupPosition(groupId, { positionX: deltaX, positionY: deltaY });
  }
};

const handleDragEnd = () => {
  setDraggingGroup(null); // Stop dragging
};
```

Attach these handlers to the grid and group rendering:

````javascript
<div
  onMouseDown={(event) => handleDragStart(group.id, event.clientX, event.clientY)}
  onMouseMove={handleDrag}
  onMouseUp={handleDragEnd}
  style={{
    position: "absolute",
    top: `${group.positionY}px`,
    left: `${group.positionX}px`,
    transform: `scale(${group.scale}) rotate(${group.rotation}deg)`,
  }}
>
  {renderGroup(ctx, group, 1)}
</div>

## Step 3: Update Render Logic to Respect Positioning

Apply the positionX and positionY properties during rendering.

### Render Group in File: src/frontend/Grid.js

```javascript
const renderGroup = (ctx, group, scale = 1) => {
  const groupLayers = layers.filter((layer) => group.layers.includes(layer.id));

  ctx.save();

  // Apply group transformations
  const centerX = ctx.canvas.width / 2 + group.positionX;
  const centerY = ctx.canvas.height / 2 + group.positionY;

  ctx.translate(centerX, centerY);
  ctx.scale(group.scale, group.scale);
  ctx.rotate((group.rotation * Math.PI) / 180);
  ctx.translate(-centerX, -centerY);

  groupLayers.forEach((layer) => {
    if (layer.visible) {
      renderLayer(ctx, layer, scale);
    }
  });

  ctx.restore();
};

## Step 4: Add Styling for Group Controls

### Styling for Group Controls in File: src/frontend/App.css

```css
.group-controls {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-controls span {
  margin-left: 10px;
  font-size: 14px;
}

.grid-group {
  position: absolute;
  cursor: grab;
}

.grid-group:active {
  cursor: grabbing;
}
````

## Step 5: Testing Drag-and-Drop for Groups

1. Run the development server:
   npm start
1. Test Dragging:
   • Drag groups around the grid and verify their position updates correctly.
1. Test Combined Transformations:
   • Verify that scaling and rotation still apply correctly after repositioning a group.

## Step 6: Testing Drag-and-Drop for Groups

1. Run the development server:
   npm start
1. Test Dragging:
   • Drag groups around the grid and verify their position updates correctly.
1. Test Combined Transformations:
   • Verify that scaling and rotation still apply correctly after repositioning a group.

## Step 7: Enhance Group Positioning with Snapping to Grid

We’ll improve group positioning by adding a snapping feature that ensures groups align with the grid when moved.

### Add Grid Snapping Logic

Implement a function to calculate the nearest snapped position based on the grid size.

### Calculate nearest grid position for File: src/frontend/Grid.js

````javascript
const snapToGrid = (value, gridSize, canvasSize) => {
  const cellSize = canvasSize / gridSize;
  return Math.round(value / cellSize) * cellSize;
};

const handleDragEnd = () => {
  if (draggingGroup) {
    const { groupId, startX, startY } = draggingGroup;

    // Snap to grid
    const snappedX = snapToGrid(
      groups.find((group) => group.id === groupId).positionX,
      gridSize,
      canvasRef.current.width
    );

    const snappedY = snapToGrid(
      groups.find((group) => group.id === groupId).positionY,
      gridSize,
      canvasRef.current.height
    );

    updateGroupPosition(groupId, { positionX: snappedX, positionY: snappedY });
    setDraggingGroup(null); // Stop dragging
  }
};

## Step 2: Update Rendering Logic for Snapping

Ensure snapped positions are respected during rendering.

### File: src/frontend/Grid.js

```javascript
const renderGroup = (ctx, group, scale = 1) => {
  const groupLayers = layers.filter((layer) => group.layers.includes(layer.id));

  ctx.save();

  // Apply snapped position, scaling, and rotation
  const centerX = ctx.canvas.width / 2 + snapToGrid(group.positionX, gridSize, ctx.canvas.width);
  const centerY = ctx.canvas.height / 2 + snapToGrid(group.positionY, gridSize, ctx.canvas.height);

  ctx.translate(centerX, centerY);
  ctx.scale(group.scale, group.scale);
  ctx.rotate((group.rotation * Math.PI) / 180);
  ctx.translate(-centerX, -centerY);

  groupLayers.forEach((layer) => {
    if (layer.visible) {
      renderLayer(ctx, layer, scale);
    }
  });

  ctx.restore();
};

## Step 3: Visual Feedback for Snapping

Add visual feedback to indicate where the group will snap.

### File: src/frontend/Grid.js

```javascript
const drawSnapPreview = (ctx, group) => {
  const cellSize = ctx.canvas.width / gridSize;

  const snappedX = snapToGrid(group.positionX, gridSize, ctx.canvas.width);
  const snappedY = snapToGrid(group.positionY, gridSize, ctx.canvas.height);

  ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
  ctx.lineWidth = 2;

  // Draw snapping preview
  ctx.strokeRect(snappedX - cellSize / 2, snappedY - cellSize / 2, cellSize, cellSize);
};

// Call during rendering to show snapping preview
groups.forEach((group) => {
  if (draggingGroup?.groupId === group.id) {
    drawSnapPreview(ctx, group);
  }
});

## Step 4: Style Updates for Snap Preview

Add styling for the snapping preview to make it visually distinct.

### File: src/frontend/App.css

```css
.snap-preview {
  border: 2px dashed rgba(0, 0, 255, 0.5);
}
````

## Step 5: Testing Snapping

1. Run the development server:
   npm start
1. Test Group Dragging:
   • Drag groups and verify they snap to the nearest grid cell when released.
1. Test Visual Feedback:
   • Ensure the snapping preview aligns with the nearest grid cell during dragging.
1. Test Combined Transformations:
   • Verify that snapping works correctly alongside scaling and rotation.

## Step 6: Testing Snapping

1. Run the development server:
   npm start
1. Test Group Dragging:
   • Drag groups and verify they snap to the nearest grid cell when released.
1. Test Visual Feedback:
   • Ensure the snapping preview aligns with the nearest grid cell during dragging.
1. Test Combined Transformations:
   • Verify that snapping works correctly alongside scaling and rotation.

## Step 7: Testing Snapping

1. Run the development server:
   npm start
1. Test Group Dragging:
   • Drag groups and verify they snap to the nearest grid cell when released.
1. Test Visual Feedback:
   • Ensure the snapping preview aligns with the nearest grid cell during dragging.
1. Test Combined Transformations:
   • Verify that snapping works correctly alongside scaling and rotation.
