
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHex = (r, g, b) => {
  const toHex = (value) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rotateHue = (hex, degree) => {
  const { r, g, b } = hexToRgb(hex);

  // Convert RGB to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = h * 60;
  }

  const newHue = (h + degree) % 360;
  return hslToHex(newHue, max, min);
};

const generateComplementary = (baseColor) => [baseColor, rotateHue(baseColor, 180)];

const generateAnalogous = (baseColor) => [
  baseColor,
  rotateHue(baseColor, -30),
  rotateHue(baseColor, 30),
];

const generateTriadic = (baseColor) => [
  baseColor,
  rotateHue(baseColor, 120),
  rotateHue(baseColor, 240),
];

const generateTetradic = (baseColor) => [
  baseColor,
  rotateHue(baseColor, 90),
  rotateHue(baseColor, 180),
  rotateHue(baseColor, 270),
];

export {
  generateComplementary,
  generateAnalogous,
  generateTriadic,
  generateTetradic,
};
