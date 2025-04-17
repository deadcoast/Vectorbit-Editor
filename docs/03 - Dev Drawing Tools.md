# Feature 3: Basic Drawing Tools Placeholder

**NOTE:** ALL DOCUMENTATION IS SUBJECT TO CHANGE, EXAMPLES LISTED ARE NOT DIRECT AND OR LITTERAL TRANSLATIONS TO THE SOURCE CODE.

---

The goal for Feature 3 is to create a placeholder for the Pixel Brush, Eraser Tool, and Color Picker, integrating these features with the grid system and menus. This will provide a foundation for adding functionality later.

## Step 1: Update the Grid Component for Interactions

We need to allow the grid cells to respond to clicks and update their state (e.g., change color). For now, the placeholder logic will support the following:

1. Paint cells with a selected color.
1. Erase cells (reset them to default).
1. Use a color picker to choose a color.

### File: src/frontend/Grid.js

```javascript
import React, { useState } from "react";
import "./Grid.css";

const Grid = ({ gridSize, gridVisible, activeTool, activeColor }) => {
const [cellColors, setCellColors] = useState({}); // Track colors for each cell

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
\<div
key={i}
className="grid-cell"
style={cellStyle}
onClick={() => handleCellClick(i)}
\></div>
);
}
return cells;
};

return (
\<div
className="grid"
style={{
gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
gridTemplateRows: `repeat(${gridSize}, 1fr)`,
display: gridVisible ? "grid" : "none",
}}
\>
{createGrid()}
    </div>
);
};

export default Grid;
```

## Step 2: Add Drawing Tool Selector

Integrate a toolbar that allows the user to select the active tool and choose a color. This will update the App state accordingly.

### File: src/frontend/Toolbar.js

```javascript
import React from "react";
import "./Toolbar.css";

const Toolbar = ({ setActiveTool, setActiveColor }) => {
  return (
    <div className="toolbar">
      \<button onClick={() => setActiveTool("brush")}>Brush</button>\
      <button onClick={() => setActiveTool("eraser")}>Eraser</button>
      \
      <input
        type="color"
        onChange={(e) => setActiveColor(e.target.value)}
        title="Color Picker"
      />
    </div>
  );
};

export default Toolbar;
```

## Step 3: Integrate Tools into the App Component

Add state management in the App component for the active tool and active color. Pass these states as props to the Grid and Toolbar components.

### File: src/frontend/App.js

```javascript
import React, { useState } from "react";
import Grid from "./Grid";
import Menus from "./Menus";
import Toolbar from "./Toolbar";

const App = () => {
  const [gridVisible, setGridVisible] = useState(true);
  const [gridSize, setGridSize] = useState(16);
  const [activeTool, setActiveTool] = useState("brush"); // Default tool is brush
  const [activeColor, setActiveColor] = useState("#000000"); // Default color is black

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
      />
    </div>
  );
};

export default App;
```

## Step 4: CSS for the Toolbar

### File: src/frontend/Toolbar.css

```css
.toolbar {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.toolbar button {
  padding: 5px 10px;
  background-color: #333;
  color: white;
  border: none;
  cursor: pointer;
}

.toolbar button:hover {
  background-color: #555;
}

.toolbar input[type="color"] {
  width: 40px;
  height: 40px;
  border: none;
  cursor: pointer;
}
```

## Testing Feature 3

1. Start the development server:
   npm start
1. Verify the following:
   • Clicking Brush allows cells to be painted with the selected color.
   • Clicking Eraser resets the cells to the default color.
   • Changing the color in the color picker updates the brush color.
   • The grid still resizes and toggles visibility through the menus.
