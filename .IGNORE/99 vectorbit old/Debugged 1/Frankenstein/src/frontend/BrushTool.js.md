const applyBrushWithAnchor = (x, y, anchorName) => {
const updatedColors = { ...cellColors };
const index = y * gridSize + x;

if (index >= 0 && index < gridSize * gridSize) {
updatedColors[index] = colorAnchors[anchorName];
}

setCellColors(updatedColors);
};

\<select onChange={(e) => setActiveAnchor(e.target.value)}>
{Object.keys(colorAnchors).map((anchorName) => (
    <option key={anchorName} value={anchorName}>
{anchorName.replace(/([A-Z])/g, " $1")}
    </option>
))}
</select>;
