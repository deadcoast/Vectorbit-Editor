
import { useState, useEffect } from "react";
import {
  fetchPalettes,
  createPalette,
  deletePalette,
  updatePaletteTags,
  togglePaletteSharing,
} from "../api/api";
import {
  generateComplementary,
  generateAnalogous,
  generateTriadic,
  generateTetradic,
} from "../utils/colorTheory";
import generateRandomPalette from "../utils/randomPalette";
import harmonizePalette from "../utils/colorHarmony";

const PaletteLibrary = ({ onLoadPalette }) => {
  const [baseColor, setBaseColor] = useState("#ff0000");
  const [generatedPalette, setGeneratedPalette] = useState([]);
  const [palettes, setPalettes] = useState([]);
  const [paletteName, setPaletteName] = useState("");
  const [currentColors, setCurrentColors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("alphabetical");
  const [lockedColors, setLockedColors] = useState([]);
  const [editingPalette, setEditingPalette] = useState(null);

  // Load palettes on component mount
  useEffect(() => {
    const loadPalettes = async () => {
      try {
        const fetchedPalettes = await fetchPalettes();
        setPalettes(fetchedPalettes);
      } catch (err) {
        alert("Failed to load palettes.");
      }
    };
    loadPalettes();
  }, []);

  const handleGeneratePalette = (scheme) => {
    let newPalette = [];
    if (scheme === "complementary") newPalette = generateComplementary(baseColor);
    if (scheme === "analogous") newPalette = generateAnalogous(baseColor);
    if (scheme === "triadic") newPalette = generateTriadic(baseColor);
    if (scheme === "tetradic") newPalette = generateTetradic(baseColor);
    setGeneratedPalette(newPalette);
  };

  const handleGenerateRandomPalette = () => {
    const randomPalette = generateRandomPalette();
    setGeneratedPalette(randomPalette);
  };

  const handleHarmonizePalette = () => {
    const harmonized = harmonizePalette(generatedPalette, 1.2); // 20% more saturation
    setGeneratedPalette(harmonized);
  };

  const toggleColorLock = (color) => {
    setLockedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const savePalette = async () => {
    try {
      const newPalette = await createPalette({ name: paletteName, colors: currentColors });
      setPalettes([...palettes, newPalette]);
      setPaletteName("");
      alert("Palette saved successfully!");
    } catch (err) {
      alert("Failed to save palette.");
    }
  };

  const removePalette = async (id) => {
    try {
      await deletePalette(id);
      setPalettes(palettes.filter((palette) => palette._id !== id));
      alert("Palette deleted successfully!");
    } catch (err) {
      alert("Failed to delete palette.");
    }
  };

  const editPalette = async (paletteId, updatedColors) => {
    try {
      const updatedPalette = await updatePaletteTags(paletteId, { colors: updatedColors });
      setPalettes(palettes.map((p) => (p._id === paletteId ? updatedPalette : p)));
      alert("Palette updated successfully!");
    } catch (err) {
      alert("Failed to update palette.");
    }
  };

  const updateTags = async (paletteId, tags) => {
    try {
      const updatedPalette = await updatePaletteTags(paletteId, { tags });
      setPalettes(palettes.map((p) => (p._id === paletteId ? updatedPalette : p)));
      alert("Tags updated successfully!");
    } catch (err) {
      alert("Failed to update tags.");
    }
  };

  const toggleSharing = async (paletteId) => {
    try {
      const updatedPalette = await togglePaletteSharing(paletteId);
      setPalettes(palettes.map((p) => (p._id === paletteId ? updatedPalette : p)));
      alert(`Palette ${updatedPalette.shared ? "shared" : "unshared"} successfully!`);
    } catch (err) {
      alert("Failed to update sharing status.");
    }
  };

  const filteredPalettes = palettes
    .filter((palette) =>
      palette.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "alphabetical") return a.name.localeCompare(b.name);
      if (sortOption === "date") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div>
      <h3>Palette Generator</h3>
      <input
        type="color"
        value={baseColor}
        onChange={(e) => setBaseColor(e.target.value)}
      />
      <button onClick={() => handleGeneratePalette("complementary")}>
        Complementary
      </button>
      <button onClick={() => handleGeneratePalette("analogous")}>Analogous</button>
      <button onClick={() => handleGeneratePalette("triadic")}>Triadic</button>
      <button onClick={() => handleGeneratePalette("tetradic")}>Tetradic</button>
      <button onClick={handleGenerateRandomPalette}>Generate Random Palette</button>
      <button onClick={handleHarmonizePalette}>Harmonize Palette</button>
      <div className="palette-preview">
        {generatedPalette.map((color) => (
          <span
            key={color}
            style={{
              backgroundColor: color,
              width: "20px",
              height: "20px",
              display: "inline-block",
              marginRight: "5px",
            }}
          />
        ))}
      </div>

      <h3>Palette Library</h3>
      <div className="palette-controls">
        <input
          type="text"
          placeholder="Search Palettes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="alphabetical">Sort by Name</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>
      <div>
        <input
          type="text"
          placeholder="Palette Name"
          value={paletteName}
          onChange={(e) => setPaletteName(e.target.value)}
        />
        <button onClick={savePalette}>Save Palette</button>
      </div>
      <ul>
        {filteredPalettes.map((palette) => (
          <li key={palette._id}>
            <div className="palette-preview">
              {palette.colors.map((color) => (
                <span
                  key={color}
                  style={{
                    backgroundColor: color,
                    width: "20px",
                    height: "20px",
                    display: "inline-block",
                    marginRight: "5px",
                  }}
                />
              ))}
            </div>
            <span>{palette.name}</span>
            <button onClick={() => onLoadPalette(palette.colors)}>Load</button>
            <button onClick={() => removePalette(palette._id)}>Delete</button>
            <button onClick={() => toggleSharing(palette._id)}>
              {palette.shared ? "Unshare" : "Share"}
            </button>
            <div>
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                defaultValue={palette.tags.join(", ")}
                onBlur={(e) =>
                  updateTags(palette._id, e.target.value.split(",").map((tag) => tag.trim()))
                }
              />
            </div>
          </li>
        ))}
      </ul>
      {editingPalette && (
        <PaletteEditor
          palette={editingPalette}
          onSave={(updatedColors) => {
            editPalette(editingPalette._id, updatedColors);
            setEditingPalette(null);
          }}
          onCancel={() => setEditingPalette(null)}
        />
      )}
    </div>
  );
};

export default PaletteLibrary;





import { useState, useEffect } from "react";
import { fetchPalettes, createPalette, deletePalette } from "../api/api";
import { updatePaletteTags, togglePaletteSharing } from "../api/api";
import {
  generateComplementary,
  generateAnalogous,
  generateTriadic,
  generateTetradic,
} from "../utils/colorTheory";
import generateRandomPalette from "../utils/randomPalette";
import harmonizePalette from "../utils/colorHarmony";

const assignToAnchor = (color, anchorName) => {
  updateColorAnchor(anchorName, color);
  updateGridWithAnchor(anchorName, color);
};

<div className="palette-library">
  {palette.map((color) => (
    <div key={color} className="palette-color">
      <div
        style={{ backgroundColor: color }}
        onClick={() => assignToAnchor(color, activeAnchor)}
      />
    </div>
  ))}
</div>;

const handleBlendPalettes = () => {
  const blended = blendPalettes(selectedPalette1, selectedPalette2, 10);
  setGeneratedPalette(blended);
};

const [lockedColors, setLockedColors] = useState([]);

const toggleColorLock = (color) => {
  setLockedColors((prev) =>
    prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
  );
};

const handleHarmonizePalette = () => {
  const harmonized = harmonizePalette(generatedPalette, 1.2); // 20% more saturation
  setGeneratedPalette(harmonized);
};

<button onClick={handleHarmonizePalette}>Harmonize Palette</button>;

const handleGenerateRandomPalette = () => {
  const randomPalette = generateRandomPalette();
  setGeneratedPalette(randomPalette);
};

const PaletteLibrary = ({ onLoadPalette }) => {
  const [baseColor, setBaseColor] = useState("#ff0000");
  const [generatedPalette, setGeneratedPalette] = useState([]);

  const handleGeneratePalette = (scheme) => {
    let newPalette = [];
    if (scheme === "complementary") newPalette = generateComplementary(baseColor);
    if (scheme === "analogous") newPalette = generateAnalogous(baseColor);
    if (scheme === "triadic") newPalette = generateTriadic(baseColor);
    if (scheme === "tetradic") newPalette = generateTetradic(baseColor);

    setGeneratedPalette(newPalette);
  };

  return (
    <div>
      <h3>Palette Generator</h3>
      <input
        type="color"
        value={baseColor}
        onChange={(e) => setBaseColor(e.target.value)}
      />
      <button onClick={() => handleGeneratePalette("complementary")}>Complementary</button>
      <button onClick={() => handleGeneratePalette("analogous")}>Analogous</button>
      <button onClick={() => handleGeneratePalette("triadic")}>Triadic</button>
      <button onClick={() => handleGeneratePalette("tetradic")}>Tetradic</button>
      <div className="palette-preview">
        {generatedPalette.map((color) => (
          <span
            key={color}
            style={{
              backgroundColor: color,
              width: "20px",
              height: "20px",
              display: "inline-block",
              marginRight: "5px",
            }}
          />
        ))}
      </div>
    </div>
  );
};

const editPalette = async (paletteId, updatedColors) => {
  try {
    const updatedPalette = await updatePaletteTags(paletteId, { colors: updatedColors });
    setPalettes(palettes.map((p) => (p._id === paletteId ? updatedPalette : p)));
    alert("Palette updated successfully!");
  } catch (err) {
    alert("Failed to update palette.");
  }
};

const PaletteLibrary = ({ onLoadPalette }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("alphabetical");

  const filteredPalettes = palettes
    .filter((palette) =>
      palette.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "alphabetical") return a.name.localeCompare(b.name);
      if (sortOption === "date") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div>
      <div className="palette-controls">
        <input
          type="text"
          placeholder="Search Palettes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="alphabetical">Sort by Name</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>
      <ul>
        {filteredPalettes.map((palette) => (
          <li key={palette._id}>
            <span>{palette.name}</span>
            <button onClick={() => onLoadPalette(palette.colors)}>Load</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PaletteLibrary = ({ onLoadPalette }) => {
  const updateTags = async (paletteId, tags) => {
    try {
      const updatedPalette = await updatePaletteTags(paletteId, { tags });
      setPalettes(palettes.map((p) => (p._id === paletteId ? updatedPalette : p)));
      alert("Tags updated successfully!");
    } catch (err) {
      alert("Failed to update tags.");
    }
  };

  const toggleSharing = async (paletteId) => {
    try {
      const updatedPalette = await togglePaletteSharing(paletteId);
      setPalettes(palettes.map((p) => (p._id === paletteId ? updatedPalette : p)));
      alert(`Palette ${updatedPalette.shared ? "shared" : "unshared"} successfully!`);
    } catch (err) {
      alert("Failed to update sharing status.");
    }
  };

  return (
    <div>
      <h3>Palette Library</h3>
      <ul>
        {palettes.map((palette) => (
          <li key={palette._id}>
            <span>{palette.name}</span>
            <button onClick={() => onLoadPalette(palette.colors)}>Load</button>
            <button onClick={() => toggleSharing(palette._id)}>
              {palette.shared ? "Unshare" : "Share"}
            </button>
            <div>
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                defaultValue={palette.tags.join(", ")}
                onBlur={(e) =>
                  updateTags(palette._id, e.target.value.split(",").map((tag) => tag.trim()))
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const PaletteLibrary = ({ onLoadPalette }) => {
  const [palettes, setPalettes] = useState([]);
  const [paletteName, setPaletteName] = useState("");
  const [currentColors, setCurrentColors] = useState([]);

  useEffect(() => {
    const loadPalettes = async () => {
      try {
        const fetchedPalettes = await fetchPalettes();
        setPalettes(fetchedPalettes);
      } catch (err) {
        alert("Failed to load palettes.");
      }
    };
    loadPalettes();
  }, []);

  const savePalette = async () => {
    try {
      const newPalette = await createPalette({ name: paletteName, colors: currentColors });
      setPalettes([...palettes, newPalette]);
      setPaletteName("");
      alert("Palette saved successfully!");
    } catch (err) {
      alert("Failed to save palette.");
    }
  };

  const removePalette = async (id) => {
    try {
      await deletePalette(id);
      setPalettes(palettes.filter((palette) => palette._id !== id));
      alert("Palette deleted successfully!");
    } catch (err) {
      alert("Failed to delete palette.");
    }
  };

  return (
    <div>
      <h3>Palette Library</h3>
      <div>
        <input
          type="text"
          placeholder="Palette Name"
          value={paletteName}
          onChange={(e) => setPaletteName(e.target.value)}
        />
        <button onClick={savePalette}>Save Palette</button>
      </div>
      <ul>
        {palettes.map((palette) => (
          <li key={palette._id}>
            <span>{palette.name}</span>
            <button onClick={() => onLoadPalette(palette.colors)}>Load</button>
            <button onClick={() => removePalette(palette._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
    <ul>
  {filteredPalettes.map((palette) => (
    <li key={palette._id}>
      <div className="palette-preview">
        {palette.colors.map((color) => (
          <span
            key={color}
            style={{
              backgroundColor: color,
              width: "20px",
              height: "20px",
              display: "inline-block",
              marginRight: "5px",
            }}
          />
        ))}
      </div>
      <span>{palette.name}</span>
      <button onClick={() => onLoadPalette(palette.colors)}>Load</button>
    </li>
  ))}
</ul>
<button onClick={() => setEditingPalette(palette)}>Edit</button>

{editingPalette && (
  <PaletteEditor
    palette={editingPalette}
    onSave={(updatedColors) => {
      editPalette(editingPalette._id, updatedColors);
      setEditingPalette(null);
    }}
    onCancel={() => setEditingPalette(null)}
  />
)}
<button onClick={handleGenerateRandomPalette}>Generate Random Palette</button>
  );
};

export default PaletteLibrary;
