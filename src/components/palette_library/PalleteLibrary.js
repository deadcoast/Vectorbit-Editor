
import React from "react";
import "./PaletteLibrary.css";

const PaletteLibrary = ({ palettes, onLoadPalette, setPalettes }) => {
  const handleAddToPalette = (newColor) => {
    const newPalette = {
      name: `Custom Palette ${palettes.length + 1}`,
      colors: [newColor],
    };
    setPalettes((prev) => [...prev, newPalette]);
  };

  const handleRemovePalette = (paletteName) => {
    setPalettes((prev) => prev.filter((palette) => palette.name !== paletteName));
  };

  return (
    <div className="palette-container">
      <h3>Palette Library</h3>
      <div className="palette-list">
        {palettes.map((palette) => (
          <div key={palette.name} className="palette-item">
            <div
              className="palette-header"
              onClick={() => onLoadPalette(palette.colors)}
            >
              <span>{palette.name}</span>
              <button
                className="remove-palette-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePalette(palette.name);
                }}
              >
                &times;
              </button>
            </div>
            <div className="palette-colors">
              {palette.colors.map((color, index) => (
                <div
                  key={index}
                  className="palette-color"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        className="add-palette-button"
        onClick={() => handleAddToPalette("#000000")}
      >
        + Add Palette
      </button>
    </div>
  );
};

export default PaletteLibrary;
