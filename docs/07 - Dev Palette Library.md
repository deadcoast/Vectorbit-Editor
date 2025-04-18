# Enhancing the Palette and Color Picker with a Palette Library

**NOTE:** ALL DOCUMENTATION IS SUBJECT TO CHANGE, EXAMPLES LISTED ARE NOT DIRECT AND OR LITTERAL
TRANSLATIONS TO THE SOURCE CODE.

---

We will implement a palette library to allow users to save and manage their custom palettes. This
will include saving palettes to a library, loading saved palettes, and reusing them in projects.

## Step 1: Update Back-End for Palette Library

1.1 Define a Palette Schema

Create a new schema to manage saved palettes independently of projects.

### Create Palette Model in File: models/Palette.js

````javascript
const mongoose = require("mongoose");

const paletteSchema = new mongoose.Schema({
name: { type: String, required: true },
colors: { type: [String], required: true }, // Array of HEX color codes
createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Palette", paletteSchema);

## 1.2 Create Palette API Endpoints

Create a new file routes/palettes.js to handle palette operations.

### Create Palette API Endpoints in File: routes/palettes.js

```javascript
const express = require("express");
const router = express.Router();
const Palette = require("../models/Palette");

// Create a new palette
router.post("/", async (req, res) => {
const { name, colors } = req.body;

try {
const newPalette = new Palette({ name, colors });
await newPalette.save();
res.status(201).json(newPalette);
} catch (err) {
res.status(500).json({ error: "Failed to create palette" });
}
});

// Fetch all palettes
router.get("/", async (req, res) => {
try {
const palettes = await Palette.find();
res.status(200).json(palettes);
} catch (err) {
res.status(500).json({ error: "Failed to fetch palettes" });
}
});

// Delete a palette
router.delete("/:id", async (req, res) => {
try {
const deletedPalette = await Palette.findByIdAndDelete(req.params.id);
if (!deletedPalette) return res.status(404).json({ error: "Palette not found" });
res.status(200).json(deletedPalette);
} catch (err) {
res.status(500).json({ error: "Failed to delete palette" });
}
});

module.exports = router;

Add the new route server

### Add Palette API in File: server.js

```javascript
const palettesRouter = require("./routes/palettes");
app.use("/palettes", palettesRouter);
````

## Step 2: Front-End Integration

2.1 Add Palette Management UI

Create a new component to manage the palette library.

### Add Palette Library in File: src/frontend/PaletteLibrary.js

````javascript
import { useState, useEffect } from "react";
import { fetchPalettes, createPalette, deletePalette } from "../api/api";

const PaletteLibrary = ({ onLoadPalette }) => {
const [palettes, setPalettes] = useState([]);
const [paletteName, setPaletteName] = useState("");
const [currentColors, setCurrentColors] = useState([]);

useEffect(() => {
const loadPalettes = async () => {
try {
const fetchedPalettes = await fetchPalettes();
setPalettes(fetchedPalettes);
} catch (err) {
alert("Failed to load palettes.");
}
};
loadPalettes();
}, []);

const savePalette = async () => {
try {
const newPalette = await createPalette({ name: paletteName, colors: currentColors });
setPalettes([...palettes, newPalette]);
setPaletteName("");
alert("Palette saved successfully!");
} catch (err) {
alert("Failed to save palette.");
}
};

const removePalette = async (id) => {
try {
await deletePalette(id);
setPalettes(palettes.filter((palette) => palette.\_id !== id));
alert("Palette deleted successfully!");
} catch (err) {
alert("Failed to delete palette.");
}
};

return (
    <div>
    <h3>Palette Library</h3>
    <div>
\<input
type="text"
placeholder="Palette Name"
value={paletteName}
onChange={(e) => setPaletteName(e.target.value)}
/>
<button onClick={savePalette}>Save Palette</button>
    </div>
    <ul>
{palettes.map((palette) => (
    <li key={palette._id}>
<span>{palette.name}</span>
\<button onClick={() => onLoadPalette(palette.colors)}>Load</button>
\<button onClick={() => removePalette(palette.\_id)}>Delete</button>
    </li>
))}
    </ul>
    </div>
);
};

export default PaletteLibrary;

## 2.2 Add Palette Library Integration in Grid

#### File: src/frontend/Grid.js

import PaletteLibrary from "./PaletteLibrary";

const loadPaletteToProject = (colors) => {
setCustomPalettes(colors);
};

return (

<div>
    <h1>Pixel Art Editor</h1>
    <PaletteLibrary onLoadPalette={loadPaletteToProject} />
    {/* Existing Grid and Drawing Tools */}
  </div>
);

## Step 3: Update API Utility

Add API calls for palette management.

#### File: src/api/api.js

export const fetchPalettes = async () => {
try {
const response = await axios.get(`${API_BASE_URL}/palettes`);
return response.data;
} catch (error) {
console.error("Error fetching palettes:", error);
throw error;
}
};

export const createPalette = async (palette) => {
try {
const response = await axios.post(`${API_BASE_URL}/palettes`, palette);
return response.data;
} catch (error) {
console.error("Error creating palette:", error);
throw error;
}
};

export const deletePalette = async (id) => {
try {
const response = await axios.delete(`${API_BASE_URL}/palettes/${id}`);
return response.data;
} catch (error) {
console.error("Error deleting palette:", error);
throw error;
}
};

Step 4: Test the Palette Library

1. Run the Back-End:

node server.js

2. Run the Front-End:

npm start

3. Test the Palette Library:

• Save a custom palette with multiple colors.

• Load a saved palette into the current project.

• Delete palettes from the library and verify they no longer appear.

______________________________________________________________________

______________________________________________________________________

Adding Advanced Features to the Palette Library: Tagging and Sharing

We will enhance the palette library with tagging functionality for better organization and the ability to share palettes across projects.

## Step 1: Extend Back-End for Tags and Sharing

1.1 Update the Palette Schema

Modify the Palette schema to include tags and sharing capabilities.

#### File: models/Palette.js

const paletteSchema = new mongoose.Schema({
name: { type: String, required: true },
colors: { type: [String], required: true }, // Array of HEX color codes
tags: { type: [String], default: [] }, // Tags for organization
shared: { type: Boolean, default: false }, // Indicates if the palette is shared
createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Palette", paletteSchema);

## 1.2 Add Endpoints for Tagging and Sharing

Update routes/palettes.js to handle tagging and sharing updates.

#### File: routes/palettes.js

// Update tags for a palette
router.put("/:id/tags", async (req, res) => {
const { tags } = req.body;

try {
const updatedPalette = await Palette.findByIdAndUpdate(
req.params.id,
{ tags },
{ new: true }
);

if (!updatedPalette) return res.status(404).json({ error: "Palette not found" });
res.status(200).json(updatedPalette);

} catch (err) {
res.status(500).json({ error: "Failed to update tags" });
}
});

// Toggle sharing for a palette
router.put("/:id/share", async (req, res) => {
try {
const palette = await Palette.findById(req.params.id);
if (!palette) return res.status(404).json({ error: "Palette not found" });

palette.shared = !palette.shared; // Toggle sharing
await palette.save();
res.status(200).json(palette);

} catch (err) {
res.status(500).json({ error: "Failed to update sharing status" });
}
});

## Step 2: Front-End Integration

2.1 Update PaletteLibrary Component

Enhance the palette library UI to support tagging and sharing.

#### File: src/frontend/PaletteLibrary.js

import { updatePaletteTags, togglePaletteSharing } from "../api/api";

const PaletteLibrary = ({ onLoadPalette }) => {
const updateTags = async (paletteId, tags) => {
try {
const updatedPalette = await updatePaletteTags(paletteId, { tags });
setPalettes(palettes.map((p) => (p.\_id === paletteId ? updatedPalette : p)));
alert("Tags updated successfully!");
} catch (err) {
alert("Failed to update tags.");
}
};

const toggleSharing = async (paletteId) => {
try {
const updatedPalette = await togglePaletteSharing(paletteId);
setPalettes(palettes.map((p) => (p.\_id === paletteId ? updatedPalette : p)));
alert(`Palette ${updatedPalette.shared ? "shared" : "unshared"} successfully!`);
} catch (err) {
alert("Failed to update sharing status.");
}
};

return (
    <div>
    <h3>Palette Library</h3>
    <ul>
{palettes.map((palette) => (
    <li key={palette._id}>
<span>{palette.name}</span>
\<button onClick={() => onLoadPalette(palette.colors)}>Load</button>
\<button onClick={() => toggleSharing(palette.\_id)}>
{palette.shared ? "Unshare" : "Share"}
</button>
    <div>
\<input
type="text"
placeholder="Tags (comma-separated)"
defaultValue={palette.tags.join(", ")}
onBlur={(e) =>
updateTags(palette.\_id, e.target.value.split(",").map((tag) => tag.trim()))
}
/>
    </div>
    </li>
))}
    </ul>
    </div>
);
};

## 2.2 Add API Methods for Tagging and Sharing

Update the API utility with methods for tagging and sharing.

#### File: src/api/api.js

export const updatePaletteTags = async (id, tags) => {
try {
const response = await axios.put(`${API_BASE_URL}/palettes/${id}/tags`, { tags });
return response.data;
} catch (error) {
console.error("Error updating tags:", error);
throw error;
}
};

export const togglePaletteSharing = async (id) => {
try {
const response = await axios.put(`${API_BASE_URL}/palettes/${id}/share`);
return response.data;
} catch (error) {
console.error("Error toggling sharing:", error);
throw error;
}
};

## Step 3: Enhance the Front-End UI

3.1 Style Updates

Update the CSS to improve the layout for tagging and sharing.

#### File: src/frontend/PaletteLibrary.css

css
.palette-item {
display: flex;
flex-direction: column;
margin: 10px 0;
}

.palette-item button {
margin-left: 5px;
}

.palette-tags {
margin-top: 5px;
display: flex;
flex-wrap: wrap;
gap: 5px;
}

.palette-tags span {
background-color: #eee;
padding: 2px 5px;
border-radius: 3px;
font-size: 12px;
}

## Step 4: Test the Palette Library Enhancements

4.1 Run the Back-End

    node server.js

4.2 Run the Front-End

    npm start

4.3 Test Features
• Save and load palettes with tags.
• Add, update, and delete tags for a palette.
• Toggle sharing for palettes and ensure sharing status is reflected.

Enhancing the Color Picker and Palette Library

We will:

1. Enable the color picker to accept HEX values.

1. Add advanced functionality and quality-of-life (QoL) enhancements for the palette library and color picker.

## Step 1: Enhance the Color Picker

1.1 Accept HEX Values

Modify the color picker to allow users to input HEX codes directly.

#### File: src/frontend/ColorPicker.js

import { useState } from "react";

const ColorPicker = ({ onColorSelect }) => {
const [currentColor, setCurrentColor] = useState("#000000");
const [hexInput, setHexInput] = useState("#000000");

const handleColorChange = (e) => {
const color = e.target.value;
setCurrentColor(color);
setHexInput(color);
onColorSelect(color); // Notify parent of color change
};

const handleHexInputChange = (e) => {
const hex = e.target.value;
setHexInput(hex);

// Validate HEX code
const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(hex);
if (isValidHex) {
  setCurrentColor(hex);
  onColorSelect(hex);
}

};

return (
    <div className="color-picker">
<input
type="color"
value={currentColor}
onChange={handleColorChange}
/>
<input
type="text"
value={hexInput}
onChange={handleHexInputChange}
placeholder="#RRGGBB"
maxLength={7}
/>
    </div>
);
};

export default ColorPicker;

## 1.2 Style the Color Picker

#### File: src/frontend/ColorPicker.css

```css
.color-picker {
display: flex;
align-items: center;
gap: 10px;
}

.color-picker input[type="color"] {
width: 40px;
height: 40px;
border: none;
cursor: pointer;
}

.color-picker input[type="text"] {
padding: 5px;
width: 100px;
font-size: 14px;
border: 1px solid #ccc;
border-radius: 3px;
}
````

## Step 2: Enhance the Palette Library

2.1 Add Advanced Sorting and Filtering

Allow users to sort palettes alphabetically, by creation date, or by tag. Add a search function for
filtering.

### Add Sorting and Filtering in File: src/frontend/PaletteLibrary.js

````javascript
const PaletteLibrary = ({ onLoadPalette }) => {
const [searchTerm, setSearchTerm] = useState("");
const [sortOption, setSortOption] = useState("alphabetical");

const filteredPalettes = palettes
.filter((palette) =>
palette.name.toLowerCase().includes(searchTerm.toLowerCase())
)
.sort((a, b) => {
if (sortOption === "alphabetical") return a.name.localeCompare(b.name);
if (sortOption === "date") return new Date(b.createdAt) - new Date(a.createdAt);
return 0;
});

return (
    <div>
    <div className="palette-controls">
\<input
type="text"
placeholder="Search Palettes"
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
/>
\<select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
    <option value="alphabetical">Sort by Name</option>
    <option value="date">Sort by Date</option>
</select>
    </div>
    <ul>
{filteredPalettes.map((palette) => (
    <li key={palette._id}>
<span>{palette.name}</span>
\<button onClick={() => onLoadPalette(palette.colors)}>Load</button>
    </li>
))}
    </ul>
    </div>
);
};

## 2.2 Add Live Preview for Palettes

Show a visual preview of the palette colors as swatches.

### Update Palette Library in File: src/frontend/PaletteLibrary.js

```javascript
<ul>
  {filteredPalettes.map((palette) => (
    <li key={palette._id}>
      <div className="palette-preview">
        {palette.colors.map((color) => (
          <span
            key={color}
            style={{
              backgroundColor: color,
              width: "20px",
              height: "20px",
              display: "inline-block",
              marginRight: "5px",
            }}
          />
        ))}
      </div>
      <span>{palette.name}</span>
      <button onClick={() => onLoadPalette(palette.colors)}>Load</button>
    </li>
  ))}
</ul>

## Step 3: QoL Enhancements

3.1 Add Recent Colors to the Color Picker

Display a row of recently used colors for quick selection.

### Add Recent Colors in File: src/frontend/ColorPicker.js

```javascript
const [recentColors, setRecentColors] = useState([]);

const addRecentColor = (color) => {
setRecentColors((prev) => {
const updated = [color, ...prev.filter((c) => c !== color)].slice(0, 5);
return updated;
});
};

const handleColorChange = (e) => {
const color = e.target.value;
setCurrentColor(color);
setHexInput(color);
onColorSelect(color);
addRecentColor(color);
};

Render recent colors below the picker:

<div className="recent-colors">
  {recentColors.map((color) => (
    <span
      key={color}
      style={{
        backgroundColor: color,
        width: "20px",
        height: "20px",
        display: "inline-block",
        marginRight: "5px",
        cursor: "pointer",
      }}
      onClick={() => {
        setCurrentColor(color);
        setHexInput(color);
        onColorSelect(color);
      }}
    />
  ))}
</div>

## 3.2 Enable Palette Editing

Allow users to edit existing palettes by adding or removing colors.

### Add Palette Editing in File: src/frontend/PaletteLibrary.js

```javascript
const editPalette = async (paletteId, updatedColors) => {
try {
const updatedPalette = await updatePaletteTags(paletteId, { colors: updatedColors });
setPalettes(palettes.map((p) => (p.\_id === paletteId ? updatedPalette : p)));
alert("Palette updated successfully!");
} catch (err) {
alert("Failed to update palette.");
}
};

Add an “Edit” button with a modal for editing:

\<button onClick={() => setEditingPalette(palette)}>Edit</button>

{editingPalette && (
\<PaletteEditor
palette={editingPalette}
onSave={(updatedColors) => {
editPalette(editingPalette.\_id, updatedColors);
setEditingPalette(null);
}}
onCancel={() => setEditingPalette(null)}
/>
)}

## Step 4: Style Updates

4.1 Style the Palette Library

### Add Palette Library CSS in File: src/frontend/PaletteLibrary.css

```css
.palette-controls {
  display: flex;
  justify-content: space-between;
margin-bottom: 10px;
}

.palette-preview {
display: flex;
margin-bottom: 5px;
}

.palette-preview span {
border: 1px solid #ccc;
border-radius: 3px;
}

## 4.2 Style the Recent Colors Section

### Add Recent Colors CSS in File: src/frontend/ColorPicker.css

```css
.recent-colors {
  margin-top: 10px;
  display: flex;
gap: 5px;
}

.recent-colors span {
border: 1px solid #ccc;
border-radius: 3px;
cursor: pointer;
}
````

## Step 5: Testing

1. Run the Back-End: node server.js
1. Run the Front-End: npm start
1. Test Enhancements: • Add, edit, and delete palettes. • Input HEX values in the color picker and
   ensure proper validation. • Verify recent colors and live previews work as expected.

## Step 6: Implementing Color Theory for Palette Generation and Advanced Enhancements

We will now:

1. Implement color theory-based palette generation (e.g., complementary, analogous, triadic,
   tetradic schemes).
1. Add advanced enhancements like random palette generation and color harmonies.

## Step 1: Color Theory-Based Palette Generation

1.1 Utility Functions for Color Theory

Create a utility file for generating color schemes.

### Add Color Theory Utility in File: src/utils/colorTheory.js

```javascript
const hexToRgb = (hex) => {
const bigint = parseInt(hex.slice(1), 16);
return {
r: (bigint >> 16) & 255,
g: (bigint >> 8) & 255,
b: bigint & 255,
};
};

const rgbToHex = (r, g, b) => {
const toHex = (value) => value.toString(16).padStart(2, "0");
return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rotateHue = (hex, degree) => {
const { r, g, b } = hexToRgb(hex);

// Convert RGB to HSL
const rNorm = r / 255;
const gNorm = g / 255;
const bNorm = b / 255;
const max = Math.max(rNorm, gNorm, bNorm);
const min = Math.min(rNorm, gNorm, bNorm);
const delta = max - min;

let h = 0;
if (delta !== 0) {
if (max === rNorm) {
h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
} else if (max === gNorm) {
h = (bNorm - rNorm) / delta + 2;
} else {
h = (rNorm - gNorm) / delta + 4;
}
h = h * 60;
}

const newHue = (h + degree) % 360;
return hslToHex(newHue, max, min);
};

const generateComplementary = (baseColor) => [baseColor, rotateHue(baseColor, 180)];

const generateAnalogous = (baseColor) => \[
baseColor,
rotateHue(baseColor, -30),
rotateHue(baseColor, 30),
\];

const generateTriadic = (baseColor) => \[
baseColor,
rotateHue(baseColor, 120),
rotateHue(baseColor, 240),
\];

const generateTetradic = (baseColor) => \[
baseColor,
rotateHue(baseColor, 90),
rotateHue(baseColor, 180),
rotateHue(baseColor, 270),
\];

export {
generateComplementary,
generateAnalogous,
generateTriadic,
generateTetradic,
};

## 1.2 Add Color Scheme Options to Palette Library

Update the palette library to include color scheme options.

#### File: src/frontend/PaletteLibrary.js

import {
generateComplementary,
generateAnalogous,
generateTriadic,
generateTetradic,
} from "../utils/colorTheory";

const PaletteLibrary = ({ onLoadPalette }) => {
const [baseColor, setBaseColor] = useState("#ff0000");
const [generatedPalette, setGeneratedPalette] = useState([]);

const handleGeneratePalette = (scheme) => {
let newPalette = [];
if (scheme === "complementary") newPalette = generateComplementary(baseColor);
if (scheme === "analogous") newPalette = generateAnalogous(baseColor);
if (scheme === "triadic") newPalette = generateTriadic(baseColor);
if (scheme === "tetradic") newPalette = generateTetradic(baseColor);

setGeneratedPalette(newPalette);

};

return (
    <div>
    <h3>Palette Generator</h3>
\<input
type="color"
value={baseColor}
onChange={(e) => setBaseColor(e.target.value)}
/>
\<button onClick={() => handleGeneratePalette("complementary")}>Complementary</button>
\<button onClick={() => handleGeneratePalette("analogous")}>Analogous</button>
\<button onClick={() => handleGeneratePalette("triadic")}>Triadic</button>
\<button onClick={() => handleGeneratePalette("tetradic")}>Tetradic</button>
    <div className="palette-preview">
{generatedPalette.map((color) => (
\<span
key={color}
style={{
backgroundColor: color,
width: "20px",
height: "20px",
display: "inline-block",
marginRight: "5px",
}}
/>
))}
    </div>
    </div>
);
};
```

## Step 2: Random Palette Generation

2.1 Utility Function for Random Palettes

### Add Random Palette Utility in File: src/utils/randomPalette.js

```javascript
const getRandomColor = () => {
  const randomHex = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomHex.padStart(6, '0')}`;
};

const generateRandomPalette = (size = 5) => {
  return Array.from({ length: size }, () => getRandomColor());
};

export default generateRandomPalette;
```

## Step 2: Add Random Palette Option

Integrate the random palette generator into the library.

### Add Random Palette Option in File: src/frontend/PaletteLibrary.js

import generateRandomPalette from "../utils/randomPalette";

const handleGenerateRandomPalette = () => { const randomPalette = generateRandomPalette();
setGeneratedPalette(randomPalette); };

Add a button for random palette generation:

```html
<button onClick="{handleGenerateRandomPalette}">Generate Random Palette</button>
```

## Step 3: Advanced Enhancements

3.1 Harmonize Colors in Palettes

Add a toggle to adjust generated palettes for color harmony (e.g., saturation or brightness
adjustment).

### Add Color Harmony Utility in File: src/utils/colorHarmony.js

```javascript
const adjustSaturation = (hex, factor) => {
  const { r, g, b } = hexToRgb(hex);

  // Convert RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);

  const l = (max + min) / 2;
  const s = l === 0 || l === 1 ? 0 : (max - min) / (1 - Math.abs(2 * l - 1));
  const adjustedS = Math.min(Math.max(s * factor, 0), 1);

  return hslToHex(h, adjustedS, l);
};

const harmonizePalette = (palette, factor) => palette.map(color => adjustSaturation(color, factor));

export default harmonizePalette;
```

## Step 3: Integrate Harmonization

### Add Harmonization in File: src/frontend/PaletteLibrary.js

````javascript
import harmonizePalette from "../utils/colorHarmony";

const handleHarmonizePalette = () => {
const harmonized = harmonizePalette(generatedPalette, 1.2); // 20% more saturation
setGeneratedPalette(harmonized);
};

<button onClick={handleHarmonizePalette}>Harmonize Palette</button>;

## Step 4: Style Updates

4.1 Style Palette Generator

### Add Palette Library CSS in File: src/frontend/PaletteLibrary.css

```css
.palette-preview {
margin-top: 10px;
display: flex;
gap: 5px;
}

.palette-preview span {
width: 30px;
height: 30px;
border: 1px solid #ccc;
border-radius: 5px;
}
````

## Step 5: Test Enhancements

1. Run the Back-End: node server.js
1. Run the Front-End: npm start
1. Test Features: • Generate palettes using color theory (complementary, analogous, triadic,
   tetradic). • Generate random palettes. • Test harmonization for saturation and brightness
   adjustments.
