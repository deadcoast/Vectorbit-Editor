
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import LayerManager from "../components/LayerManager";

test("adds a new layer", () => {
  const { getByText } = render(
    <LayerManager layers={[]} setLayers={jest.fn()} activeLayer="layer-1" setActiveLayer={jest.fn()} />
  );
  const addButton = getByText("Add Layer");
  fireEvent.click(addButton);

  expect(getByText("Layer 1")).toBeInTheDocument();
});

test("deletes a layer", () => {
  const setLayers = jest.fn();
  const { getByText } = render(
    <LayerManager
      layers={[{ id: "layer-1", name: "Layer 1", visible: true, opacity: 1, gridData: {} }]}
      setLayers={setLayers}
      activeLayer="layer-1"
      setActiveLayer={jest.fn()}
    />
  );
  const deleteButton = getByText("Delete");
  fireEvent.click(deleteButton);

  expect(setLayers).toHaveBeenCalledWith([]);
});
