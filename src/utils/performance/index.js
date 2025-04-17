/**
 * Performance Utilities
 * 
 * Exports all performance optimization related utilities
 */

export { default as CanvasOptimizer } from './CanvasOptimizer';
export { default as LazyLoader,
  lazyComponent,
  LazyContainer,
  preloadComponent,
  preloadImage,
  configureLazyLoader,
  getResourceState,
  clearResourceCache,
  initializeLazyLoader
} from './LazyLoader';
