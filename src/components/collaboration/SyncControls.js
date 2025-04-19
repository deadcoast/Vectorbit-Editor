import PropTypes from 'prop-types';
import { createElement } from 'react';

/**
 * Helper function to get sync button text based on status
 */
const getSyncButtonText = status => {
  if (status === 'requesting') return 'Requesting Sync...';
  if (status === 'syncing') return 'Syncing...';
  return 'Sync Project';
};

/**
 * SyncControls component handles the sync functionality UI
 */
const SyncControls = ({ syncStatus, requestSync }) => {
  return createElement(
    'div',
    { className: 'sync-controls' },
    createElement(
      'button',
      {
        disabled: syncStatus === 'requesting' || syncStatus === 'syncing',
        onClick: requestSync,
      },
      getSyncButtonText(syncStatus)
    )
  );
};

SyncControls.propTypes = {
  syncStatus: PropTypes.oneOf(['idle', 'requesting', 'syncing', 'synced']).isRequired,
  requestSync: PropTypes.func.isRequired,
};

export default SyncControls;
