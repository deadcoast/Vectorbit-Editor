
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Grid from "./Grid";
import { floodFill, toggleGridOverlay } from "./GridManager";

describe("Grid Component with Flood Fill and Overlay Toggle", () => {
  const mockSetLayers = jest.fn();
  const mockSetGridOverlay = jest.fn();
  const mockLayers = [
    {
      id: 1,
      gridData: {
        "0,0": "#000000",
        "1,0": "#000000",
        "1,1": "#FFFFFF",
      },
    },
  ];

  const defaultProps = {
    gridSize: 4,
    layers: mockLayers,
    activeLayer: 1,
    setLayers: mockSetLayers,
    activeTool: "fill",
    activeColor: "#FF0000",
    gridOverlay: false,
    setGridOverlay: mockSetGridOverlay,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fills the connected region with the active color using the fill tool", () => {
    const { container } = render(<Grid {...defaultProps} />);
    const cells = container.querySelectorAll(".grid-cell");
    fireEvent.click(cells[0]); // Click on the top-left cell (0, 0)

    expect(mockSetLayers).toHaveBeenCalledWith([
      {
        id: 1,
        gridData: {
          "0,0": "#FF0000", // Filled
          "1,0": "#FF0000", // Filled
          "1,1": "#FFFFFF", // Unchanged
        },
      },
    ]);
  });

  it("does not fill cells that do not match the target color", () => {
    const { container } = render(<Grid {...defaultProps} />);
    const cells = container.querySelectorAll(".grid-cell");
    fireEvent.click(cells[3]); // Click on a cell outside the region (3, 0)

    expect(mockSetLayers).toHaveBeenCalledWith([
      {
        id: 1,
        gridData: {
          "0,0": "#000000", // Unchanged
          "1,0": "#000000", // Unchanged
          "1,1": "#FFFFFF", // Unchanged
        },
      },
    ]);
  });

  it("toggles the grid overlay on and off", () => {
    const { getByText } = render(<Grid {...defaultProps} />);
    const toggleButton = getByText("Show Grid");

    fireEvent.click(toggleButton); // Enable overlay
    expect(mockSetGridOverlay).toHaveBeenCalledWith(true);

    fireEvent.click(toggleButton); // Disable overlay
    expect(mockSetGridOverlay).toHaveBeenCalledWith(false);
  });
});
