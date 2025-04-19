import PropTypes from 'prop-types';
import { createElement } from 'react';

/**
 * CollaboratorsList component displays the list of active collaborators
 */
const CollaboratorsList = ({ collaborators, cursorPositions }) => {
  const collaboratorItems = Array.from(collaborators.values()).map(collaborator => {
    const isActive = Date.now() - collaborator.lastActive < 30000;
    const status = isActive ? 'Active' : 'Idle';
    const hasCursor = cursorPositions.has(collaborator.userId);

    const collaboratorInfo = createElement('div', { key: 'info', className: 'collaborator-info' }, [
      createElement('span', { key: 'name', className: 'collaborator-name' }, collaborator.userName),
      createElement('span', { key: 'status', className: 'collaborator-status' }, status),
    ]);

    const cursorElement = hasCursor
      ? createElement('div', {
          key: 'cursor',
          className: 'collaborator-cursor',
          style: {
            left: cursorPositions.get(collaborator.userId).x,
            top: cursorPositions.get(collaborator.userId).y,
          },
        })
      : null;

    return createElement(
      'div',
      {
        key: collaborator.userId,
        className: 'collaborator-item',
      },
      [collaboratorInfo, cursorElement].filter(Boolean)
    );
  });

  return createElement('div', { className: 'collaborators-list' }, [
    createElement('h3', { key: 'heading' }, 'Active Collaborators'),
    ...collaboratorItems,
  ]);
};

CollaboratorsList.propTypes = {
  collaborators: PropTypes.instanceOf(Map).isRequired,
  cursorPositions: PropTypes.instanceOf(Map).isRequired,
};

export default CollaboratorsList;
