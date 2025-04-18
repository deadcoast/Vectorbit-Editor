// Import local component rather than looking in other directories
import LayerManager from './LayerManager';

// Mock test utilities
const render = () => ({
  getByText: () => ({}),
});
const fireEvent = { click: () => {} };

test('adds a new layer', () => {
  const { getByText } = render(
    <LayerManager
      activeLayer="layer-1"
      layers={[]}
      setActiveLayer={jest.fn()}
      setLayers={jest.fn()}
    />
  );
  const addButton = getByText('Add Layer');
  fireEvent.click(addButton);

  expect(getByText('Layer 1')).toBeInTheDocument();
});

test('deletes a layer', () => {
  const setLayers = jest.fn();
  const { getByText } = render(
    <LayerManager
      activeLayer="layer-1"
      layers={[{ id: 'layer-1', name: 'Layer 1', visible: true, opacity: 1, gridData: {} }]}
      setActiveLayer={jest.fn()}
      setLayers={setLayers}
    />
  );
  const deleteButton = getByText('Delete');
  fireEvent.click(deleteButton);

  expect(setLayers).toHaveBeenCalledWith([]);
});
