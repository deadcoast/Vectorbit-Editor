const handleAddGroupColor = (anchor) => {
const updatedColors = \[...colorAnchors[anchor], "#ffffff"\];
updateColorAnchor(anchor, updatedColors);
};

const handleRemoveGroupColor = (anchor, index) => {
const updatedColors = colorAnchors[anchor].filter((\_, i) => i !== index);
updateColorAnchor(anchor, updatedColors);
};

const handleColorChange = (anchor, newColor) => {
updateColorAnchor(anchor, newColor);
updateGridWithAnchor(anchor, newColor);
};

const handleAddAnchor = () => {
const newAnchorName = prompt("Enter a name for the new anchor:");
if (newAnchorName) addAnchor(newAnchorName);
};

const handleRenameAnchor = (oldName) => {
const newName = prompt(`Rename ${oldName} to:`);
if (newName) renameAnchor(oldName, newName);
};

const handleDeleteAnchor = (name) => {
if (confirm(`Are you sure you want to delete the anchor: ${name}?`)) {
deleteAnchor(name);
}
};

return (

<div>
    <h3>Color Anchors</h3>
    <button onClick={handleAddAnchor}>Add Anchor</button>
    {Object.keys(colorAnchors).map((anchor) => (
      <div key={anchor} className="color-anchor">
        <label>{anchor.replace(/([A-Z])/g, " $1")}</label>
        <input
          type="color"
          value={colorAnchors[anchor]}
          onChange={(e) => handleColorChange(anchor, e.target.value)}
        />
        <button onClick={() => handleRenameAnchor(anchor)}>Rename</button>
        <button onClick={() => handleDeleteAnchor(anchor)}>Delete</button>
      </div>
    ))}
  </div>
);
