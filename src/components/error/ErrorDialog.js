/**
 * Error Dialog Component
 *
 * Displays error messages to users in a modal dialog with various
 * levels of detail and actions depending on the error severity.
 */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import ErrorHandler from '../../utils/error/ErrorHandler';
import './ErrorDialog.css';

const ErrorDialog = ({
  isOpen,
  onClose,
  error = null,
  autoClose = false,
  autoCloseDelay = 5000,
}) => {
  const [errorDetails, setErrorDetails] = useState(false);
  const [currentError, setCurrentError] = useState(null);

  // Set up error from props or get most recent from ErrorHandler
  useEffect(() => {
    if (isOpen) {
      setCurrentError(error || ErrorHandler.getMostRecentError());
    } else {
      setCurrentError(null);
      setErrorDetails(false);
    }
  }, [isOpen, error]);

  // Auto-close the dialog after delay if enabled
  useEffect(() => {
    if (isOpen && autoClose && currentError) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, currentError, onClose]);

  // Get appropriate icon for the error severity
  const getErrorIcon = severity => {
    switch (severity) {
      case ErrorHandler.Severity.CRITICAL:
      case ErrorHandler.Severity.ERROR:
        return (
          <svg
            className="error-icon"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"
              fill="currentColor"
            />
          </svg>
        );
      case ErrorHandler.Severity.WARNING:
        return (
          <svg
            className="warning-icon"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
              fill="currentColor"
            />
          </svg>
        );
      case ErrorHandler.Severity.INFO:
        return (
          <svg
            className="info-icon"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
              fill="currentColor"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="info-icon"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
              fill="currentColor"
            />
          </svg>
        );
    }
  };

  // Get category display name
  const getCategoryDisplayName = category => {
    switch (category) {
      case ErrorHandler.Category.UI:
        return 'User Interface';
      case ErrorHandler.Category.FILE_OPERATION:
        return 'File Operation';
      case ErrorHandler.Category.NETWORK:
        return 'Network';
      case ErrorHandler.Category.SVG_PROCESSING:
        return 'SVG Processing';
      case ErrorHandler.Category.RENDERING:
        return 'Rendering';
      case ErrorHandler.Category.STORAGE:
        return 'Storage';
      case ErrorHandler.Category.UNKNOWN:
      default:
        return 'Unknown';
    }
  };

  // Toggle error details display
  const toggleErrorDetails = () => {
    setErrorDetails(prev => !prev);
  };

  // Handle dialog close
  const handleClose = () => {
    if (onClose) onClose();
  };

  if (!isOpen || !currentError) return null;

  const { severity, category, message, context, timestamp, stack, metadata } = currentError;

  // Format metadata for display
  const formatMetadata = metadata => {
    try {
      return JSON.stringify(metadata, null, 2);
    } catch (e) {
      return 'Unable to format metadata';
    }
  };

  // Get the title based on severity level
  const getErrorTitle = severity => {
    switch (severity) {
      case ErrorHandler.Severity.CRITICAL:
        return 'Critical Error';
      case ErrorHandler.Severity.ERROR:
        return 'Error';
      case ErrorHandler.Severity.WARNING:
        return 'Warning';
      default:
        return 'Information';
    }
  };

  return (
    <div className={`error-dialog-overlay severity-${severity}`}>
      <div className="error-dialog">
        <div className="error-dialog-header">
          <div className="error-dialog-icon">{getErrorIcon(severity)}</div>
          <h2 className="error-dialog-title">{getErrorTitle(severity)}</h2>
          <button
            aria-label="Close dialog"
            className="error-dialog-close-btn"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <div className="error-dialog-content">
          <div className="error-message">{message}</div>

          {context && <div className="error-context">{context}</div>}

          <div className="error-meta">
            <span className="error-category">{getCategoryDisplayName(category)}</span>
            <span className="error-timestamp">{new Date(timestamp).toLocaleTimeString()}</span>
          </div>

          <div className="error-actions">
            <button className="error-details-toggle" onClick={toggleErrorDetails}>
              {errorDetails ? 'Hide Details' : 'Show Details'}
            </button>

            <button className="error-close-btn" onClick={handleClose}>
              Dismiss
            </button>
          </div>

          {errorDetails && (
            <div className="error-details">
              <div className="error-stack">
                <h4>Stack Trace</h4>
                <pre>{stack || 'No stack trace available'}</pre>
              </div>

              {metadata && Object.keys(metadata).length > 0 && (
                <div className="error-metadata">
                  <h4>Additional Information</h4>
                  <pre>{formatMetadata(metadata)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ErrorDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  error: PropTypes.object,
  autoClose: PropTypes.bool,
  autoCloseDelay: PropTypes.number,
};

export default ErrorDialog;
