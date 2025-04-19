import PropTypes from 'prop-types';
import { createElement } from 'react';

/**
 * ConnectionStatus component displays the current connection state
 */
const ConnectionStatus = ({ isConnected, reconnectAttempts, maxReconnectAttempts }) => {
  return createElement('div', { className: 'connection-status' }, [
    createElement(
      'span',
      {
        key: 'indicator',
        className: `status-indicator ${isConnected ? 'connected' : 'disconnected'}`,
      },
      isConnected ? 'Connected' : 'Disconnected'
    ),
    !isConnected &&
      reconnectAttempts > 0 &&
      createElement(
        'span',
        {
          key: 'reconnect-status',
          className: 'reconnect-status',
        },
        `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})...`
      ),
  ]);
};

ConnectionStatus.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  reconnectAttempts: PropTypes.number.isRequired,
  maxReconnectAttempts: PropTypes.number.isRequired,
};

export default ConnectionStatus;
