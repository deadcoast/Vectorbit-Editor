import React, { useState } from "react";
import Grid from "./Grid";
import Menus from "./Menus";
import Toolbar from "./Toolbar";

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

```
const toggleGrid = () => {
    setGridVisible(!gridVisible);
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
    setActiveLayerIndex(layers.length); // Set the new layer as active
};

const deleteLayer = (index) => {
    if (layers.length === 1) return; // Prevent deleting the last layer
    const updatedLayers = layers.filter((_, i) => i !== index);
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

    const updatedGroups = groups.map((group) =>
        group.id === groupId
            ? { ...group, layers: [...group.layers, updatedLayers[layerIndex].id] }
            : group
    );
    setGroups(updatedGroups);
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
                disabled={layers.length === 1}
            >
                Delete Layer
            </button>
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
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={layer.opacity}
                        onChange={(e) =>
                            updateLayerOpacity(index, parseFloat(e.target.value))
                        }
                        style={{ marginLeft: "10px", width: "80px" }}
                    />
                    <button onClick={() => toggleLayerVisibility(index)}>
                        {layer.visible ? "Hide" : "Show"}
                    </button>
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
                                <div key={layer.id} style={{ marginLeft: "20px" }}>
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
```

};

export default App;
