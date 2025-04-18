import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import AdvancedColorWheel from './AdvancedColorWheel';

describe('AdvancedColorWheel Component', () => {
  it('renders the color picker and add-to-palette button', () => {
    const { getByText } = render(
      <AdvancedColorWheel
        activeColor="#ffffff"
        setActiveColor={jest.fn()}
        onAddToPalette={jest.fn()}
      />
    );
    expect(getByText('Add to Palette')).toBeInTheDocument();
  });

  it('updates color on change', () => {
    const mockSetActiveColor = jest.fn();
    const { getByRole } = render(
      <AdvancedColorWheel
        activeColor="#ffffff"
        setActiveColor={mockSetActiveColor}
        onAddToPalette={jest.fn()}
      />
    );
    fireEvent.change(getByRole('textbox'), { target: { value: '#ff0000' } });
    expect(mockSetActiveColor).toHaveBeenCalledWith('#ff0000');
  });
});
