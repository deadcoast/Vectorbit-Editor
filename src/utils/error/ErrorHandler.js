/**
 * Error Handler Utility
 *
 * Provides robust error handling utilities for managing, tracking,
 * and reporting errors throughout the application
 */

// Error severity levels
export const ErrorSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

// Error categories for grouping and filtering
export const ErrorCategory = {
  UI: 'ui',
  FILE_OPERATION: 'file-operation',
  NETWORK: 'network',
  SVG_PROCESSING: 'svg-processing',
  RENDERING: 'rendering',
  STORAGE: 'storage',
  UNKNOWN: 'unknown',
};

// Create a central error registry
class ErrorRegistry {
  constructor() {
    this.errors = [];
    this.errorListeners = [];
    this.maxErrors = 100; // Maximum number of errors to store
  }

  /**
   * Register a new error in the system
   *
   * @param {Error} error - The error object
   * @param {Object} options - Additional options
   * @param {string} options.severity - Error severity level
   * @param {string} options.category - Error category
   * @param {string} options.context - Additional context about where the error occurred
   * @param {Object} options.metadata - Any additional metadata related to the error
   * @returns {string} Error ID
   */
  registerError(error, options = {}) {
    const {
      severity = ErrorSeverity.ERROR,
      category = ErrorCategory.UNKNOWN,
      context = '',
      metadata = {},
    } = options;

    const errorId = this.generateErrorId();
    const timestamp = new Date();

    const errorEntry = {
      id: errorId,
      timestamp,
      message: error.message || 'Unknown error',
      stack: error.stack,
      severity,
      category,
      context,
      metadata,
      originalError: error,
    };

    // Add to registry
    this.errors.unshift(errorEntry);

    // Trim the error list if it exceeds maximum size
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Notify listeners
    this.notifyErrorListeners(errorEntry);

    // Log to console for debugging
    this.logError(errorEntry);

    return errorId;
  }

  /**
   * Generate a unique error ID
   *
   * @returns {string} Unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add a listener for new errors
   *
   * @param {Function} listener - Error listener callback
   * @returns {Function} Function to remove the listener
   */
  addErrorListener(listener) {
    this.errorListeners.push(listener);

    // Return a function to remove this listener
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all error listeners of a new error
   *
   * @param {Object} errorEntry - The error entry object
   */
  notifyErrorListeners(errorEntry) {
    this.errorListeners.forEach(listener => {
      try {
        listener(errorEntry);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  /**
   * Log the error to console based on severity
   *
   * @param {Object} errorEntry - The error entry object
   */
  logError(errorEntry) {
    const { severity, message, context, category } = errorEntry;

    const logMessage = `[${severity.toUpperCase()}][${category}] ${message}${context ? ` - ${context}` : ''}`;

    switch (severity) {
      case ErrorSeverity.INFO:
        console.info(logMessage, errorEntry);
        break;
      case ErrorSeverity.WARNING:
        console.warn(logMessage, errorEntry);
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        console.error(logMessage, errorEntry);
        break;
      default:
        console.log(logMessage, errorEntry);
    }
  }

  /**
   * Get all errors, optionally filtered
   *
   * @param {Object} options - Filter options
   * @param {string} options.severity - Filter by severity
   * @param {string} options.category - Filter by category
   * @param {Date} options.since - Filter by timestamp (since)
   * @returns {Array} Filtered errors
   */
  getErrors(options = {}) {
    const { severity, category, since } = options;

    return this.errors.filter(error => {
      if (severity && error.severity !== severity) return false;
      if (category && error.category !== category) return false;
      if (since && error.timestamp < since) return false;
      return true;
    });
  }

  /**
   * Clear all errors or specific errors by filter
   *
   * @param {Object} options - Filter options (same as getErrors)
   */
  clearErrors(options = {}) {
    if (Object.keys(options).length === 0) {
      // Clear all errors
      this.errors = [];
      return;
    }

    // Apply filtering to keep errors that don't match the filter
    const { severity, category, since } = options;

    this.errors = this.errors.filter(error => {
      if (severity && error.severity === severity) return false;
      if (category && error.category === category) return false;
      if (since && error.timestamp >= since) return false;
      return true;
    });
  }
}

// Create singleton instance
const errorRegistry = new ErrorRegistry();

/**
 * Error Handler object for managing application errors
 */
const ErrorHandler = {
  /**
   * Handle an error with the specified options
   *
   * @param {Error} error - The error object
   * @param {Object} options - Error handling options
   * @returns {string} Error ID
   */
  handleError: (error, options = {}) => {
    return errorRegistry.registerError(error, options);
  },

  /**
   * Create a wrapped version of a function that catches and reports errors
   *
   * @param {Function} fn - The function to wrap
   * @param {Object} options - Error handling options
   * @returns {Function} Wrapped function
   */
  withErrorHandling: (fn, options = {}) => {
    return (...args) => {
      try {
        const result = fn(...args);

        // Handle Promise results
        if (result instanceof Promise) {
          return result.catch(error => {
            errorRegistry.registerError(error, options);
            throw error; // Re-throw to allow further handling
          });
        }

        return result;
      } catch (error) {
        errorRegistry.registerError(error, options);
        throw error; // Re-throw to allow further handling
      }
    };
  },

  /**
   * Subscribe to error events
   *
   * @param {Function} listener - Error listener callback
   * @returns {Function} Unsubscribe function
   */
  subscribeToErrors: listener => {
    return errorRegistry.addErrorListener(listener);
  },

  /**
   * Get all errors, optionally filtered
   *
   * @param {Object} options - Filter options
   * @returns {Array} Filtered errors
   */
  getErrors: (options = {}) => {
    return errorRegistry.getErrors(options);
  },

  /**
   * Clear errors based on filter criteria
   *
   * @param {Object} options - Filter options
   */
  clearErrors: (options = {}) => {
    errorRegistry.clearErrors(options);
  },

  /**
   * Get the most recent error
   *
   * @returns {Object|null} Most recent error or null
   */
  getMostRecentError: () => {
    return errorRegistry.errors[0] || null;
  },

  /**
   * Error severity levels
   */
  Severity: ErrorSeverity,

  /**
   * Error categories
   */
  Category: ErrorCategory,
};

export default ErrorHandler;
