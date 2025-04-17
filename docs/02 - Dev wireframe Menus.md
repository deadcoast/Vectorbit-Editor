# Step 1: Code for Placeholder Menus

**NOTE:** ALL DOCUMENTATION IS SUBJECT TO CHANGE, EXAMPLES LISTED ARE NOT DIRECT AND OR LITTERAL TRANSLATIONS TO THE SOURCE CODE.

---

## File: src/frontend/Menus.js

```javascript
import React from "react";
import "./Menus.css";

const Menus = () => {
  const handleMenuClick = (menu) => {
    console.log(`Menu option selected: ${menu}`);
  };

  return (
    <div className="menu-bar">
      <div className="menu">
        <span>File</span>
        <div className="dropdown">
          <button onClick={() => handleMenuClick("New")}>New</button>
          <button onClick={() => handleMenuClick("Open")}>Open</button>
          <button onClick={() => handleMenuClick("Save")}>Save</button>
          <button onClick={() => handleMenuClick("Export")}>Export</button>
        </div>
      </div>
      <div className="menu">
        <span>View</span>
        <div className="dropdown">
          <button onClick={() => handleMenuClick("Toggle Grid")}>
            Toggle Grid
          </button>
          <button onClick={() => handleMenuClick("Zoom In")}>Zoom In</button>
          <button onClick={() => handleMenuClick("Zoom Out")}>Zoom Out</button>
        </div>
      </div>
      <div className="menu">
        <span>Settings</span>
        <div className="dropdown">
          <button onClick={() => handleMenuClick("Grid Size")}>
            Grid Size
          </button>
          <button onClick={() => handleMenuClick("Default Settings")}>
            Default Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menus;
```

## Step 2: CSS for Menus

### File: src/frontend/Menus.css

````css
.menu-bar {
  display: flex;
  justify-content: space-around;
  background-color: #333;
  color: white;
  padding: 10px;
}

.menu {
  position: relative;
  cursor: pointer;
}

.menu span {
  font-weight: bold;
}

.dropdown {
  display: none;
  position: absolute;
  background-color: white;
  color: black;
  border: 1px solid #ccc;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 10px;
  margin-top: 5px;
  flex-direction: column;
}

.menu:hover .dropdown {
  display: flex;
}

.dropdown button {
  background: none;
  border: none;
  text-align: left;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

.dropdown button:hover {
  background-color: #f0f0f0;
}

## Step 3: Integrate Menus into the Application

### File: src/frontend/App.js

import React from "react";
import Grid from "./Grid";
import Menus from "./Menus";

const App = () => {
  return (
    <div>
      <h1>Vectorbit</h1>
      <Menus />
      <Grid />
    </div>
  );
};

export default App;

## Step 4: Testing

1. Start the development server:
bash
npm start

2. Verify the following:

• Hovering over the menu items shows dropdowns for File, View, and Settings.

• Clicking any menu item logs the selected option to the console.

---
---

## Enhancing Menus: Connecting Interactions

1. Connect “Toggle Grid” in the View Menu to control the grid’s visibility.

2. Add functionality for File Menu (New, Save, Export) placeholders to log realistic actions.

3. Prepare a structure for Settings Menu interactions.

## Step 1: Add Props to Connect Menus with Other Components

Update the Menus component to accept props for controlling grid visibility and other actions.

### File: src/frontend/Menus.js

```javascript
import React from "react";
import "./Menus.css";

const Menus = ({ toggleGrid, setGridSize }) => {
  const handleMenuClick = (menu) => {
    console.log(`Menu option selected: ${menu}`);
  };

  return (
    <div className="menu-bar">
      <div className="menu">
        <span>File</span>
        <div className="dropdown">
          <button onClick={() => handleMenuClick("New")}>New</button>
          <button onClick={() => handleMenuClick("Open")}>Open</button>
          <button onClick={() => handleMenuClick("Save")}>Save</button>
          <button onClick={() => handleMenuClick("Export")}>Export</button>
        </div>
      </div>
      <div className="menu">
        <span>View</span>
        <div className="dropdown">
          <button onClick={toggleGrid}>Toggle Grid</button>
          <button onClick={() => handleMenuClick("Zoom In")}>Zoom In</button>
          <button onClick={() => handleMenuClick("Zoom Out")}>Zoom Out</button>
        </div>
      </div>
      <div className="menu">
        <span>Settings</span>
        <div className="dropdown">
          <button onClick={() => setGridSize(16)}>Set Grid Size: 16x16</button>
          <button onClick={() => setGridSize(32)}>Set Grid Size: 32x32</button>
          <button onClick={() => handleMenuClick("Default Settings")}>
            Default Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menus;

### Step 2: Update the App Component to Handle Interactions

Add state and functions in the App component to manage grid visibility and grid size.

### File: src/frontend/App.js

import React, { useState } from "react";
import Grid from "./Grid";
import Menus from "./Menus";

const App = () => {
  const [gridVisible, setGridVisible] = useState(true);
  const [gridSize, setGridSize] = useState(16);

  const toggleGrid = () => {
    setGridVisible(!gridVisible);
  };

  return (
    <div>
      <h1>Vectorbit</h1>
      <Menus toggleGrid={toggleGrid} setGridSize={setGridSize} />
      <Grid gridSize={gridSize} gridVisible={gridVisible} />
    </div>
  );
};

export default App;

### Step 3: Update the Grid Component

Modify the Grid component to accept props for grid size and visibility.

### File: src/frontend/Grid.js

import React from "react";
import "./Grid.css";

const Grid = ({ gridSize, gridVisible }) => {
  const createGrid = () => {
    const cells = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      cells.push(<div key={i} className="grid-cell"></div>);
    }
    return cells;
  };

  return (
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
  );
};

export default Grid;

### Step 4: Test the Enhanced Menus

1. Functionality to Verify:

• Clicking “Toggle Grid” in the View Menu should show/hide the grid.

• Clicking “Set Grid Size: 16x16” or “Set Grid Size: 32x32” in the Settings Menu should change the grid size.

2. Run the Development Server:
bash
npm start

3. Confirm:

• Grid toggling works as expected.

• Grid resizing through menu options updates the grid dynamically.

### Step 5: Placeholder Actions for File Menu

Enhance the File Menu to log realistic placeholders for now:

### File: src/frontend/Menus.js (Updated Snippet)

```javascript
<div className="menu">
  <span>File</span>
  <div className="dropdown">
    <button onClick={() => console.log("Creating a new project...")}>New</button>
    <button onClick={() => console.log("Opening a project...")}>Open</button>
    <button onClick={() => console.log("Saving the project...")}>Save</button>
    <button onClick={() => console.log("Exporting the project...")}>Export</button>
  </div>
</div>
````

## Checklist Progress

• Connect “Toggle Grid” to the grid system.
• Connect grid size changes to the Settings Menu.
• Add realistic logging for File Menu actions.
