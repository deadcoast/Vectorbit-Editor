# Vectorbit

Please sync these files as a project map and explanation. I need a succinct plan that incorporates
my repository structure, the descriptions of all the features I have, and a clear description of all
the projects features. See files below and create one new one.

Vectorbit is a pixelart illustrating software that allows you to customize the bit ratio in a grid
format. Utilizing a grid format, and pixel art, the files should be created as vector files for
optimizing resizing mid project. The reason for this; if I start a project in 8 bit, but want more
detail, I should be able to resize to a larger bit grid ratio without losing quality of the pixel
art.

- standard bit grid size [sbgs] are; 8bit, 16bit, 32bit, 64bit, 128bit, 256bit, 512bit, 1024bit.

## User Interface

- standard menu bar with features
- Pop up color wheel with color picker and color selector(eye dropper tool).
- color pallet menu (store and create color palettes in HEX)

## Features

- resizing of pixel art without quality loss.
- Vector format.
- Adjustable pixel grid based on the [sbgs]
- Color picker
- Standard pixel art brush set.

## File type

- default is a vector file for resizing purposes under the [sbgs]
- Export as; jpg, png

```text
├── .IGNORE/
│   └── 99 vectorbit old/
│       └── Debugged 1/
├── .qodo/
│   └── history.sqlite
├── docs/
│   ├── ARCHITECTURE-2.0/
│   │   ├── ANALYSIS-DOCUMENTATION.md
│   │   ├── ANALYSIS-FORMAT.md
│   │   ├── OVERVIEW-TASKLIST.md
│   │   └── OVERVIEW.md
│   ├── 01 - Dev wireframe Grid System.md
│   ├── 02 - Dev wireframe Menus.md
│   ├── 03 - Dev Drawing Tools.md
│   ├── 04 - Dev Export Options.md
│   ├── 05 - Dev enhanced tools.md
│   ├── 05 - Dev groups and layering.md
│   ├── 06 - Dev finalizing front end.md
│   ├── 07 - Dev Palette Library.md
│   ├── 08 - pixel brush.md
│   ├── 09 - Dev enhancements.md
│   └── 10 - Color Anchors.md
├── public/
│   ├── favicon.ico
│   ├── index.html
│   └── Index.js
├── server/
│   ├── models/
│   │   ├── index.js
│   │   └── models.js
│   ├── utils/
│   │   └── database.js
│   └── server.js
├── src/
│   ├── components/
│   │   ├── brush_system/
│   │   │   ├── BrushControls.css
│   │   │   └── BrushManager.js
│   │   ├── collaboration/
│   │   │   ├── Collaboration.css
│   │   │   ├── Collaboration.test.js
│   │   │   ├── CollaborationManager.js
│   │   │   └── index.js
│   │   ├── color_picker/
│   │   │   ├── ColorAnchors.css
│   │   │   ├── ColorAnchors.js
│   │   │   ├── ColorContext.js
│   │   │   ├── colorHarmony.js.md
│   │   │   ├── ColorManager.css
│   │   │   ├── ColorManager.js
│   │   │   ├── ColorPicker.css
│   │   │   ├── ColorPicker.js
│   │   │   ├── ColorPicker.test.js
│   │   │   ├── colortheory.js.md
│   │   │   ├── ColorWheel.css
│   │   │   ├── ColorWheel.js
│   │   │   ├── ColorWheel.test.js
│   │   │   ├── eyeDropper.test.js
│   │   │   └── index.js
│   │   ├── grid/
│   │   │   ├── DrawingTools.js
│   │   │   ├── Grid.css
│   │   │   ├── Grid.js
│   │   │   ├── Grid.test.js
│   │   │   ├── GridManager.js
│   │   │   ├── GridManager.test.js
│   │   │   └── index.js
│   │   ├── layer_manager/
│   │   │   ├── LayerManager.css
│   │   │   ├── LayerManager.js
│   │   │   └── LayerManager.test.js
│   │   ├── palette_library/
│   │   │   ├── index.js
│   │   │   ├── PaletteLibrary.css
│   │   │   ├── PaletteLibrary.css.md
│   │   │   ├── PaletteLibrary.js.md
│   │   │   ├── PalleteLibrary.js
│   │   │   ├── PalleteLibrary.test.js
│   │   │   └── PalleteManager.js
│   │   ├── Toolbar/
│   │   │   ├── BrushTool.js
│   │   │   ├── Controls.css
│   │   │   ├── Controls.js
│   │   │   ├── Controls.test.js
│   │   │   ├── index.js
│   │   │   ├── toolbar.css
│   │   │   ├── toolbar.js
│   │   │   └── toolbar.test.js
│   │   └── Index.js
│   ├── state/
│   │   ├── presets.js
│   │   └── useAnchorHistory.js
│   ├── styles/
│   │   ├── global.css
│   │   ├── index.js
│   │   ├── mixins.css
│   │   ├── styles.css
│   │   └── variables.css
│   ├── utils/
│   │   ├── api/
│   │   │   ├── api.test.js
│   │   │   ├── APIManager.js
│   │   │   └── exportManager.js
│   │   ├── color/
│   │   │   ├── meta_modulated/
│   │   │   │   ├── colorHarmony.js
│   │   │   │   ├── colorTheory.js
│   │   │   │   └── colorUtils.js
│   │   │   ├── colorCore.js
│   │   │   └── randomPallete.js
│   │   ├── grid/
│   │   │   ├── gridUtils.js
│   │   │   ├── gridUtils.json
│   │   │   ├── gridUtils.test.js
│   │   │   └── index.js
│   │   ├── patterns/
│   │   │   └── ProceduralGenerator.js
│   │   ├── brishUtils.js
│   │   ├── fileHandlers.js
│   │   └── index.js
│   ├── App.css
│   ├── App.js
│   ├── App.js.md
│   ├── index.js
│   └── setup.tests.js
├── tests/
│   ├── e2e/
│   │   ├── grid.test.js
│   │   ├── palleteLibrary.test.js
│   │   └── toolbar.test.js
│   ├── integration/
│   └── Index.js
├── .windsurfrules
├── jest-resolver.js
├── jest-svg-transform.js
├── package.json
├── README.md
├── setup.sh
├── setupTests.js
├── TODO.md
└── TREE.py
```

Key Features of the Structure:

### 1. Modularity

• Each component has its own folder with JavaScript, CSS, and test files (Toolbar, Grid, etc.).

• Utilities are grouped by functionality (e.g., color/, grid/).

### 2. Shared Utilities

• Reusable logic is kept under utils/ with subfolders for color, grid, and API utilities.

### 3. Backend Integration

• Backend APIs and models are structured under server/.

### 4. Testing

• Clear separation of end-to-end (e2e/) and integration tests (integration/).

### 5. Global Styles

• Shared styles like variables and global CSS are under styles/.

### 6. Color Anchor

UNIQUE CUSTOM CODED DYNAMIC COLOR REPLACEMENT:

**NOTE:** _BELOW IS JUST AN EXAMPLE OF THE FUNCTION FOR YOUR UNDERSTANDING, THE CURRENT CODE IS MUCH
MORE DEVELOPED AT THIS TIME._

Implementing “Color Anchors” for Dynamic Color Replacement

The Color Anchors feature will allow users to define specific color roles (base, secondary, accent)
and dynamically update them across the grid. Here’s how to implement this feature in an integrated
manner with the brush and palette tools.

#### Step 1: Data Structure for Color Anchors

Define a structure to store the color anchors and track their usage.

File: src/state/colorAnchors.js

```javascript
const defaultAnchors = {
baseColor: "#ffffff",
baseColor2: "#ffffff",
secondaryColor: "#cccccc",
secondaryColor2: "#cccccc",
accentColor: "#ff0000",
accentColor2: "#00ff00",
accentColor3: "#0000ff",
accentColor4: "#ffff00",
};

export const useColorAnchors = () => {
const [colorAnchors, setColorAnchors] = useState(defaultAnchors);
const updateColorAnchor = (anchor, newColor) => {
setColorAnchors((prev) => ({
...prev,
\[anchor\]: newColor,
}));
};
return { colorAnchors, updateColorAnchor };
};
```

#### Step 2: Integrate Color Anchors with the Grid

When a color anchor is updated, automatically replace all instances of that color on the grid.

File: src/frontend/Grid.js

```javascript
const applyColorAnchors = (updatedAnchor, newColor) => {
  const updatedColors = { ...cellColors };
  Object.keys(updatedColors).forEach(index => {
    if (updatedColors[index] === colorAnchors[updatedAnchor]) {
      updatedColors[index] = newColor;
    }
  });
  setCellColors(updatedColors);
};

// Call applyColorAnchors when an anchor color is changed:

updateColorAnchor(anchor, newColor);
applyColorAnchors(anchor, newColor);
```

#### Step 3: Color Anchors Pop-Up Window

Create a UI for managing and updating the color anchors.

File: src/frontend/ColorAnchors.js

```javascript
import { useColorAnchors } from '../state/colorAnchors';

const ColorAnchors = ({ onClose }) => {
  const { colorAnchors, updateColorAnchor } = useColorAnchors();

  const handleColorChange = (anchor, newColor) => {
    updateColorAnchor(anchor, newColor);
  };

  return (
    <div className="color-anchors-popup">
      <h3>Color Anchors</h3>
      {Object.keys(colorAnchors).map(anchor => (
        <div key={anchor} className="color-anchor">
          <label>{anchor.replace(/([A-Z])/g, ' $1')}</label>
          \
          <input
            type="color"
            value={colorAnchors[anchor]}
            onChange={e => handleColorChange(anchor, e.target.value)}
          />
        </div>
      ))}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ColorAnchors;
```

#### Step 4: Integrate Pop-Up with Toolbar

Add a button in the toolbar to open the Color Anchors pop-up.

File: src/frontend/Toolbar.js

```javascript
const [isAnchorsPopupOpen, setAnchorsPopupOpen] = useState(false);

return (
\<>
\<button onClick={() => setAnchorsPopupOpen(true)}>Color Anchors</button>
{isAnchorsPopupOpen && (
\<ColorAnchors onClose={() => setAnchorsPopupOpen(false)} />
)}
\</>
);
```

#### Step 5: Brush Integration

When applying a brush stroke, allow users to select a color anchor instead of a static color.

File: src/frontend/BrushTool.js

```javascript
const applyBrushWithAnchor = (x, y, anchor) => {
const updatedColors = { ...cellColors };
const index = y * gridSize + x;

if (index >= 0 && index < gridSize * gridSize) {
updatedColors[index] = colorAnchors[anchor];
}

setCellColors(updatedColors);
};

Update the brush UI to allow selection of a color anchor:

\<select onChange={(e) => setActiveAnchor(e.target.value)}>
{Object.keys(colorAnchors).map((anchor) => (
    <option key={anchor} value={anchor}>
{anchor.replace(/([A-Z])/g, " $1")}
    </option>
))}
</select>
```

#### Step 6: Palette Library Integration

Enable users to assign colors from the palette library to color anchors.

File: src/frontend/PaletteLibrary.js

```javascript
const assignToAnchor = (color, anchor) => {
  updateColorAnchor(anchor, color);
};
```

Add an “Assign to Anchor” option in the palette UI:

```javascript
<div className="palette-color">
  <span style={{ backgroundColor: color }} />
  <select onChange={e => assignToAnchor(color, e.target.value)}>
    <option value="">Assign to Anchor</option>
    {Object.keys(colorAnchors).map(anchor => (
      <option key={anchor} value={anchor}>
        {anchor.replace(/([A-Z])/g, ' $1')}
      </option>
    ))}
  </select>
</div>
```

#### Step 7: Styling

File: src/frontend/ColorAnchors.css

```css
.color-anchors-popup {
  position: absolute;
  top: 50px;
  left: 50px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 20px;
  width: 300px;
  z-index: 10;
}

.color-anchor {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.color-anchor label {
  flex: 1;
}

.color-anchor input[type='color'] {
  width: 50px;
  height: 30px;
  border: none;
  cursor: pointer;
}
```

#### Step 8: Testing

1. Grid Updates: • Set a base color on the grid and replace it via the color anchor.
2. Brush Updates: • Use the brush tool with color anchors and verify dynamic updates.
3. Palette Integration: • Assign a palette color to an anchor and check grid synchronization.
4. UI Functionality: • Open the Color Anchors pop-up, update colors, and verify updates.

### Future Enhancements

1. Anchor History: Track changes to anchors for undo/redo support.
2. Multiple Anchors: Allow users to create custom anchors beyond the predefined list.
3. Anchor Groups: Assign multiple colors to a single anchor for gradient-like effects.

### We will expand the Color Anchors feature with

1. Anchor History: Tracking changes to anchors for undo/redo functionality.
2. Custom Anchors: Allowing users to create additional anchors beyond the predefined list.

#### Step 1: Anchor History

1.1 Data Structure for Anchor History

Maintain a history of anchor changes to support undo/redo.

File: src/state/anchorHistory.js

```javascript
// File: src/state/useAnchorHistory.js
export const useAnchorHistory = () => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = newAnchors => {
    const newHistory = [...history.slice(0, historyIndex + 1), newAnchors];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      return history[historyIndex - 1];
    }
    return null;
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      return history[historyIndex + 1];
    }
    return null;
  };

  return { addToHistory, undo, redo, history, historyIndex };
};
```

#### Step 2: Custom Color Palettes

• Allow users to save palettes as named collections and load them dynamically (ColorPicker.js).

#### Step 3: Preset Gradients and Colors

• Offer pre-defined gradients and color palettes for quick selection (ColorManager.js).

#### Step 4: Undo/Redo Across Components

• Expand the undo and redo features of ColorAnchors.js to include recent colors and gradients for
consistency.

#### Step 5: Debounced State Updates

• Extend debounce functionality to other interactive features like gradients and anchors for
smoother UI performance (ColorWheel.js).

#### UI Changes for Toolbar (from src/components/Toolbar)

1. Integrate Color Tools: • Add separate buttons for “Gradient Editor,” “Color Anchors,” and “Eye
   Dropper” to improve accessibility. • Include an indicator for the currently active tool.
2. Palette and Anchor Manager Shortcuts: • Provide shortcuts to quickly open Palette and Color
   Anchor managers.
