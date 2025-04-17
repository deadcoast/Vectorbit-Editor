# Implementation Plan: Advanced Color Tools and Brush Enhancements

We will focus on developing indexed color mode, palette tools, and brush enhancements, providing detailed implementation steps and advanced functionality.

## 4. Advanced Color Tools

### 4.1 Indexed Color Mode

Objective:
Restrict artwork to a predefined palette, with automatic remapping for out-of-palette colors.

Implementation:

1. Predefined Palette:
   • Let users select or upload a palette to serve as the index.
1. Color Mapping:
   • Map all artwork colors to the closest color in the selected palette using Euclidean distance in RGB space.

### Add Color Mapping in File: src/utils/colorUtils.js

```javascript
const mapToPalette = (currentColor, palette) => {
  let closestColor = palette[0];

  let minDistance = Number.MAX_VALUE;

  palette.forEach((color) => {
    const distance = Math.sqrt(
      Math.pow(currentColor.r - color.r, 2) +
        Math.pow(currentColor.g - color.g, 2) +
        Math.pow(currentColor.b - color.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;

      closestColor = color;
    }
  });

  return closestColor;
};
```

### 4.2 Apply Indexed Mode

• On enabling indexed mode, remap all grid colors to the selected palette.

### Add Indexed Mode in File: src/frontend/Grid.js

```javascript
const applyIndexedColorMode = (palette) => {
  const updatedColors = { ...cellColors };

  Object.keys(updatedColors).forEach((index) => {
    const currentColor = updatedColors[index];

    updatedColors[index] = mapToPalette(currentColor, palette);
  });

  setCellColors(updatedColors);
};
```

### 4.2 Palette Blending

Objective:

Create a smooth transition between two palettes.

Implementation:

1. Blend Function:

• Interpolate between two palettes using a linear blending function.

### Add Blend Function in File: src/utils/colorUtils.js

```javascript
const blendPalettes = (palette1, palette2, steps) => {
  const blendedPalette = [];

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);

    blendedPalette.push({
      r: Math.round(palette1[i].r * (1 - t) + palette2[i].r * t),

      g: Math.round(palette1[i].g * (1 - t) + palette2[i].g * t),

      b: Math.round(palette1[i].b * (1 - t) + palette2[i].b * t),
    });
  }

  return blendedPalette;
};
```

### 4.3 Palette Locking

Objective:

Lock specific colors in a palette to prevent changes.

Implementation:

1. Lock State:

• Track locked colors in the palette.

### Add Palette Locking in File: src/frontend/PaletteLibrary.js

```javascript
const handleBlendPalettes = () => {
  const blended = blendPalettes(selectedPalette1, selectedPalette2, 10);

  setGeneratedPalette(blended);
};
```

### Step 4.3 Palette Locking

Objective:
Lock specific colors in a palette to prevent changes.

Implementation:

1. Lock State:
   • Track locked colors in the palette.

### 4.3 Add Palette Locking in File: src/frontend/PaletteLibrary.js

```javascript
const [lockedColors, setLockedColors] = useState([]);

const toggleColorLock = (color) => {
  setLockedColors((prev) =>
    prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
  );
};
```

### 4.4 Visual Lock Indicator

Objective:

Display a lock icon next to locked colors.

Implementation:

1. Visual Lock Indicator:
   • Display a lock icon next to locked colors.

### Add Lock Icon in File: src/frontend/PaletteLibrary.css

```css
.locked-color {

  border: 2px solid red;

}
```

### 4.4 Color Harmonies

Objective:

Generate harmonious palettes based on color theory (complementary, triadic, etc.).

Implementation:

Use the generateComplementary, generateAnalogous, and similar functions defined earlier to create palettes dynamically.

## 5. Brushes and Drawing Enhancements

### 5.1 Brush Customization

Objective:

Allow users to adjust opacity, flow, and edge softness.

Implementation:

1. Brush Settings Panel:

• Add sliders for opacity, flow, and softness.

### Add Brush Settings in File: src/frontend/Toolbar.js

```html
<div>
    <label>Opacity</label>

    <input     type="range"     min="0.1"     max="1"     step="0.1"    
  value={opacity}     onChange={(e) => setOpacity(e.target.value)}   />
</div>
```

### 5.2 Apply Settings

• Adjust the brush rendering logic to consider the settings.

### Apply Settings in File: src/frontend/Grid.js

ctx.globalAlpha = opacity;

ctx.filter = `blur(${softness}px)`;

5.2 Stencil Brushes

Objective:

Allow users to create and apply reusable stencils.

Implementation:

1. Stencil Creation:

• Let users select an area to save as a stencil.

### Add Stencil Creation in File: src/frontend/Grid.js

```javascript
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
```

### 2. Stencil Application

• Allow users to stamp the stencil onto the grid.

### Add Stencil Application in File: src/frontend/Grid.js

```javascript
const applyStencil = (x, y, stencil) => {
  const updatedColors = { ...cellColors };

  for (let i = 0; i < stencil.length; i++) {
    const index = (y + i / gridSize) * gridSize + (x + (i % gridSize));

    if (index >= 0 && index < gridSize * gridSize) {
      updatedColors[index] = stencil[i];
    }
  }

  setCellColors(updatedColors);
};
```

### 5.3 Randomized Brushes

Objective:

Generate textures like grass or foliage by introducing randomness.

Implementation:

Add randomness to brush stroke positions and colors.

### Add Randomized Brush in File: src/frontend/Grid.js

```javascript
const applyRandomizedBrush = (x, y) => {
  const randomOffsetX = Math.floor(Math.random() * 3 - 1); // Random offset (-1, 0, 1)

  const randomOffsetY = Math.floor(Math.random() * 3 - 1);

  const randomColor = modifyColor(activeColor, Math.random() * 20 - 10);

  applyBrush(x + randomOffsetX, y + randomOffsetY, randomColor);
};
```

### 6. Testing Plan

1. Advanced Color Tools:
   • Test indexed mode by limiting artwork to a predefined palette.
   • Verify palette blending produces smooth transitions.
   • Ensure locked colors remain unchanged when editing palettes.
1. Brush Enhancements:
   • Test opacity, flow, and edge softness.
   • Create, save, and apply stencils.
   • Verify randomness in textures generated by randomized brushes.
