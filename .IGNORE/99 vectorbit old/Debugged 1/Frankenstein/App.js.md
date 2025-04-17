import React, { useState, useCallback } from "react";
import Grid from "./Grid";
import Menus from "./Menus";
import Toolbar from "./Toolbar";
import { useDrag, useDrop } from "react-dnd";

const LayerItem = ({ layer, index, reorderLayer }) => {
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
\<div
ref={(node) => dragRef(dropRef(node))}
style={{
opacity: isDragging ? 0.5 : 1,
cursor: "move",
margin: "5px 0",
}}
\>
{layer.name}
    </div>
);
};

const App = () => {
// State Management
const [gridVisible, setGridVisible] = useState(true);
const [gridSize, setGridSize] = useState(16);
const [activeTool, setActiveTool] = useState("brush");
const [activeColor, setActiveColor] = useState("#000000");
const [layers, setLayers] = useState(\[
{ id: 1, name: "Layer 1", cellColors: {}, opacity: 1, visible: true, group: null },
\]);
const [groups, setGroups] = useState(\[{ id: 1, name: "Group 1", layers: [] }\]);
const [activeLayerIndex, setActiveLayerIndex] = useState(0);

// History Management
const [history, setHistory] = useState([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const saveState = useCallback(() => {
const newHistory = [...history.slice(0, historyIndex + 1), { layers, groups }];
setHistory(newHistory);
setHistoryIndex(newHistory.length - 1);
}, [history, historyIndex, layers, groups]);

const undo = () => {
if (historyIndex > 0) {
const { layers: prevLayers, groups: prevGroups } = history[historyIndex - 1];
setLayers(prevLayers);
setGroups(prevGroups);
setHistoryIndex(historyIndex - 1);
}
};

const redo = () => {
if (historyIndex < history.length - 1) {
const { layers: nextLayers, groups: nextGroups } = history[historyIndex + 1];
setLayers(nextLayers);
setGroups(nextGroups);
setHistoryIndex(historyIndex + 1);
}
};

// Group and Layer Management
const addGroup = () => {
const newGroup = {
id: groups.length + 1,
name: `Group ${groups.length + 1}`,
layers: [],
};
setGroups([...groups, newGroup]);
saveState();
};

const renameGroup = (groupId, newName) => {
const updatedGroups = groups.map((group) =>
group.id === groupId ? { ...group, name: newName } : group
);
setGroups(updatedGroups);
saveState();
};

const deleteGroup = (groupId) => {
const updatedGroups = groups.filter((group) => group.id !== groupId);
const updatedLayers = layers.map((layer) =>
layer.group === groupId ? { ...layer, group: null } : layer
);
setGroups(updatedGroups);
setLayers(updatedLayers);
saveState();
};

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
setActiveLayerIndex(layers.length);
saveState();
};

const deleteLayer = (index) => {
if (layers.length === 1) return; // Prevent deleting the last layer
const updatedLayers = layers.filter((\_, i) => i !== index);
setLayers(updatedLayers);
setActiveLayerIndex(Math.max(0, index - 1));
saveState();
};

const reorderLayer = (fromIndex, toIndex) => {
if (toIndex < 0 || toIndex >= layers.length) return; // Prevent out-of-bounds
const updatedLayers = [...layers];
const [movedLayer] = updatedLayers.splice(fromIndex, 1);
updatedLayers.splice(toIndex, 0, movedLayer);
setLayers(updatedLayers);
saveState();
};

// Render UI
return (
    <div>
    <h1>Vectorbit</h1>
\<Menus toggleGrid={() => setGridVisible(!gridVisible)} setGridSize={setGridSize} />
<Toolbar setActiveTool={setActiveTool} setActiveColor={setActiveColor} />
    <div className="layer-controls">
<button onClick={addLayer}>Add Layer</button>
\<button
onClick={() => deleteLayer(activeLayerIndex)}
disabled={layers.length === 1}
\>
Delete Layer
</button>
{layers.map((layer, index) => (
\<div key={layer.id} style={{ display: "flex", alignItems: "center" }}>
\<button
onClick={() => setActiveLayerIndex(index)}
style={{
fontWeight: activeLayerIndex === index ? "bold" : "normal",
}}
\>
{layer.name}
</button>
\<input
type="range"
min="0"
max="1"
step="0.1"
value={layer.opacity}
onChange={(e) =>
setLayers((prev) => {
const updatedLayers = [...prev];
updatedLayers[index].opacity = parseFloat(e.target.value);
return updatedLayers;
})
}
/>
\<button onClick={() => reorderLayer(index, index - 1)}>Up</button>
\<button onClick={() => reorderLayer(index, index + 1)}>Down</button>
    </div>
))}
    </div>
    <div className="group-controls">
<button onClick={addGroup}>Add Group</button>
{groups.map((group) => (
    <div key={group.id}>
<span>{group.name}</span>
\<button onClick={() => renameGroup(group.id, prompt("New Group Name:"))}>
Rename
</button>
\<button onClick={() => deleteGroup(group.id)}>Delete</button>
    </div>
))}
    </div>
\<Grid
gridSize={gridSize}
gridVisible={gridVisible}
activeTool={activeTool}
activeColor={activeColor}
cellColors={layers[activeLayerIndex].cellColors}
setCellColors={(colors) => {
const updatedLayers = [...layers];
updatedLayers[activeLayerIndex].cellColors = colors;
setLayers(updatedLayers);
}}
/>
    <div className="layer-list">
{layers.map((layer, index) => (
<LayerItem key={layer.id} layer={layer} index={index} reorderLayer={reorderLayer} />
))}
    </div>
    <div className="history-controls">
\<button onClick={undo} disabled={historyIndex \<= 0}>
Undo
</button>
<button onClick={redo} disabled={historyIndex >= history.length - 1}>
Redo
</button>
    </div>
    </div>
);
};

export default App;

import React, { useState } from "react";
import Grid from "./Grid";
import Menus from "./Menus";
import Toolbar from "./Toolbar";
import { useDrag, useDrop } from "react-dnd";

const App = () => {
const [groups, setGroups] = useState(\[
{ id: 1, name: "Group 1", layers: [], scale: 1, rotation: 0, positionX: 0, positionY: 0 },
\]);

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

const App = () => {
const [groups, setGroups] = useState(\[
{ id: 1, name: "Group 1", layers: [], scale: 1, rotation: 0 },
\]);

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
\<input
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
\<input
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

const addGroup = () => {
const newGroup = {
id: groups.length + 1,
name: `Group ${groups.length + 1}`,
layers: [],
};
setGroups([...groups, newGroup]);
saveState(); // Save state
};

const reorderLayer = (dragIndex, hoverIndex) => {
const updatedLayers = [...layers];
const [draggedLayer] = updatedLayers.splice(dragIndex, 1);
updatedLayers.splice(hoverIndex, 0, draggedLayer);
setLayers(updatedLayers);
saveState(); // Save state
};

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
const { layers: prevLayers, groups: prevGroups } = history[historyIndex - 1];
setLayers(prevLayers);
setGroups(prevGroups);
setHistoryIndex(historyIndex - 1);
}
};

const redo = () => {
if (historyIndex < history.length - 1) {
const { layers: nextLayers, groups: nextGroups } = history[historyIndex + 1];
setLayers(nextLayers);
setGroups(nextGroups);
setHistoryIndex(historyIndex + 1);
}
};

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
\<div
ref={(node) => dragRef(dropRef(node))}
style={{
opacity: isDragging ? 0.5 : 1,
cursor: "move",
}}
\>
{layer.name}
    </div>
);
};

const App = () => {
const [gridVisible, setGridVisible] = useState(true);
const [gridSize, setGridSize] = useState(16);
const [activeTool, setActiveTool] = useState("brush");
const [activeColor, setActiveColor] = useState("#000000");
const [layers, setLayers] = useState(\[
{ id: 1, name: "Layer 1", cellColors: {}, opacity: 1, visible: true, group: null },
\]);
const [groups, setGroups] = useState(\[{ id: 1, name: "Group 1", layers: [] }\]);
const [activeLayerIndex, setActiveLayerIndex] = useState(0);

const toggleGrid = () => setGridVisible(!gridVisible);

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
setActiveLayerIndex(layers.length); // Set the new layer as active
};

const deleteLayer = (index) => {
if (layers.length === 1) return; // Prevent deleting the last layer
const updatedLayers = layers.filter((\_, i) => i !== index);
setLayers(updatedLayers);
setActiveLayerIndex(Math.max(0, index - 1)); // Adjust active layer
};

const updateLayerColors = (cellColors) => {
const updatedLayers = [...layers];
updatedLayers[activeLayerIndex].cellColors = cellColors;
setLayers(updatedLayers);
};

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

const reorderLayer = (fromIndex, toIndex) => {
if (toIndex < 0 || toIndex >= layers.length) return; // Prevent out-of-bounds
const updatedLayers = [...layers];
const [movedLayer] = updatedLayers.splice(fromIndex, 1);
updatedLayers.splice(toIndex, 0, movedLayer);
setLayers(updatedLayers);
};

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

```
const updatedGroups = groups.map((group) =>
  group.id === groupId
    ? { ...group, layers: [...group.layers, updatedLayers[layerIndex].id] }
    : group
);
setGroups(updatedGroups);
```

};

return (
    <div>
    <h1>Vectorbit</h1>
<Menus toggleGrid={toggleGrid} setGridSize={setGridSize} />
<Toolbar setActiveTool={setActiveTool} setActiveColor={setActiveColor} />
    <div className="layer-controls">
<button onClick={addLayer}>Add Layer</button>
\<button
onClick={() => deleteLayer(activeLayerIndex)}
disabled={layers.length === 1}
\>
Delete Layer
</button>
{layers.map((layer, index) => (
\<div key={layer.id} style={{ display: "flex", alignItems: "center" }}>
\<button
onClick={() => setActiveLayerIndex(index)}
style={{
fontWeight: activeLayerIndex === index ? "bold" : "normal",
}}
\>
{layer.name}
</button>
\<input
type="range"
min="0"
max="1"
step="0.1"
value={layer.opacity}
onChange={(e) => updateLayerOpacity(index, parseFloat(e.target.value))}
style={{ marginLeft: "10px", width: "80px" }}
/>
\<button onClick={() => toggleLayerVisibility(index)}>
{layer.visible ? "Hide" : "Show"}
</button>
\<button onClick={() => reorderLayer(index, index - 1)}>Up</button>
\<button onClick={() => reorderLayer(index, index + 1)}>Down</button>
    </div>
))}
    </div>
    <div className="group-controls">
<button onClick={addGroup}>Add Group</button>
    <div>
{groups.map((group) => (
    <div key={group.id}>
<span>{group.name}</span>
{layers
.filter((layer) => layer.group === group.id)
.map((layer) => (
\<div key={layer.id} style={{ marginLeft: "20px" }}>
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
/>
    </div>
    <div className="layer-list">
{layers.map((layer, index) => (
<LayerItem key={layer.id} layer={layer} index={index} />
))}

</div>
<div className="history-controls">
  <button onClick={undo} disabled={historyIndex <= 0}>Undo</button>
  <button onClick={redo} disabled={historyIndex >= history.length - 1}>Redo</button>
</div>
  );
};

export default App;
