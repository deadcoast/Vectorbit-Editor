
// File: src/components/Toolbar/BrushTool.js

/**
 * Applies a brush stroke based on an anchor.
 *
 * @param {number} x - X-coordinate of the cell.
 * @param {number} y - Y-coordinate of the cell.
 * @param {string} anchorName - The name of the anchor to use.
 * @param {number} gridSize - The size of the grid.
 * @param {Object} cellColors - The current grid colors.
 * @param {Object} colorAnchors - The available color anchors.
 * @param {Function} setCellColors - State setter for cell colors.
 */
const applyBrushWithAnchor = (x, y, anchorName, gridSize, cellColors, colorAnchors, setCellColors) => {
  const updatedColors = { ...cellColors };
  const index = y * gridSize + x;

  if (index >= 0 && index < gridSize * gridSize) {
    updatedColors[index] = colorAnchors[anchorName];
  }

  setCellColors(updatedColors);
};

/**
 * Applies a brush stroke based on brush type.
 *
 * @param {number} x - X-coordinate of the cell.
 * @param {number} y - Y-coordinate of the cell.
 * @param {number} gridSize - The size of the grid.
 * @param {string} brushType - The type of brush to use (filled, outline, patterned, gradient).
 * @param {string} activeColor - The active color of the brush.
 * @param {Array} cellColors - The current grid colors.
 * @param {Function} setCellColors - State setter for cell colors.
 */
const applyBrushStroke = (x, y, gridSize, brushType, activeColor, cellColors, setCellColors) => {
  const updatedColors = [...cellColors];
  const index = y * gridSize + x;

  if (index >= 0 && index < cellColors.length) {
    if (brushType === "filled") {
      updatedColors[index] = activeColor;
    } else if (brushType === "outline") {
      const neighbors = [
        index - 1,
        index + 1,
        index - gridSize,
        index + gridSize,
      ];
      neighbors.forEach((neighbor) => {
        if (neighbor >= 0 && neighbor < cellColors.length) {
          updatedColors[neighbor] = activeColor;
        }
      });
    } else if (brushType === "patterned") {
      updatedColors[index] = index % 2 === 0 ? activeColor : null;
    } else if (brushType === "gradient") {
      const gradientColors = ["#FFAAAA", "#FF8888", activeColor];
      gradientColors.forEach((color, i) => {
        const gradientIndex = index + i - 1;
        if (gradientIndex >= 0 && gradientIndex < cellColors.length) {
          updatedColors[gradientIndex] = color;
        }
      });
    }
    setCellColors(updatedColors);
  }
};

/**
 * Renders a select dropdown for choosing an active color anchor.
 *
 * @param {Object} colorAnchors - The available color anchors.
 * @param {Function} setActiveAnchor - State setter for the active anchor.
 * @returns {JSX.Element} - The rendered dropdown.
 */
const renderAnchorSelector = (colorAnchors, setActiveAnchor) => (
  <select onChange={(e) => setActiveAnchor(e.target.value)}>
    {Object.keys(colorAnchors).map((anchorName) => (
      <option key={anchorName} value={anchorName}>
        {anchorName.replace(/([A-Z])/g, " $1")}
      </option>
    ))}
  </select>
);

/**
 * Renders a brush size selector for dynamic brush size adjustment.
 *
 * @param {number} brushSize - The current brush size.
 * @param {Function} setBrushSize - State setter for the brush size.
 * @returns {JSX.Element} - The rendered brush size selector.
 */
const renderBrushSizeSelector = (brushSize, setBrushSize) => (
  <div className="brush-size-selector">
    <label>
      Brush Size:
      <input
        type="number"
        min="1"
        max="10"
        value={brushSize}
        onChange={(e) => setBrushSize(Number(e.target.value))}
      />
    </label>
  </div>
);

/**
 * Renders a dropdown to select the brush type.
 *
 * @param {string} brushType - The current brush type.
 * @param {Function} setBrushType - State setter for the brush type.
 * @returns {JSX.Element} - The rendered brush type selector.
 */
const renderBrushTypeSelector = (brushType, setBrushType) => (
  <div className="brush-type-selector">
    <label>
      Brush Type:
      <select
        value={brushType}
        onChange={(e) => setBrushType(e.target.value)}
      >
        <option value="filled">Filled</option>
        <option value="outline">Outline</option>
        <option value="patterned">Patterned</option>
        <option value="gradient">Gradient</option>
      </select>
    </label>
  </div>
);

// Export functions for use in other parts of the app
export {
  applyBrushWithAnchor,
  applyBrushStroke,
  renderAnchorSelector,
  renderBrushSizeSelector,
  renderBrushTypeSelector,
};
