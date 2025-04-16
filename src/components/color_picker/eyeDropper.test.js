
// src/features/eyedropper/eyedropper.test.js
import { getColorFromCanvas } from "./eyedropper";

describe("Eye Dropper Feature", () => {
  it("returns the correct color from canvas", () => {
    const mockCanvas = document.createElement("canvas");
    const ctx = mockCanvas.getContext("2d");
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, 1, 1);
    const color = getColorFromCanvas(mockCanvas, 0, 0);
    expect(color).toBe("#ff0000");
  });

  it("handles transparent pixels gracefully", () => {
    const mockCanvas = document.createElement("canvas");
    const ctx = mockCanvas.getContext("2d");
    const color = getColorFromCanvas(mockCanvas, 0, 0);
    expect(color).toBe("rgba(0, 0, 0, 0)");
  });
});
