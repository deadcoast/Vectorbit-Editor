
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import PaletteLibrary from "./PaletteLibrary";

describe("Palette Library Integration", () => {
  it("adds a new color to the palette", () => {
    const mockSetPalettes = jest.fn();
    handleAddToPalette("#ff0000", mockSetPalettes);
    expect(mockSetPalettes).toHaveBeenCalledWith(
      expect.arrayContaining([{ name: "Custom 1", colors: ["#ff0000"] }])
    );
  });
});

describe("PaletteLibrary Component", () => {
  const mockOnLoadPalette = jest.fn();

  it("renders the palette library", () => {
    const { getByText } = render(<PaletteLibrary onLoadPalette={mockOnLoadPalette} />);
    expect(getByText("Palette Library")).toBeInTheDocument();
  });

  it("loads a palette when the Load button is clicked", () => {
    const palettes = [{ _id: 1, name: "Palette 1", colors: ["#ff0000"] }];
    const { getByText } = render(
      <PaletteLibrary palettes={palettes} onLoadPalette={mockOnLoadPalette} />
    );

    fireEvent.click(getByText("Load"));
    expect(mockOnLoadPalette).toHaveBeenCalledWith(["#ff0000"]);
  });

  it("deletes a palette when the Delete button is clicked", () => {
    const mockRemovePalette = jest.fn();
    const palettes = [{ _id: 1, name: "Palette 1", colors: ["#ff0000"] }];

    const { getByText } = render(
      <PaletteLibrary
        palettes={palettes}
        onLoadPalette={mockOnLoadPalette}
        removePalette={mockRemovePalette}
      />
    );

    fireEvent.click(getByText("Delete"));
    expect(mockRemovePalette).toHaveBeenCalledWith(1);
  });

  it("searches palettes based on input", () => {
    const palettes = [
      { _id: 1, name: "Red Palette", colors: ["#ff0000"] },
      { _id: 2, name: "Blue Palette", colors: ["#0000ff"] },
    ];
    const { getByPlaceholderText, getByText, queryByText } = render(
      <PaletteLibrary palettes={palettes} onLoadPalette={mockOnLoadPalette} />
    );

    fireEvent.change(getByPlaceholderText("Search Palettes"), { target: { value: "Red" } });
    expect(getByText("Red Palette")).toBeInTheDocument();
    expect(queryByText("Blue Palette")).not.toBeInTheDocument();
  });
});
