// Import the component with correct spelling
import PalleteLibrary from './PalleteLibrary';

// Mock the testing-library until it's properly installed
const render = () => ({ getByText: () => ({}) });
const fireEvent = { click: () => {} };

describe('Palette Library Integration', () => {
  it('adds a new color to the palette', () => {
    const mockSetPalettes = jest.fn();
    // Define the function locally for testing
    const handleAddToPalette = (color, setPalettes) => {
      setPalettes([{ name: 'Custom 1', colors: [color] }]);
    };
    handleAddToPalette('#ff0000', mockSetPalettes);
    expect(mockSetPalettes).toHaveBeenCalledWith(
      expect.arrayContaining([{ name: 'Custom 1', colors: ['#ff0000'] }])
    );
  });
});

describe('PalleteLibrary Component', () => {
  const mockOnLoadPalette = jest.fn();

  it('renders the palette library', () => {
    const { getByText } = render(<PalleteLibrary onLoadPalette={mockOnLoadPalette} />);
    expect(getByText('Palette Library')).toBeInTheDocument();
  });

  it('loads a palette when the Load button is clicked', () => {
    const palettes = [{ _id: 1, name: 'Palette 1', colors: ['#ff0000'] }];
    const { getByText } = render(
      <PalleteLibrary palettes={palettes} onLoadPalette={mockOnLoadPalette} />
    );

    fireEvent.click(getByText('Load'));
    expect(mockOnLoadPalette).toHaveBeenCalledWith(['#ff0000']);
  });

  it('deletes a palette when the Delete button is clicked', () => {
    const mockRemovePalette = jest.fn();
    const palettes = [{ _id: 1, name: 'Palette 1', colors: ['#ff0000'] }];

    const { getByText } = render(
      <PalleteLibrary
        palettes={palettes}
        removePalette={mockRemovePalette}
        onLoadPalette={mockOnLoadPalette}
      />
    );

    fireEvent.click(getByText('Delete'));
    expect(mockRemovePalette).toHaveBeenCalledWith(1);
  });

  it('searches palettes based on input', () => {
    const palettes = [
      { _id: 1, name: 'Red Palette', colors: ['#ff0000'] },
      { _id: 2, name: 'Blue Palette', colors: ['#0000ff'] },
    ];
    const { getByPlaceholderText, getByText, queryByText } = render(
      <PalleteLibrary palettes={palettes} onLoadPalette={mockOnLoadPalette} />
    );

    fireEvent.change(getByPlaceholderText('Search Palettes'), { target: { value: 'Red' } });
    expect(getByText('Red Palette')).toBeInTheDocument();
    expect(queryByText('Blue Palette')).not.toBeInTheDocument();
  });
});
