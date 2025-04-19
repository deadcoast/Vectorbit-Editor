/**
 * Socket event handlers utility 
 * Contains factory functions for creating socket event handlers
 */

/**
 * Creates a user join event handler
 * @param {Function} setCollaborators - State setter for collaborators 
 * @param {Function} onUserJoin - Callback for user join events
 * @returns {Function} Event handler for user join events
 */
export const createUserJoinHandler = (setCollaborators, onUserJoin) => {
  return userData => {
    setCollaborators(prev => {
      const updated = new Map(prev);
      updated.set(userData.userId, {
        ...userData,
        joinedAt: Date.now(),
        lastActive: Date.now(),
      });
      return updated;
    });
    onUserJoin?.(userData);
  };
};

/**
 * Creates a user leave event handler
 * @param {Function} setCollaborators - State setter for collaborators
 * @param {Function} setCursorPositions - State setter for cursor positions
 * @param {Function} onUserLeave - Callback for user leave events
 * @returns {Function} Event handler for user leave events
 */
export const createUserLeaveHandler = (setCollaborators, setCursorPositions, onUserLeave) => {
  return userId => {
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
  };
};

/**
 * Creates a cursor update event handler
 * @param {Function} setCursorPositions - State setter for cursor positions
 * @returns {Function} Event handler for cursor update events
 */
export const createCursorUpdateHandler = (setCursorPositions) => {
  return ({ userId, position }) => {
    setCursorPositions(prev => {
      const updated = new Map(prev);
      updated.set(userId, position);
      return updated;
    });
  };
};

/**
 * Creates a presence update event handler
 * @param {Function} setCollaborators - State setter for collaborators
 * @returns {Function} Event handler for presence update events
 */
export const createPresenceUpdateHandler = (setCollaborators) => {
  return ({ userId, lastActive }) => {
    setCollaborators(prev => {
      const updated = new Map(prev);
      if (updated.has(userId)) {
        const user = updated.get(userId);
        updated.set(userId, { ...user, lastActive });
      }
      return updated;
    });
  };
};

/**
 * Creates a sync request event handler
 * @param {Object} socketRef - Reference to socket connection
 * @param {Object} initialState - Initial state of the application
 * @returns {Function} Event handler for sync request events
 */
export const createSyncRequestHandler = (socketRef, initialState) => {
  return requesterId => {
    socketRef.current?.emit('sync:provide', {
      requesterId,
      state: {
        layers: initialState.layers,
        grid: initialState.grid,
        colors: initialState.colors,
      },
    });
  };
};

/**
 * Creates a sync receive event handler
 * @param {Function} setSyncStatus - State setter for sync status
 * @param {Function} onLayerUpdate - Callback for layer update events
 * @param {Function} onGridUpdate - Callback for grid update events
 * @param {Function} onColorUpdate - Callback for color update events
 * @returns {Function} Event handler for sync receive events
 */
export const createSyncReceiveHandler = (
  setSyncStatus,
  onLayerUpdate,
  onGridUpdate,
  onColorUpdate
) => {
  return state => {
    setSyncStatus('syncing');
    onLayerUpdate?.(state.layers);
    onGridUpdate?.(state.grid);
    onColorUpdate?.(state.colors);
    setSyncStatus('synced');
  };
};

/**
 * Sets up socket event listeners
 * @param {Object} socket - Socket.io connection
 * @param {Object} handlers - Event handlers
 * @param {Object} state - State setters
 */
export const setupSocketEventListeners = (socket, handlers, state) => {
  const { 
    setIsConnected, 
    setError, 
    reconnectAttempts 
  } = state;

  socket.on('connect', () => {
    setIsConnected(true);
    setError(null);
    reconnectAttempts.current = 0;
  });

  socket.on('disconnect', reason => {
    setIsConnected(false);
  });

  socket.on('error', error => {
    setError(`Connection error: ${error.message}`);
  });

  socket.on('reconnect_attempt', attempt => {
    reconnectAttempts.current = attempt;
  });

  // Collaboration events
  socket.on('user:join', handlers.handleUserJoin);
  socket.on('user:leave', handlers.handleUserLeave);
  socket.on('layer:update', handlers.handleLayerUpdate);
  socket.on('grid:update', handlers.handleGridUpdate);
  socket.on('color:update', handlers.handleColorUpdate);
  socket.on('cursor:update', handlers.handleCursorUpdate);
  socket.on('presence:update', handlers.handlePresenceUpdate);
  socket.on('sync:request', handlers.handleSyncRequest);
  socket.on('sync:receive', handlers.handleSyncReceive);
};

/**
 * Creates debounced update handlers for socket events
 * @param {Object} socketRef - Reference to socket connection
 * @param {number} debounceTime - Debounce time in milliseconds
 * @returns {Object} Debounced update handlers
 */
export const createDebouncedUpdateHandlers = (socketRef, debounceTime) => {
  const createHandler = eventName => {
    return data => {
      const debouncedEmit = debounce(payload => {
        socketRef.current?.emit(eventName, payload);
      }, debounceTime);
      debouncedEmit(data);
    };
  };

  return {
    debouncedLayerUpdate: createHandler('layer:update'),
    debouncedGridUpdate: createHandler('grid:update'),
    debouncedColorUpdate: createHandler('color:update'),
  };
};
