const adjustSaturation = (hex, factor) => {
const { r, g, b } = hexToRgb(hex);

// Convert RGB to HSL
const rNorm = r / 255;
const gNorm = g / 255;
const bNorm = b / 255;
const max = Math.max(rNorm, gNorm, bNorm);
const min = Math.min(rNorm, gNorm, bNorm);

const l = (max + min) / 2;
const s = l === 0 || l === 1 ? 0 : (max - min) / (1 - Math.abs(2 *l - 1));
const adjustedS = Math.min(Math.max(s* factor, 0), 1);

return hslToHex(h, adjustedS, l);
};

const harmonizePalette = (palette, factor) => palette.map((color) => adjustSaturation(color, factor));

export default harmonizePalette;
