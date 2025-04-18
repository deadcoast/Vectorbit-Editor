/**
 * Error Boundary Component
 *
 * Provides robust error handling for catching and displaying runtime errors
 * in React components, preventing the entire application from crashing.
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: false,
    };
  }

  // Catch errors in any components below and re-render with error message
  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  // Log error information for debugging
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  // Reset the error state and attempt to recover
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: false,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  // Toggle error details display
  toggleErrorDetails = () => {
    this.setState(prevState => ({
      errorDetails: !prevState.errorDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Customize fallback UI based on props
      const {
        message = 'Something went wrong.',
        description = 'The application encountered an error. You can try resetting the component or reloading the page.',
        actionLabel = 'Reset Component',
        className = '',
      } = this.props;

      return (
        <div className={`error-boundary ${className}`}>
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg
                fill="none"
                height="48"
                viewBox="0 0 24 24"
                width="48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z"
                  fill="currentColor"
                />
              </svg>
            </div>

            <h2 className="error-title">{message}</h2>
            <p className="error-description">{description}</p>

            <div className="error-actions">
              <button className="error-reset-button" onClick={this.handleReset}>
                {actionLabel}
              </button>
              <button className="error-reload-button" onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>

            <div className="error-details-section">
              <button className="error-details-toggle" onClick={this.toggleErrorDetails}>
                {this.state.errorDetails ? 'Hide Error Details' : 'Show Error Details'}
              </button>

              {this.state.errorDetails && (
                <div className="error-details">
                  <div className="error-message">
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  </div>

                  <div className="error-stack">
                    <strong>Stack Trace:</strong>
                    <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  message: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  className: PropTypes.string,
  onError: PropTypes.func,
  onReset: PropTypes.func,
};

export default ErrorBoundary;
