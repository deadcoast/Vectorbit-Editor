# Feature 1: Dynamic Grid System

Requirements:
• A grid that resizes based on the selected bit size (e.g., 8bit to 1024bit).
• Grid visualization toggling (show/hide grid).

## Step 1: Front-End Grid System Code

### Implementation using React

#### File: src/frontend/Grid.js

````javascript
import React, { useState } from "react";
import "./Grid.css";

const Grid = () => {
const [gridSize, setGridSize] = useState(16); // Default grid size is 16x16
const [showGrid, setShowGrid] = useState(true); // Grid visibility toggle

const handleGridSizeChange = (e) => {
setGridSize(parseInt(e.target.value));
};

const toggleGridVisibility = () => {
setShowGrid(!showGrid);
};

const createGrid = () => {
const cells = [];
for (let i = 0; i < gridSize * gridSize; i++) {
cells.push(<div key={i} className="grid-cell"></div>);
}
return cells;
};

return (
    <div className="grid-container">
    <div className="controls">
<label>
Grid Size:
<select onChange={handleGridSizeChange} value={gridSize}>
    <option value="8">8x8</option>
    <option value="16">16x16</option>
    <option value="32">32x32</option>
    <option value="64">64x64</option>
    <option value="128">128x128</option>
    <option value="256">256x256</option>
    <option value="512">512x512</option>
    <option value="1024">1024x1024</option>
</select>
</label>
<button onClick={toggleGridVisibility}>
{showGrid ? "Hide Grid" : "Show Grid"}
</button>
    </div>
\<div
className="grid"
style={{
gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
gridTemplateRows: `repeat(${gridSize}, 1fr)`,
display: showGrid ? "grid" : "none",
}}
\>
{createGrid()}
    </div>
    </div>
);
};

export default Grid;

### Step 2: CSS Styling for the Grid

#### File: src/frontend/Grid.css

```css
.grid-container {
display: flex;
flex-direction: column;
align-items: center;
}

.controls {
margin-bottom: 20px;
}

.grid {
width: 500px;
height: 500px;
border: 1px solid #ccc;
display: grid;
}

.grid-cell {
border: 1px solid #eee;
background-color: #f9f9f9;
transition: background-color 0.2s;
}

.grid-cell:hover {
background-color: #ddd;
}
````

### Step 3: Integrate the Grid Component

#### File: src/frontend/App.js

```javascript
import React from "react";
import Grid from "./Grid";

const App = () => {
  return (
    <div>
      <h1>Vectorbit - Dynamic Grid System</h1>
      <Grid />
    </div>
  );
};

export default App;
```

## Testing

1. Start the development server:
   bash
   npm start
1. Verify the following functionalities:
   • The grid dynamically resizes when a new size is selected.
   • The grid visibility can be toggled on and off.
