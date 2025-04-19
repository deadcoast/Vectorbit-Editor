import { render, fireEvent } from '@testing-library/react';

import ColorPicker from './ColorPicker';

describe('ColorPicker Component', () => {
  const mockSetActiveColor = jest.fn();
  const mockAddToPalette = jest.fn();
  const mockAssignToAnchor = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the color picker and gradient generator', () => {
    const { getByText } = render(
      <ColorPicker
        activeColor="#ffffff"
        setActiveColor={mockSetActiveColor}
        onAddToPalette={mockAddToPalette}
        onAssignToAnchor={mockAssignToAnchor}
      />
    );
    expect(getByText('Save Gradient')).toBeInTheDocument();
  });

  it('updates the active color on color change', () => {
    const { getByRole } = render(
      <ColorPicker
        activeColor="#ffffff"
        setActiveColor={mockSetActiveColor}
        onAddToPalette={mockAddToPalette}
        onAssignToAnchor={mockAssignToAnchor}
      />
    );
    fireEvent.change(getByRole('textbox'), { target: { value: '#ff0000' } });
    expect(mockSetActiveColor).toHaveBeenCalledWith('#ff0000');
  });

  it('renders the gradient generator inputs and updates gradients', () => {
    const { getByText, getByDisplayValue } = render(
      <ColorPicker
        activeColor="#ffffff"
        setActiveColor={mockSetActiveColor}
        onAddToPalette={mockAddToPalette}
        onAssignToAnchor={mockAssignToAnchor}
      />
    );
    const gradientStartInput = getByDisplayValue('#ffffff');
    const gradientEndInput = getByDisplayValue('#000000');
    const saveGradientButton = getByText('Save Gradient');

    fireEvent.change(gradientStartInput, { target: { value: '#ff0000' } });
    fireEvent.change(gradientEndInput, { target: { value: '#00ff00' } });
    fireEvent.click(saveGradientButton);

    expect(mockAddToPalette).toHaveBeenCalledWith('linear-gradient(to right, #ff0000, #00ff00)');
  });

  it('adds selected colors to recent colors history', () => {
    const { getByRole, container } = render(
      <ColorPicker
        activeColor="#ffffff"
        setActiveColor={mockSetActiveColor}
        onAddToPalette={mockAddToPalette}
        onAssignToAnchor={mockAssignToAnchor}
      />
    );

    const colorInput = getByRole('textbox');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    fireEvent.change(colorInput, { target: { value: '#00ff00' } });

    const recentColors = container.querySelectorAll('.color-history-item');
    expect(recentColors.length).toBe(2);
    expect(recentColors[0].style.backgroundColor).toBe('rgb(0, 255, 0)');
    expect(recentColors[1].style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('handles Eye Dropper tool interaction', () => {
    const mockCanvas = document.createElement('canvas');
    const mockGridRef = { current: mockCanvas };

    const { getByTitle } = render(
      <ColorPicker
        activeColor="#ffffff"
        gridRef={mockGridRef}
        setActiveColor={mockSetActiveColor}
        onAddToPalette={mockAddToPalette}
        onAssignToAnchor={mockAssignToAnchor}
      />
    );

    const eyeDropperButton = getByTitle('Eye Dropper Tool');
    expect(eyeDropperButton).toBeInTheDocument();

    fireEvent.mouseDown(eyeDropperButton);

    // Verify if the color was set (mock canvas interaction)
    expect(mockSetActiveColor).toHaveBeenCalled();
  });

  it('calls onAddToPalette when Add to Palette is clicked', () => {
    const { getByText } = render(
      <ColorPicker
        activeColor="#ff0000"
        setActiveColor={mockSetActiveColor}
        onAddToPalette={mockAddToPalette}
        onAssignToAnchor={mockAssignToAnchor}
      />
    );

    fireEvent.click(getByText('Add to Palette'));
    expect(mockAddToPalette).toHaveBeenCalledWith('#ff0000');
  });

  it('calls onAssignToAnchor when Assign to Anchor is clicked', () => {
    const { getByText } = render(
      <ColorPicker
        activeColor="#ff0000"
        setActiveColor={mockSetActiveColor}
        onAddToPalette={mockAddToPalette}
        onAssignToAnchor={mockAssignToAnchor}
      />
    );

    fireEvent.click(getByText('Assign to Anchor'));
    expect(mockAssignToAnchor).toHaveBeenCalledWith('#ff0000');
  });
});
