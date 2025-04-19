import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { io } from 'socket.io-client';

import {
  createUserJoinHandler,
  createUserLeaveHandler,
  createCursorUpdateHandler,
  createPresenceUpdateHandler,
  createSyncRequestHandler,
  createSyncReceiveHandler,
  setupSocketEventListeners,
  createDebouncedUpdateHandlers,
} from './utils/socketEvents';

// Constants for configuration
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:5000';
const SYNC_DEBOUNCE_TIME = 100; // ms
const PRESENCE_UPDATE_INTERVAL = 5000; // ms
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Hook to manage collaboration state
 */
const useCollaborationState = () => {
  const [collaborators, setCollaborators] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [cursorPositions, setCursorPositions] = useState(new Map());
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);

  return {
    collaborators,
    setCollaborators,
    isConnected,
    setIsConnected,
    error,
    setError,
    syncStatus,
    setSyncStatus,
    cursorPositions,
    setCursorPositions,
    socketRef,
    reconnectAttempts,
  };
};

/**
 * Hook to create all event handlers
 */
const useEventHandlers = ({
  onUserJoin,
  onUserLeave,
  onLayerUpdate,
  onGridUpdate,
  onColorUpdate,
  initialState,
  setCollaborators,
  setCursorPositions,
  setSyncStatus,
  socketRef,
}) => {
  // Create event handlers using utility functions
  const handleUserJoin = useCallback(() => {
    return createUserJoinHandler(setCollaborators, onUserJoin);
  }, [onUserJoin, setCollaborators]);

  const handleUserLeave = useCallback(() => {
    return createUserLeaveHandler(setCollaborators, setCursorPositions, onUserLeave);
  }, [onUserLeave, setCollaborators, setCursorPositions]);

  // Simple update handlers
  const handleLayerUpdate = useCallback(layerData => onLayerUpdate?.(layerData), [onLayerUpdate]);

  const handleGridUpdate = useCallback(gridData => onGridUpdate?.(gridData), [onGridUpdate]);

  const handleColorUpdate = useCallback(colorData => onColorUpdate?.(colorData), [onColorUpdate]);

  const handleCursorUpdate = useCallback(() => {
    return createCursorUpdateHandler(setCursorPositions);
  }, [setCursorPositions]);

  const handlePresenceUpdate = useCallback(() => {
    return createPresenceUpdateHandler(setCollaborators);
  }, [setCollaborators]);

  const handleSyncRequest = useCallback(() => {
    return createSyncRequestHandler(socketRef, initialState);
  }, [initialState, socketRef]);

  const handleSyncReceive = useCallback(() => {
    return createSyncReceiveHandler(setSyncStatus, onLayerUpdate, onGridUpdate, onColorUpdate);
  }, [onLayerUpdate, onGridUpdate, onColorUpdate, setSyncStatus]);

  return {
    handleUserJoin,
    handleUserLeave,
    handleLayerUpdate,
    handleGridUpdate,
    handleColorUpdate,
    handleCursorUpdate,
    handlePresenceUpdate,
    handleSyncRequest,
    handleSyncReceive,
  };
};

/**
 * Hook to set up socket event listeners
 */
const useSocketSetup = ({
  socketRef,
  eventHandlers,
  setIsConnected,
  setError,
  reconnectAttempts,
  projectId,
  userId,
  userName,
}) => {
  // Socket event listeners
  const setupSocketListeners = useCallback(() => {
    if (!socketRef.current) return;

    const stateSetters = {
      setIsConnected,
      setError,
      reconnectAttempts,
    };

    setupSocketEventListeners(socketRef.current, eventHandlers, stateSetters);
  }, [eventHandlers, reconnectAttempts, setError, setIsConnected, socketRef]);

  // Connection management
  const initializeSocket = useCallback(() => {
    try {
      socketRef.current = io(WEBSOCKET_URL, {
        query: { projectId, userId, userName },
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      setupSocketListeners();
    } catch (err) {
      setError(`Failed to initialize connection: ${err.message}`);
    }
  }, [projectId, userId, userName, setupSocketListeners, setError, socketRef]);

  return { setupSocketListeners, initializeSocket };
};

/**
 * Hook to manage presence updates
 */
const usePresenceUpdates = socketRef => {
  useEffect(() => {
    const interval = setInterval(() => {
      socketRef.current?.emit('presence:update', {
        lastActive: Date.now(),
      });
    }, PRESENCE_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [socketRef]);
};

/**
 * Hook to manage socket actions
 */
const useSocketActions = ({ socketRef, setSyncStatus }) => {
  // Cursor position tracking
  const updateCursorPosition = useCallback(
    (x, y) => {
      socketRef.current?.emit('cursor:update', { x, y });
    },
    [socketRef]
  );

  // Request sync from other collaborators
  const requestSync = useCallback(() => {
    setSyncStatus('requesting');
    socketRef.current?.emit('sync:request');
  }, [setSyncStatus, socketRef]);

  // Setup debounced handlers
  const { debouncedLayerUpdate, debouncedGridUpdate, debouncedColorUpdate } = useMemo(
    () => createDebouncedUpdateHandlers(socketRef, SYNC_DEBOUNCE_TIME),
    [socketRef]
  );

  return {
    updateCursorPosition,
    requestSync,
    debouncedLayerUpdate,
    debouncedGridUpdate,
    debouncedColorUpdate,
  };
};

/**
 * Custom hook for handling WebSocket collaboration functionality
 */
const useCollaborationSocket = ({
  projectId,
  userId,
  userName,
  onLayerUpdate,
  onGridUpdate,
  onColorUpdate,
  onUserJoin,
  onUserLeave,
  initialState,
}) => {
  // Set up all state
  const {
    collaborators,
    setCollaborators,
    isConnected,
    setIsConnected,
    error,
    setError,
    syncStatus,
    setSyncStatus,
    cursorPositions,
    setCursorPositions,
    socketRef,
    reconnectAttempts,
  } = useCollaborationState();

  // Create all event handlers
  const eventHandlers = useEventHandlers({
    onUserJoin,
    onUserLeave,
    onLayerUpdate,
    onGridUpdate,
    onColorUpdate,
    initialState,
    setCollaborators,
    setCursorPositions,
    setSyncStatus,
    socketRef,
  });

  // Set up socket and event listeners
  const { initializeSocket } = useSocketSetup({
    socketRef,
    eventHandlers,
    setIsConnected,
    setError,
    reconnectAttempts,
    projectId,
    userId,
    userName,
  });

  // Set up socket actions
  const {
    updateCursorPosition,
    requestSync,
    debouncedLayerUpdate,
    debouncedGridUpdate,
    debouncedColorUpdate,
  } = useSocketActions({
    socketRef,
    setSyncStatus,
  });

  // Handle presence updates
  usePresenceUpdates(socketRef);

  // Initialize connection
  useEffect(() => {
    initializeSocket();

    // Capture the socket reference to avoid closure issues
    const currentSocket = socketRef.current;

    return () => {
      currentSocket?.disconnect();
    };
  }, [initializeSocket, socketRef]);

  return {
    state: {
      collaborators,
      isConnected,
      error,
      syncStatus,
      cursorPositions,
      reconnectAttempts: reconnectAttempts.current,
      maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    },
    actions: {
      requestSync,
      updateCursorPosition,
      debouncedLayerUpdate,
      debouncedGridUpdate,
      debouncedColorUpdate,
    },
  };
};

export default useCollaborationSocket;
