import { render, fireEvent } from '@testing-library/react';

import CollaborationManager from './CollaborationManager';

describe('CollaborationManager Component', () => {
  const mockOnInvite = jest.fn();
  const mockOnRemoveUser = jest.fn();

  it('renders the collaboration manager', () => {
    const { getByText } = render(
      <CollaborationManager onInvite={mockOnInvite} onRemoveUser={mockOnRemoveUser} />
    );
    expect(getByText('Collaboration Settings')).toBeInTheDocument();
  });

  it('calls onInvite when inviting a user', () => {
    const { getByPlaceholderText, getByText } = render(
      <CollaborationManager onInvite={mockOnInvite} onRemoveUser={mockOnRemoveUser} />
    );

    fireEvent.change(getByPlaceholderText('Enter user email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(getByText('Invite'));

    expect(mockOnInvite).toHaveBeenCalledWith('test@example.com');
  });

  it('removes a user when Remove button is clicked', () => {
    const users = [{ id: 1, email: 'test@example.com' }];
    const { getByText } = render(
      <CollaborationManager users={users} onRemoveUser={mockOnRemoveUser} />
    );

    fireEvent.click(getByText('Remove'));
    expect(mockOnRemoveUser).toHaveBeenCalledWith(1);
  });
});
