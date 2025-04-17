import { useState } from "react";

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

```
// Validate HEX code
const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(hex);
if (isValidHex) {
  setCurrentColor(hex);
  onColorSelect(hex);
}
```

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
    <div className="recent-colors">
{recentColors.map((color) => (
\<span
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
  );
};

export default ColorPicker;
