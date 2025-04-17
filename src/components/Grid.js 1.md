import React, { useState, useRef, useEffect } from "react";
import "./Grid.css";
import {
createProject,
fetchProjects,
updateProject,
convertSvgToPng,
convertSvgToJpg,
} from "../api/api";
import PaletteLibrary from "./PaletteLibrary";

// Utility function for snapping to grid
const snapToGrid = (value, gridSize, canvasSize) => {
const cellSize = canvasSize / gridSize;
return Math.round(value / cellSize) * cellSize;
};

const Grid = ({ gridSize, gridVisible, activeTool, activeColor }) => {
const canvasRef = useRef();
const [cellColors, setCellColors] = useState({});
const [hoverCell, setHoverCell] = useState(null);
const [isDrawing, setIsDrawing] = useState(false);
const [zoomLevel, setZoomLevel] = useState(1);
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

// Update history for undo/redo
const saveToHistory = () => {
const newHistory = [...history.slice(0, historyIndex + 1), { ...cellColors }];
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

// Apply brush tool
const applyBrush = (x, y, type = "filled") => {
const updatedColors = { ...cellColors };
const index = y * gridSize + x;

```
const paintCell = (x, y, color) => {
  const index = y * gridSize + x;
  if (index >= 0 && index < gridSize * gridSize) {
    updatedColors[index] = color;
  }
};

if (type === "filled") {
  paintCell(x, y, activeColor);
} else if (type === "outline") {
  // Draw cell border
  const neighbors = [
    [x - 1, y], [x + 1, y],
    [x, y - 1], [x, y + 1],
  ];
  neighbors.forEach(([nx, ny]) => paintCell(nx, ny, activeColor));
}

setCellColors(updatedColors);
saveToHistory();
```

};

// Eraser tool
const applyEraser = (x, y) => {
const updatedColors = { ...cellColors };
const index = y * gridSize + x;

```
if (index >= 0 && index < gridSize * gridSize) {
  updatedColors[index] = null; // Clear the cell
}

setCellColors(updatedColors);
saveToHistory();
```

};

// Mouse handlers
const handleMouseDown = (event) => {
const canvas = canvasRef.current;
const rect = canvas.getBoundingClientRect();
const x = Math.floor((event.clientX - rect.left) / (canvas.width / gridSize));
const y = Math.floor((event.clientY - rect.top) / (canvas.height / gridSize));

```
if (activeTool === "brush") {
  applyBrush(x, y);
} else if (activeTool === "eraser") {
  applyEraser(x, y);
}
setIsDrawing(true);
```

};

const handleMouseMove = (event) => {
if (isDrawing) {
const canvas = canvasRef.current;
const rect = canvas.getBoundingClientRect();
const x = Math.floor((event.clientX - rect.left) / (canvas.width / gridSize));
const y = Math.floor((event.clientY - rect.top) / (canvas.height / gridSize));

```
  if (activeTool === "brush") {
    applyBrush(x, y);
  } else if (activeTool === "eraser") {
    applyEraser(x, y);
  }
}
```

};

const handleMouseUp = () => {
setIsDrawing(false);
};

const renderCanvas = (scale = 1) => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");
const cellSize = (500 / gridSize) * scale;

```
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
```

};

const exportCanvas = (format) => {
renderCanvas(1);
const canvas = canvasRef.current;
const link = document.createElement("a");
link.href = canvas.toDataURL(`image/${format}`);
link.download = `grid-export.${format}`;
link.click();
};

const createGrid = () => {
const cells = [];
for (let i = 0; i < gridSize * gridSize; i++) {
cells.push(
\<div
key={i}
className="grid-cell"
style={{
backgroundColor: cellColors[i] || "#f9f9f9",
border: "1px solid #eee",
}}
\></div>
);
}
return cells;
};

return (
    <div>
    <div className="grid-controls">
\<button onClick={() => renderCanvas()}>Render to Canvas</button>
\<button onClick={() => exportCanvas("png")}>Export to PNG</button>
\<button onClick={() => exportCanvas("jpeg")}>Export to JPG</button>
<button onClick={undo}>Undo</button>
<button onClick={redo}>Redo</button>
\<button onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 2))}>
Zoom In
</button>
\<button onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))}>
Zoom Out
</button>
    </div>
\<div
className="grid"
style={{
gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
gridTemplateRows: `repeat(${gridSize}, 1fr)`,
transform: `scale(${zoomLevel})`,
transformOrigin: "0 0",
display: gridVisible ? "grid" : "none",
}}
onMouseDown={handleMouseDown}
onMouseMove={handleMouseMove}
onMouseUp={handleMouseUp}
\>
{createGrid()}
    </div>
\<canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
);
};

export default Grid;

import React, { useState, useRef, useEffect } from "react";
import "./Grid.css";
import { createProject, fetchProjects, updateProject, convertSvgToPng, convertSvgToJpg } from "../api/api";
import PaletteLibrary from "./PaletteLibrary";

const handlePreviewAnchorChange = (anchorName, previewColor) => {
const previewColors = { ...cellColors };

Object.keys(previewColors).forEach((index) => {
if (previewColors[index] === colorAnchors[anchorName]) {
previewColors[index] = previewColor;
}
});

setPreviewCellColors(previewColors);
};

const commitPreviewChanges = () => {
setCellColors(previewCellColors);
setPreviewCellColors(null);
};

const updateGridWithAnchor = (anchorName, newColor) => {
const updatedColors = { ...cellColors };

Object.keys(updatedColors).forEach((index) => {
if (updatedColors[index] === colorAnchors[anchorName]) {
updatedColors[index] = newColor;
}
});

setCellColors(updatedColors);
};

const applyRandomizedBrush = (x, y) => {
const randomOffsetX = Math.floor(Math.random() *3 - 1); // Random offset (-1, 0, 1)
const randomOffsetY = Math.floor(Math.random()* 3 - 1);
const randomColor = modifyColor(activeColor, Math.random() * 20 - 10);

applyBrush(x + randomOffsetX, y + randomOffsetY, randomColor);
};

ctx.globalAlpha = opacity;
ctx.filter = `blur(${softness}px)`;

const saveStencil = (x, y, width, height) => {
const stencil = [];
for (let i = 0; i < height; i++) {
for (let j = 0; j < width; j++) {
const index = (y + i) * gridSize + (x + j);
stencil.push(cellColors[index]);
}
}
setStencils((prev) => [...prev, stencil]);
};

const applyIndexedColorMode = (palette) => {
const updatedColors = { ...cellColors };

Object.keys(updatedColors).forEach((index) => {
const currentColor = updatedColors[index];
updatedColors[index] = mapToPalette(currentColor, palette);
});

setCellColors(updatedColors);
};

useEffect(() => {
const handleKeyDown = (e) => {
if (e.key === "e" || e.key === "E") {
setActiveTool((prev) => (prev === "eraser" ? "brush" : "eraser"));
}
};

window.addEventListener("keydown", handleKeyDown);
return () => window.removeEventListener("keydown", handleKeyDown);
}, []);

const applyBrush = (x, y, type = "filled") => {
// ... Brush logic
saveToHistory();
};

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

const applyBrush = (x, y, type = "filled") => {
const updatedColors = { ...cellColors };

const paintCell = (x, y, color) => {
const index = y *gridSize + x;
if (index >= 0 && index < gridSize* gridSize) {
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

const renderCanvas = (ctx) => {
renderGrid(ctx);
renderHoverPreview(ctx);
renderEraserPreview(ctx);
};

const renderEraserPreview = (ctx) => {
if (hoverCell && activeTool === "eraser") {
ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Semi-transparent white
ctx.fillRect(
hoverCell.x *cellSize,
hoverCell.y* cellSize,
cellSize,
cellSize
);
}
};

const applyEraser = (x, y) => {
const updatedColors = { ...cellColors };
const index = y * gridSize + x;

if (index >= 0 && index < gridSize * gridSize) {
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

```
if (activeTool === "brush") {
  applyBrush(x, y);
} else if (activeTool === "eraser") {
  applyEraser(x, y);
}
```

}
};

const renderHoverPreview = (ctx) => {
if (hoverCell) {
ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Semi-transparent preview
ctx.fillRect(
hoverCell.x *cellSize,
hoverCell.y* cellSize,
cellSize,
cellSize
);
}
};

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

const applyBrush = (x, y) => {
const updatedColors = { ...cellColors };
const index = y * gridSize + x;

if (index >= 0 && index < gridSize * gridSize) {
updatedColors[index] = activeColor; // Paint the cell
}

setCellColors(updatedColors);
};

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

const Grid = ({ gridSize, gridVisible, activeTool, activeColor }) => {
const canvasRef = useRef();
const [cellColors, setCellColors] = useState({});
const [projects, setProjects] = useState([]);
const [zoomLevel, setZoomLevel] = useState(1);
const [isDrawing, setIsDrawing] = useState(false);
const [freehandPoints, setFreehandPoints] = useState([]);
const [draggingGroup, setDraggingGroup] = useState(null);
const [customPalettes, setCustomPalettes] = useState([]);
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

useEffect(() => {
const loadProjects = async () => {
try {
const loadedProjects = await fetchProjects();
setProjects(loadedProjects);
} catch {
alert("Failed to fetch projects.");
}
};

```
const handleKeyDown = (e) => {
  if (e.key === "+") handleZoom(true);
  if (e.key === "-") handleZoom(false);
};

window.addEventListener("keydown", handleKeyDown);
loadProjects();

return () => {
  window.removeEventListener("keydown", handleKeyDown);
};
```

}, []);

const handleZoom = (zoomIn) => {
setZoomLevel((prev) => Math.min(Math.max(prev + (zoomIn ? 0.1 : -0.1), 0.5), 2));
};

const handleDrag = (event) => {
if (draggingGroup) {
const { groupId, startX, startY } = draggingGroup;
const deltaX = event.clientX - startX;
const deltaY = event.clientY - startY;

```
  setDraggingGroup((prev) => ({
    ...prev,
    positionX: deltaX,
    positionY: deltaY,
  }));
}
```

};

const handleDragEnd = () => {
if (draggingGroup) {
setDraggingGroup(null); // Stop dragging
}
};

const renderToCanvas = (scale = 1) => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");
const cellSize = (500 / gridSize) * scale;

```
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
```

};

const exportCanvas = (format, scale = 1) => {
renderToCanvas(scale);
const canvas = canvasRef.current;
const link = document.createElement("a");
link.href = canvas.toDataURL(`image/${format}`);
link.download = `grid-export.${format}`;
link.click();
};

const handleCellClick = (index) => {
const updatedColors = { ...cellColors };
updatedColors[index] = activeColor;
setCellColors(updatedColors);
};

const createGrid = () => {
const cells = [];
for (let i = 0; i < gridSize * gridSize; i++) {
cells.push(
\<div
key={i}
className="grid-cell"
style={{ backgroundColor: cellColors[i] || "#f9f9f9" }}
onMouseDown={() => handleCellClick(i)}
\></div>
);
}
return cells;
};

return (
    <div>
    <div className="grid-controls">
\<button onClick={() => renderToCanvas()}>Render to Canvas</button>
\<button onClick={() => exportCanvas("png")}>Export to PNG</button>
\<button onClick={() => exportCanvas("jpeg")}>Export to JPG</button>
\<button onClick={() => handleZoom(true)}>Zoom In</button>
\<button onClick={() => handleZoom(false)}>Zoom Out</button>
    </div>
\<div
className="grid"
style={{
gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
gridTemplateRows: `repeat(${gridSize}, 1fr)`,
transform: `scale(${zoomLevel})`,
transformOrigin: "0 0",
display: gridVisible ? "grid" : "none",
}}
\>
{createGrid()}
    </div>
\<canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
);
};

export default Grid;

import React, { useState, useRef } from "react";
import "./Grid.css";
import { createProject } from "../api/api";
import { fetchProjects } from "../api/api";
import { useState, useEffect } from "react";
import { convertSvgToPng, convertSvgToJpg } from "../api/api";
import { updateProject } from "../api/api";

useEffect(() => {
const handleKeyDown = (e) => {
if (e.key === "+") handleZoom(true);
if (e.key === "-") handleZoom(false);
};

window.addEventListener("keydown", handleKeyDown);
return () => {
window.removeEventListener("keydown", handleKeyDown);
};
}, []);

const [zoomLevel, setZoomLevel] = useState(1);

const handleZoom = (zoomIn) => {
setZoomLevel((prev) => Math.min(Math.max(prev + (zoomIn ? 0.1 : -0.1), 0.5), 2));
};

const [defaultFormat, setDefaultFormat] = useState("svg");

const saveDefaultFormat = () => {
localStorage.setItem("defaultFormat", defaultFormat);
alert(`Default format saved: ${defaultFormat}`);
};

const loadDefaultFormat = () => {
const format = localStorage.getItem("defaultFormat");
if (format) setDefaultFormat(format);
};

useEffect(() => {
loadDefaultFormat();
}, []);

const savePalette = async (projectId, palettes) => {
try {
const updatedProject = await updateProject(projectId, { palettes });
alert("Palettes saved successfully!");
} catch (error) {
alert("Failed to save palettes.");
}
};

const loadPalettes = async (projectId) => {
try {
const project = await fetchProjectById(projectId);
setCustomPalettes(project.colorPalettes);
} catch (error) {
alert("Failed to load palettes.");
}
};

const exportToImage = async (format) => {
const canvas = canvasRef.current;
const svgBlob = new Blob([canvas.toDataURL("image/svg+xml")], { type: "image/svg+xml" });

try {
let response;
if (format === "png") {
response = await convertSvgToPng(svgBlob);
} else if (format === "jpg") {
response = await convertSvgToJpg(svgBlob);
}

```
const link = document.createElement("a");
link.href = URL.createObjectURL(new Blob([response]));
link.download = `pixel-art.${format}`;
link.click();
```

} catch (error) {
alert(`Failed to export to ${format}`);
}
};

const [projects, setProjects] = useState([]);

useEffect(() => {
const loadProjects = async () => {
try {
const loadedProjects = await fetchProjects();
setProjects(loadedProjects);
} catch (error) {
alert("Failed to fetch projects.");
}
};

loadProjects();
}, []);

const loadProject = (project) => {
setGridSize(project.gridSize);
setCellColors(project.cellColors);
};

return (

<div>
    <h3>Saved Projects</h3>
    <ul>
      {projects.map((project) => (
        <li key={project._id}>
          <button onClick={() => loadProject(project)}>{project.name}</button>
        </li>
      ))}
    </ul>
  </div>
);

const saveProject = async () => {
const projectData = {
name: "My Project",
gridSize,
cellColors,
};

try {
const savedProject = await createProject(projectData);
alert(`Project saved successfully! ID: ${savedProject._id}`);
} catch (error) {
alert("Failed to save project.");
}
};

const exportImage = async (format) => {
const canvas = canvasRef.current;
const svgBlob = new Blob([canvas.toDataURL("image/svg+xml")], { type: "image/svg+xml" });

const formData = new FormData();
formData.append("file", svgBlob);

try {
const response = await fetch(`http://localhost:5000/projects/convert/${format}`, {
method: "POST",
body: formData,
});

```
if (response.ok) {
  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `pixel-art.${format}`;
  link.click();
} else {
  alert("Failed to export image.");
}
```

} catch (err) {
alert("Error exporting image.");
}
};

const saveProjectToServer = async () => {
const projectData = { name: "My Project", gridSize, cellColors };

try {
const response = await fetch("<http://localhost:5000/projects>", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(projectData),
});

```
if (response.ok) {
  alert("Project saved successfully!");
} else {
  alert("Failed to save project.");
}
```

} catch (err) {
alert("Error saving project.");
}
};

const exportToPNG = () => {
renderToCanvas(1); // Render to the hidden canvas
const canvas = canvasRef.current;
const link = document.createElement("a");
link.href = canvas.toDataURL("image/png");
link.download = "pixel-art.png";
link.click();
};

const exportToJPG = () => {
renderToCanvas(1); // Render to the hidden canvas
const canvas = canvasRef.current;
const link = document.createElement("a");
link.href = canvas.toDataURL("image/jpeg");
link.download = "pixel-art.jpg";
link.click();
};

const handleGridResize = (newGridSize) => {
const updatedColors = {};
const scale = newGridSize / gridSize;

Object.keys(cellColors).forEach((key) => {
const index = parseInt(key);
const x = index % gridSize;
const y = Math.floor(index / gridSize);
const newX = Math.floor(x *scale);
const newY = Math.floor(y* scale);
const newIndex = newY * newGridSize + newX;

```
updatedColors[newIndex] = cellColors[index];
```

});

setGridSize(newGridSize);
setCellColors(updatedColors);
};

<div className="menu">
  <span>Settings</span>
  <div className="dropdown">
    <button onClick={() => handleGridResize(8)}>8x8</button>
    <button onClick={() => handleGridResize(16)}>16x16</button>
    <button onClick={() => handleGridResize(32)}>32x32</button>
    <button onClick={() => handleGridResize(64)}>64x64</button>
  </div>
</div>

const snapToGrid = (value, gridSize, canvasSize) => {
const cellSize = canvasSize / gridSize;
return Math.round(value / cellSize) * cellSize;
};

const renderGroup = (ctx, group, gridSize, scale = 1) => {
const cellSize = ctx.canvas.width / gridSize;

ctx.save();

// Apply group transformations
const centerX = snapToGrid(group.positionX, gridSize, ctx.canvas.width);
const centerY = snapToGrid(group.positionY, gridSize, ctx.canvas.height);

ctx.translate(centerX, centerY);
ctx.scale(group.scale, group.scale);
ctx.rotate((group.rotation * Math.PI) / 180);
ctx.translate(-centerX, -centerY);

group.layers.forEach((layer) => {
if (layer.visible) {
layer.cells.forEach((cell) => {
ctx.fillStyle = cell.color;
ctx.fillRect(
cell.x *cellSize,
cell.y* cellSize,
cellSize,
cellSize
);
});
}
});

ctx.restore();
};

const Grid = ({ gridSize, gridVisible, groups, layers, setGroups, setLayers }) => {
const canvasRef = useRef();
const [isDragging, setIsDragging] = useState(false);
const [draggingGroup, setDraggingGroup] = useState(null);

const handleDragStart = (groupId, startX, startY) => {
setIsDragging(true);
setDraggingGroup({ groupId, startX, startY });
};

const handleDrag = (event) => {
if (isDragging && draggingGroup) {
const { groupId, startX, startY } = draggingGroup;
const deltaX = event.clientX - startX;
const deltaY = event.clientY - startY;

```
  setGroups((prev) =>
    prev.map((group) =>
      group.id === groupId
        ? { ...group, positionX: deltaX, positionY: deltaY }
        : group
    )
  );
}
```

};

const handleDragEnd = () => {
if (draggingGroup) {
setGroups((prev) =>
prev.map((group) =>
group.id === draggingGroup.groupId
? {
...group,
positionX: snapToGrid(
group.positionX,
gridSize,
canvasRef.current.width
),
positionY: snapToGrid(
group.positionY,
gridSize,
canvasRef.current.height
),
}
: group
)
);
setDraggingGroup(null);
}
setIsDragging(false);
};

const renderToCanvas = (scale = 1) => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");
const resolution = 500 * scale;

```
canvas.width = resolution;
canvas.height = resolution;

ctx.clearRect(0, 0, canvas.width, canvas.height);

groups.forEach((group) => renderGroup(ctx, group, gridSize, scale));
```

};

const exportToSVG = () => {
renderToCanvas(1);
const canvas = canvasRef.current;
const link = document.createElement("a");
link.href = canvas.toDataURL("image/svg+xml");
link.download = `grid-export.svg`;
link.click();
};

const createGrid = () => {
const cells = [];
for (let i = 0; i < gridSize * gridSize; i++) {
cells.push(
\<div
key={i}
className="grid-cell"
style={{ backgroundColor: "#f9f9f9", border: "1px solid #eee" }}
\></div>
);
}
return cells;
};

return (
    <div>
    <div className="grid-controls">
\<button onClick={() => renderToCanvas()}>Render to Canvas</button>
<button onClick={exportToSVG}>Export to SVG</button>
    </div>
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
\<canvas ref={canvasRef} style={{ display: "none" }}></canvas>
{groups.map((group) => (
\<div
key={group.id}
onMouseDown={(event) =>
handleDragStart(group.id, event.clientX, event.clientY)
}
onMouseMove={handleDrag}
onMouseUp={handleDragEnd}
style={{
position: "absolute",
top: `${group.positionY}px`,
left: `${group.positionX}px`,
transform: `scale(${group.scale}) rotate(${group.rotation}deg)`,
}}
\>
Group: {group.name}
    </div>
))}
    </div>
);
};

export default Grid;

import React, { useState, useRef } from "react";
import "./Grid.css";

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

const snapToGrid = (value, gridSize, canvasSize) => {
const cellSize = canvasSize / gridSize;
return Math.round(value / cellSize) * cellSize;
};

const handleDragEnd = () => {
if (draggingGroup) {
const { groupId, startX, startY } = draggingGroup;

```
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
```

}
};

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

```
updateGroupPosition(groupId, { positionX: deltaX, positionY: deltaY });
```

}
};

const handleDragEnd = () => {
setDraggingGroup(null); // Stop dragging
};

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
layers.filter((layer) => !layer.group).forEach((layer) => renderLayer(ctx, layer, scale));
};

const smoothFreehand = (points) => {
const updatedColors = { ...cellColors };

for (let i = 0; i < points.length - 1; i++) {
const startX = points[i] % gridSize;
const startY = Math.floor(points[i] / gridSize);
const endX = points[i + 1] % gridSize;
const endY = Math.floor(points[i + 1] / gridSize);

```
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
```

}

setCellColors(updatedColors);
};

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

const Grid = ({ gridSize, gridVisible, activeTool, activeColor }) => {
const [cellColors, setCellColors] = useState({});
const [isDrawing, setIsDrawing] = useState(false);
const [startIndex, setStartIndex] = useState(null);
const [hoverIndex, setHoverIndex] = useState(null);
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);
const canvasRef = useRef();

const updateHistory = (newState) => {
const newHistory = [...history.slice(0, historyIndex + 1), newState];
setHistory(newHistory);
setHistoryIndex(newHistory.length - 1);
};

const handleCellClick = (index, endIndex = null) => {
const updatedColors = { ...cellColors };

```
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
```

};

const drawRectangle = (startIndex, endIndex) => {
const updatedColors = { ...cellColors };
const [startX, startY] = [startIndex % gridSize, Math.floor(startIndex / gridSize)];
const [endX, endY] = [endIndex % gridSize, Math.floor(endIndex / gridSize)];
const [minX, maxX] = [Math.min(startX, endX), Math.max(startX, endX)];
const [minY, maxY] = [Math.min(startY, endY), Math.max(startY, endY)];

```
for (let y = minY; y <= maxY; y++) {
  for (let x = minX; x <= maxX; x++) {
    const index = y * gridSize + x;
    updatedColors[index] = activeColor;
  }
}
setCellColors(updatedColors);
```

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

```
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
```

};

const floodFill = (index, targetColor, fillColor) => {
if (targetColor === fillColor) return;

```
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
```

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

const renderToCanvas = (scale = 1) => {
const canvas = canvasRef.current;
const ctx = canvas.getContext("2d");
const cellSize = (500 / gridSize) * scale;

```
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
```

};

const exportCanvas = (format, scale = 1) => {
renderToCanvas(scale);
const canvas = canvasRef.current;
const link = document.createElement("a");
link.href = canvas.toDataURL(`image/${format}`);
link.download = `grid-export.${format}`;
link.click();
};

const createGrid = () => {
const cells = [];
for (let i = 0; i < gridSize * gridSize; i++) {
cells.push(
\<div
key={i}
className="grid-cell"
style={{
backgroundColor: cellColors[i] || "#f9f9f9",
border: hoverIndex === i ? "1px solid red" : "1px solid #eee",
}}
onMouseEnter={() => setHoverIndex(i)}
onMouseLeave={() => setHoverIndex(null)}
onMouseDown={() => handleCellClick(i)}
\></div>
);
}
return cells;
};

return (
    <div>
    <div className="grid-controls">
\<button onClick={() => renderToCanvas()}>Render to Canvas</button>
\<button onClick={() => exportCanvas("png")}>Export to PNG</button>
\<button onClick={() => exportCanvas("jpeg")}>Export to JPG</button>
<button onClick={undo}>Undo</button>
<button onClick={redo}>Redo</button>
    </div>
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
\<canvas ref={canvasRef} style={{ display: "none" }}></canvas>
    </div>
    <div className="grid-controls">
<button onClick={exportGroupsToSVG}>Export Each Group</button>
<button onClick={exportAllGroupsToSVG}>Export All Groups</button>

</div>
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
<div
  className="grid"
  style={{
    transform: `scale(${zoomLevel})`,
    transformOrigin: "0 0",
  }}
>
  {createGrid()}
</div>
<div className="zoom-controls">
  <button onClick={() => handleZoom(true)}>Zoom In</button>
  <button onClick={() => handleZoom(false)}>Zoom Out</button>
</div>
  );
};

export default Grid;
