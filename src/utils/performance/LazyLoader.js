/**
 * Lazy Loader Utility
 *
 * Provides utilities for lazy loading components, assets, and resources
 * to improve application startup time and resource usage.
 */
import PropTypes from 'prop-types';
import { Suspense, lazy } from 'react';

/**
 * Configuration options for the lazy loader
 */
const config = {
  // Default loading timeout in milliseconds
  timeout: 10000,

  // Default retry attempts
  retryAttempts: 3,

  // Retry delay in milliseconds
  retryDelay: 1000,

  // Priority levels for preloading
  priority: {
    HIGH: 'high', // Load immediately
    MEDIUM: 'medium', // Load after critical components
    LOW: 'low', // Load when idle
    DEMAND: 'demand', // Load only when requested
  },

  // Whether to prefetch components based on user navigation patterns
  enablePrefetching: true,

  // Debug mode for logging lazy loading events
  debug: false,
};

// Track loaded and pending resources
const resourceState = {
  loaded: new Set(),
  pending: new Map(),
  failed: new Map(),
  prefetchQueue: [],
};

/**
 * Create a lazy-loaded component with loading fallback
 *
 * @param {Function} importFunc - Import function for the component
 * @param {Object} options - Options for lazy loading
 * @param {React.Component} options.fallback - Fallback component to show while loading
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {number} options.retryAttempts - Number of retry attempts
 * @param {string} options.id - Unique identifier for the component
 * @returns {React.Component} Lazy-loaded component
 */
export const lazyComponent = (importFunc, options = {}) => {
  const {
    timeout = config.timeout,
    retryAttempts = config.retryAttempts,
    id = `component_${Math.random().toString(36).substr(2, 9)}`,
  } = options;

  // Create enhanced import function with retry logic
  const importWithRetry = () => {
    return new Promise((resolve, reject) => {
      // Track resource state
      if (!resourceState.loaded.has(id) && !resourceState.pending.has(id)) {
        resourceState.pending.set(id, { startTime: Date.now() });
        if (config.debug) {
          // Logging is disabled for production
          // console.log(`[LazyLoader] Loading component: ${id}`);
        }
      }

      // Set timeout for loading
      const timeoutId = setTimeout(() => {
        if (resourceState.pending.has(id)) {
          const pendingData = resourceState.pending.get(id);
          const attempts = pendingData.attempts || 0;

          if (attempts >= retryAttempts) {
            // Max retries reached, mark as failed
            resourceState.pending.delete(id);
            resourceState.failed.set(id, {
              error: new Error(`Timeout loading component: ${id}`),
              time: Date.now(),
            });

            if (config.debug) {
              // Logging is disabled for production
              // console.error(
              //   `[LazyLoader] Failed to load component after ${retryAttempts} attempts: ${id}`
              // );
            }

            reject(new Error(`Timeout loading component: ${id}`));
          } else {
            // Retry loading
            if (config.debug) {
              // Logging is disabled for production
              // console.warn(
              //   `[LazyLoader] Retrying component load (${attempts + 1}/${retryAttempts}): ${id}`
              // );
            }

            resourceState.pending.set(id, {
              ...pendingData,
              attempts: attempts + 1,
            });

            // Delay before retry
            setTimeout(() => {
              importFunc().then(resolve).catch(reject);
            }, config.retryDelay);
          }
        }
      }, timeout);

      // Attempt to load
      importFunc()
        .then(module => {
          clearTimeout(timeoutId);

          // Mark resource as loaded
          resourceState.pending.delete(id);
          resourceState.loaded.add(id);

          if (config.debug) {
            // Logging is disabled for production
            // console.log(`[LazyLoader] Successfully loaded component: ${id}`);
          }

          resolve(module);
        })
        .catch(error => {
          clearTimeout(timeoutId);

          if (config.debug) {
            // Logging is disabled for production
            // console.error(`[LazyLoader] Error loading component: ${id}`, error);
          }

          reject(error);
        });
    });
  };

  // Create lazy component with retry
  return lazy(() => importWithRetry());
};

/**
 * Default loading fallback component
 */
const DefaultLoadingFallback = () => (
  <div className="lazy-loader-fallback">
    <div className="lazy-loader-spinner" />
  </div>
);

/**
 * Lazy container component that wraps lazy-loaded components with Suspense
 *
 * @param {Object} props - Component props
 * @param {React.Component} props.component - Lazy-loaded component
 * @param {React.Component} props.fallback - Fallback component to show while loading
 * @param {Object} props.componentProps - Props to pass to the loaded component
 * @returns {React.Component} Lazy container component
 */
export const LazyContainer = ({
  component: Component,
  fallback = <DefaultLoadingFallback />,
  componentProps = {},
  ...rest
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...componentProps} {...rest} />
    </Suspense>
  );
};

LazyContainer.propTypes = {
  component: PropTypes.elementType.isRequired,
  fallback: PropTypes.element,
  componentProps: PropTypes.object,
};

/**
 * Preload a component without rendering it
 *
 * @param {Function} importFunc - Import function for the component
 * @param {Object} options - Options for preloading
 * @returns {Promise} Promise that resolves when the component is loaded
 */
export const preloadComponent = (importFunc, options = {}) => {
  const {
    id = `preload_${Math.random().toString(36).substr(2, 9)}`,
    priority = config.priority.MEDIUM,
  } = options;

  // For high priority, load immediately
  if (priority === config.priority.HIGH) {
    return importFunc();
  }

  // For medium/low priority, add to queue
  resourceState.prefetchQueue.push({
    id,
    load: importFunc,
    priority,
    added: Date.now(),
  });

  // Process queue if needed
  if (priority === config.priority.MEDIUM) {
    processPrefetchQueue();
  }

  // Return a promise that will resolve when the component is eventually loaded
  return new Promise(resolve => {
    // Create an interval to check if the module has been loaded
    const checkInterval = setInterval(() => {
      if (resourceState.loaded.has(id)) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
};

/**
 * Process the prefetch queue based on priority
 */
const processPrefetchQueue = () => {
  // Sort by priority and then by age
  resourceState.prefetchQueue.sort((a, b) => {
    // Sort by priority first
    const priorityOrder = {
      [config.priority.HIGH]: 0,
      [config.priority.MEDIUM]: 1,
      [config.priority.LOW]: 2,
      [config.priority.DEMAND]: 3,
    };

    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then sort by age (oldest first)
    return a.added - b.added;
  });

  // Process high and medium priority items
  const highAndMediumItems = resourceState.prefetchQueue.filter(
    item => item.priority === config.priority.HIGH || item.priority === config.priority.MEDIUM
  );

  // Load each item
  highAndMediumItems.forEach(item => {
    // Remove from queue
    resourceState.prefetchQueue = resourceState.prefetchQueue.filter(i => i.id !== item.id);

    // Load the resource
    item.load().catch(error => {
      if (config.debug) {
        console.error(`[LazyLoader] Error preloading: ${item.id}`, error);
      }
    });
  });

  // Schedule low priority items for idle time
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(
      () => {
        const lowPriorityItems = resourceState.prefetchQueue.filter(
          item => item.priority === config.priority.LOW
        );

        // Load each item
        lowPriorityItems.forEach(item => {
          // Remove from queue
          resourceState.prefetchQueue = resourceState.prefetchQueue.filter(i => i.id !== item.id);

          // Load the resource
          item.load().catch(error => {
            if (config.debug) {
              console.error(`[LazyLoader] Error preloading: ${item.id}`, error);
            }
          });
        });
      },
      { timeout: 1000 }
    );
  }
};

/**
 * Preload an image without displaying it
 *
 * @param {string} src - Image source URL
 * @param {Object} options - Options for preloading
 * @returns {Promise} Promise that resolves when the image is loaded
 */
export const preloadImage = (src, options = {}) => {
  const { id = `img_${src.replace(/[^a-zA-Z0-9]/g, '_')}`, priority = config.priority.MEDIUM } =
    options;

  // Check if already loaded
  if (resourceState.loaded.has(id)) {
    return Promise.resolve();
  }

  // Create loader function
  const loadImage = () => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resourceState.loaded.add(id);
        resolve(img);
      };

      img.onerror = error => {
        resourceState.failed.set(id, {
          error: new Error(`Failed to load image: ${src}`),
          time: Date.now(),
        });
        reject(error);
      };

      img.src = src;
    });
  };

  // For high priority, load immediately
  if (priority === config.priority.HIGH) {
    return loadImage();
  }

  // For medium/low priority, add to queue
  resourceState.prefetchQueue.push({
    id,
    load: loadImage,
    priority,
    added: Date.now(),
  });

  // Process queue if needed
  if (priority === config.priority.MEDIUM) {
    processPrefetchQueue();
  }

  // Return a promise that will resolve when the image is eventually loaded
  return new Promise(resolve => {
    // Create an interval to check if the image has been loaded
    const checkInterval = setInterval(() => {
      if (resourceState.loaded.has(id)) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });
};

/**
 * Configure the lazy loader
 *
 * @param {Object} options - Configuration options
 */
export const configureLazyLoader = (options = {}) => {
  Object.assign(config, options);
};

/**
 * Get the current state of loaded and pending resources
 *
 * @returns {Object} Resource state information
 */
export const getResourceState = () => {
  return {
    loaded: Array.from(resourceState.loaded),
    pending: Array.from(resourceState.pending.keys()),
    failed: Array.from(resourceState.failed.keys()),
    queueLength: resourceState.prefetchQueue.length,
  };
};

/**
 * Clear the resource state cache
 *
 * @param {boolean} includeLoaded - Whether to clear loaded resources too
 */
export const clearResourceCache = (includeLoaded = false) => {
  resourceState.pending.clear();
  resourceState.failed.clear();
  resourceState.prefetchQueue = [];

  if (includeLoaded) {
    resourceState.loaded.clear();
  }
};

/**
 * Initialize the lazy loader
 *
 * This sets up event listeners for prefetching and idle loading
 */
export const initializeLazyLoader = () => {
  if (config.enablePrefetching) {
    // Process queue on page load
    window.addEventListener('load', () => {
      processPrefetchQueue();
    });

    // Process queue during idle time
    if ('requestIdleCallback' in window) {
      const processQueueDuringIdle = () => {
        window.requestIdleCallback(
          () => {
            processPrefetchQueue();
            processQueueDuringIdle();
          },
          { timeout: 2000 }
        );
      };

      processQueueDuringIdle();
    }
  }
};

// Default export for all functionalities
export default {
  lazyComponent,
  LazyContainer,
  preloadComponent,
  preloadImage,
  configureLazyLoader,
  getResourceState,
  clearResourceCache,
  initializeLazyLoader,
  priority: config.priority,
};
