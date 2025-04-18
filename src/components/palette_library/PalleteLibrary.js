import React from 'react';
import './PaletteLibrary.css';

const PaletteLibrary = ({ palettes, onLoadPalette, setPalettes }) => {
  const handleAddToPalette = newColor => {
    const newPalette = {
      name: `Custom Palette ${palettes.length + 1}`,
      colors: [newColor],
    };
    setPalettes(prev => [...prev, newPalette]);
  };

  const handleRemovePalette = paletteName => {
    setPalettes(prev => prev.filter(palette => palette.name !== paletteName));
  };

  // Add keyboard event handlers for accessibility
  const handleKeyDown = (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  };

  return (
    <div className="palette-container">
      <h3>Palette Library</h3>
      <div className="palette-list">
        {palettes.map(palette => (
          <div key={palette.name} className="palette-item">
            <button 
              type="button"
              className="palette-header"
              onClick={() => onLoadPalette(palette.colors)}
              onKeyDown={(e) => handleKeyDown(e, () => onLoadPalette(palette.colors))}
              aria-label={`Load ${palette.name} palette`}
              tabIndex="0">
              <span>{palette.name}</span>
              <button
                className="remove-palette-button"
                onClick={e => {
                  e.stopPropagation();
                  handleRemovePalette(palette.name);
                }}
              >
                &times;
              </button>
            </button>
            <div className="palette-colors">
              {palette.colors.map((color, index) => (
                <div key={index} className="palette-color" style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="add-palette-button" onClick={() => handleAddToPalette('#000000')}>
        + Add Palette
      </button>
    </div>
  );
};

export default PaletteLibrary;
