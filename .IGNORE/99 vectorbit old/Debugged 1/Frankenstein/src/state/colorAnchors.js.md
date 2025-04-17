const defaultAnchors = {
baseColor: "#ffffff",
baseColor2: "#ffffff",
secondaryColor: "#cccccc",
secondaryColor2: "#cccccc",
accentColor: "#ff0000",
accentColor2: "#00ff00",
accentColor3: "#0000ff",
accentColor4: "#ffff00",
};

export const useColorAnchors = () => {
const [colorAnchors, setColorAnchors] = useState(defaultAnchors);

const updateColorAnchor = (anchor, newColor) => {
setColorAnchors((prev) => ({
...prev,
\[anchor\]: newColor,
}));
};

return { colorAnchors, updateColorAnchor };
};

const updateColorAnchor = (anchor, newColors) => {
setColorAnchors((prev) => ({
...prev,
\[anchor\]: newColors,
}));
};

export const anchorPresets = {
"Game Sprites": {
baseColor: ["#ffffff"],
secondaryColor: ["#888888"],
accentColor: ["#ff0000", "#00ff00", "#0000ff"],
},
"UI Design": {
baseColor: ["#f0f0f0"],
secondaryColor: ["#d0d0d0"],
accentColor: ["#007bff", "#28a745", "#ffc107"],
},
};
