
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { debounce } from 'lodash';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import './Collaboration.css';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:5000';
const SYNC_DEBOUNCE_TIME = 100; // ms
const PRESENCE_UPDATE_INTERVAL = 5000; // ms
const MAX_RECONNECT_ATTEMPTS = 5;

const CollaborationManager = ({ 
  projectId,
  userId,
  userName,
  onLayerUpdate,
  onGridUpdate,
  onColorUpdate,
  onUserJoin,
  onUserLeave,
  initialState = {}
}) => {
  const [collaborators, setCollaborators] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [cursorPositions, setCursorPositions] = useState(new Map());
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);

  // Connection management
  const initializeSocket = useCallback(() => {
    try {
      socketRef.current = io(WEBSOCKET_URL, {
        query: {
          projectId,
          userId,
          userName
        },
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      setupSocketListeners();
    } catch (err) {
      setError(`Failed to initialize connection: ${err.message}`);
    }
  }, [projectId, userId, userName]);

  // Socket event listeners
  const setupSocketListeners = useCallback(() => {
    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
      console.log('Connected to collaboration server');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.warn(`Disconnected: ${reason}`);
    });

    socket.on('error', (error) => {
      setError(`Connection error: ${error.message}`);
    });

    socket.on('reconnect_attempt', (attempt) => {
      reconnectAttempts.current = attempt;
      console.log(`Reconnection attempt ${attempt}/${MAX_RECONNECT_ATTEMPTS}`);
    });

    // Collaboration events
    socket.on('user:join', handleUserJoin);
    socket.on('user:leave', handleUserLeave);
    socket.on('layer:update', handleLayerUpdate);
    socket.on('grid:update', handleGridUpdate);
    socket.on('color:update', handleColorUpdate);
    socket.on('cursor:update', handleCursorUpdate);
    socket.on('presence:update', handlePresenceUpdate);
    socket.on('sync:request', handleSyncRequest);
    socket.on('sync:receive', handleSyncReceive);
  }, []);

  // Event handlers
  const handleUserJoin = useCallback((userData) => {
    setCollaborators(prev => {
      const updated = new Map(prev);
      updated.set(userData.userId, {
        ...userData,
        joinedAt: Date.now(),
        lastActive: Date.now()
      });
      return updated;
    });
    onUserJoin?.(userData);
  }, [onUserJoin]);

  const handleUserLeave = useCallback((userId) => {
    setCollaborators(prev => {
      const updated = new Map(prev);
      updated.delete(userId);
      return updated;
    });
    setCursorPositions(prev => {
      const updated = new Map(prev);
      updated.delete(userId);
      return updated;
    });
    onUserLeave?.(userId);
  }, [onUserLeave]);

  // Debounced update handlers
  const debouncedLayerUpdate = useCallback(
    debounce((layerData) => {
      socketRef.current?.emit('layer:update', layerData);
    }, SYNC_DEBOUNCE_TIME),
    []
  );

  const debouncedGridUpdate = useCallback(
    debounce((gridData) => {
      socketRef.current?.emit('grid:update', gridData);
    }, SYNC_DEBOUNCE_TIME),
    []
  );

  const debouncedColorUpdate = useCallback(
    debounce((colorData) => {
      socketRef.current?.emit('color:update', colorData);
    }, SYNC_DEBOUNCE_TIME),
    []
  );

  // Cursor position tracking
  const updateCursorPosition = useCallback((x, y) => {
    socketRef.current?.emit('cursor:update', { x, y });
  }, []);

  // Presence handling
  useEffect(() => {
    const interval = setInterval(() => {
      socketRef.current?.emit('presence:update', {
        lastActive: Date.now()
      });
    }, PRESENCE_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Sync handlers
  const requestSync = useCallback(() => {
    setSyncStatus('requesting');
    socketRef.current?.emit('sync:request');
  }, []);

  const handleSyncRequest = useCallback((requesterId) => {
    socketRef.current?.emit('sync:provide', {
      requesterId,
      state: {
        layers: initialState.layers,
        grid: initialState.grid,
        colors: initialState.colors
      }
    });
  }, [initialState]);

  const handleSyncReceive = useCallback((state) => {
    setSyncStatus('syncing');
    onLayerUpdate?.(state.layers);
    onGridUpdate?.(state.grid);
    onColorUpdate?.(state.colors);
    setSyncStatus('synced');
  }, [onLayerUpdate, onGridUpdate, onColorUpdate]);

  // Initialize connection
  useEffect(() => {
    initializeSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [initializeSocket]);

  // Render collaboration UI
  return (
    <div className="collaboration-manager">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="connection-status">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {!isConnected && reconnectAttempts.current > 0 && (
          <span className="reconnect-status">
            Reconnecting ({reconnectAttempts.current}/{MAX_RECONNECT_ATTEMPTS})...
          </span>
        )}
      </div>

      <div className="collaborators-list">
        <h3>Active Collaborators</h3>
        {Array.from(collaborators.values()).map(collaborator => (
          <div key={collaborator.userId} className="collaborator-item">
            <div className="collaborator-info">
              <span className="collaborator-name">{collaborator.userName}</span>
              <span className="collaborator-status">
                {Date.now() - collaborator.lastActive < 30000 ? 'Active' : 'Idle'}
              </span>
            </div>
            {cursorPositions.has(collaborator.userId) && (
              <div 
                className="collaborator-cursor"
                style={{
                  left: cursorPositions.get(collaborator.userId).x,
                  top: cursorPositions.get(collaborator.userId).y
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="sync-controls">
        <button 
          onClick={requestSync}
          disabled={syncStatus === 'requesting' || syncStatus === 'syncing'}
        >
          {syncStatus === 'requesting' ? 'Requesting Sync...' : 
           syncStatus === 'syncing' ? 'Syncing...' : 
           'Sync Project'}
        </button>
      </div>

      {/* Exported functions for parent component use */}
      <div style={{ display: 'none' }}>
        {/* These are exposed but hidden from view */}
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
  if (type === "anchorsUpdated") {
    syncAnchors(payload, setColorAnchors, updateGridWithAllAnchors);
  }
};

export default React.memo(CollaborationManager);

