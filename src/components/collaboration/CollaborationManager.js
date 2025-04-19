import PropTypes from 'prop-types';
import React from 'react';

import CollaboratorsList from './CollaboratorsList';
import ConnectionStatus from './ConnectionStatus';
import SyncControls from './SyncControls';
import useCollaborationSocket from './useCollaborationSocket';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import './Collaboration.css';

/**
 * CollaborationManager component provides real-time collaboration features
 */
const CollaborationManager = ({
  projectId,
  userId,
  userName,
  onLayerUpdate,
  onGridUpdate,
  onColorUpdate,
  onUserJoin,
  onUserLeave,
  initialState = {},
}) => {
  // Use our custom hook for socket management
  const { state, actions } = useCollaborationSocket({
    projectId,
    userId,
    userName,
    onLayerUpdate,
    onGridUpdate,
    onColorUpdate,
    onUserJoin,
    onUserLeave,
    initialState,
  });

  // Destructure socket state and actions
  const {
    collaborators,
    isConnected,
    error,
    syncStatus,
    cursorPositions,
    reconnectAttempts,
    maxReconnectAttempts,
  } = state;

  const {
    requestSync,
    updateCursorPosition,
    debouncedLayerUpdate,
    debouncedGridUpdate,
    debouncedColorUpdate,
  } = actions;

  // Render collaboration UI
  return (
    <div className="collaboration-manager">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ConnectionStatus
        isConnected={isConnected}
        maxReconnectAttempts={maxReconnectAttempts}
        reconnectAttempts={reconnectAttempts}
      />

      <CollaboratorsList collaborators={collaborators} cursorPositions={cursorPositions} />

      <SyncControls requestSync={requestSync} syncStatus={syncStatus} />

      {/* Exported functions for parent component use - hidden from view */}
      <div style={{ display: 'none' }}>
        <button onClick={() => debouncedLayerUpdate}>updateLayer</button>
        <button onClick={() => debouncedGridUpdate}>updateGrid</button>
        <button onClick={() => debouncedColorUpdate}>updateColor</button>
        <button onClick={() => updateCursorPosition}>updateCursor</button>
      </div>
    </div>
  );
};

// Utility functions for external use
export const syncAnchors = (updatedAnchors, setColorAnchors, updateGridWithAllAnchors) => {
  setColorAnchors(updatedAnchors);
  updateGridWithAllAnchors(updatedAnchors);
};

export const handleWebSocketMessage = (event, setColorAnchors, updateGridWithAllAnchors) => {
  const { type, payload } = JSON.parse(event.data);
  if (type === 'anchorsUpdated') {
    syncAnchors(payload, setColorAnchors, updateGridWithAllAnchors);
  }
};

CollaborationManager.propTypes = {
  projectId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  onLayerUpdate: PropTypes.func,
  onGridUpdate: PropTypes.func,
  onColorUpdate: PropTypes.func,
  onUserJoin: PropTypes.func,
  onUserLeave: PropTypes.func,
  initialState: PropTypes.shape({
    layers: PropTypes.array,
    grid: PropTypes.object,
    colors: PropTypes.array,
  }),
};

export default React.memo(CollaborationManager);
