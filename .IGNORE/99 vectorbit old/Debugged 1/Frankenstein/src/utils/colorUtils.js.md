

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
