/**
 * Canvas Optimizer Utility
 * 
 * Provides optimization strategies for canvas rendering with large grids,
 * including viewport culling, level of detail management, and render caching.
 */

/**
 * Optimizer for canvas rendering performance
 */
class CanvasOptimizer {
  constructor() {
    // Configuration defaults
    this.config = {
      enableCulling: true,        // Enable viewport culling (only render visible cells)
      enableLOD: true,            // Enable level of detail rendering
      enableCaching: true,        // Enable render caching
      lodThresholds: {            // Zoom thresholds for different LOD levels
        high: 1.0,                // Full detail rendering above this zoom level
        medium: 0.5,              // Medium detail rendering above this zoom level
        low: 0.2                  // Low detail rendering above this zoom level
      },
      cacheSize: 20,              // Maximum number of cache entries
      cacheExpiryMs: 5000,        // Cache expiry in milliseconds
      renderMargin: 10,           // Number of cells to render beyond viewport
      chunkSize: 32,              // Size of rendering chunks in pixels
      debugMode: false            // Debug mode to show optimization boundaries
    };
    
    // Internal state
    this.cache = new Map();       // Render cache
    this.cacheTimestamps = new Map(); // Timestamps for cache entries
    this.currentViewport = {      // Current viewport boundaries
      x: 0, y: 0, width: 0, height: 0, zoom: 1
    };
    this.dirtyRegions = [];       // List of regions that need re-rendering
    this.isAnimationFrame = false; // Whether current render is during animation frame
    this.lastRenderTime = 0;      // Timestamp of last render
    this.frameTimeHistory = [];   // History of recent frame times for adaptive optimizations
    this.adaptiveConfig = {...this.config}; // Adaptive configuration based on performance
  }
  
  /**
   * Configure the optimizer
   * @param {Object} config - Configuration options
   */
  configure(config) {
    this.config = { ...this.config, ...config };
    this.adaptiveConfig = { ...this.adaptiveConfig, ...config };
    this.resetCache();
  }
  
  /**
   * Set current viewport boundaries
   * @param {Object} viewport - Viewport bounds {x, y, width, height, zoom}
   */
  setViewport(viewport) {
    this.currentViewport = { ...viewport };
  }
  
  /**
   * Determine if a cell is visible in the current viewport
   * @param {number} x - Cell X coordinate
   * @param {number} y - Cell Y coordinate
   * @param {number} size - Cell size
   * @returns {boolean} Whether cell is visible
   */
  isCellVisible(x, y, size) {
    if (!this.config.enableCulling) return true;
    
    const margin = this.config.renderMargin;
    const { x: vpX, y: vpY, width: vpWidth, height: vpHeight } = this.currentViewport;
    
    // Apply render margin to viewport
    const minX = vpX - margin * size;
    const minY = vpY - margin * size;
    const maxX = vpX + vpWidth + margin * size;
    const maxY = vpY + vpHeight + margin * size;
    
    // Check if cell is within extended viewport
    return (
      x + size >= minX &&
      y + size >= minY &&
      x <= maxX &&
      y <= maxY
    );
  }
  
  /**
   * Get current level of detail based on zoom level
   * @returns {string} LOD level ('high', 'medium', 'low', or 'lowest')
   */
  getCurrentLOD() {
    if (!this.config.enableLOD) return 'high';
    
    const { zoom } = this.currentViewport;
    const { high, medium, low } = this.adaptiveConfig.lodThresholds;
    
    if (zoom >= high) return 'high';
    if (zoom >= medium) return 'medium';
    if (zoom >= low) return 'low';
    return 'lowest';
  }
  
  /**
   * Get cached rendered content if available
   * @param {string} key - Cache key
   * @returns {Object|null} Cached render data or null if not found
   */
  getCachedRender(key) {
    if (!this.config.enableCaching) return null;
    
    if (this.cache.has(key)) {
      // Update cache timestamp
      this.cacheTimestamps.set(key, Date.now());
      return this.cache.get(key);
    }
    
    return null;
  }
  
  /**
   * Store rendered content in cache
   * @param {string} key - Cache key
   * @param {Object} data - Render data to cache
   */
  cacheRender(key, data) {
    if (!this.config.enableCaching) return;
    
    // Clean cache if it exceeds size limit
    if (this.cache.size >= this.config.cacheSize) {
      this.cleanCache();
    }
    
    this.cache.set(key, data);
    this.cacheTimestamps.set(key, Date.now());
  }
  
  /**
   * Clear expired or least recently used cache entries
   */
  cleanCache() {
    const now = Date.now();
    const entries = [...this.cacheTimestamps.entries()];
    
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1] - b[1]);
    
    // Remove expired entries and oldest entries if cache is too large
    let removed = 0;
    for (const [key, timestamp] of entries) {
      if (now - timestamp > this.config.cacheExpiryMs || 
          removed < (this.cache.size - this.config.cacheSize + 1)) {
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
        removed++;
      }
    }
  }
  
  /**
   * Reset and clear the render cache
   */
  resetCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
  }
  
  /**
   * Mark a region as dirty (needs re-rendering)
   * @param {Object} region - Region bounds {x, y, width, height}
   */
  markDirtyRegion(region) {
    this.dirtyRegions.push(region);
    
    // Invalidate affected cache entries
    if (this.config.enableCaching) {
      // Implementation depends on how cache keys are structured
      // Simple approach: clear entire cache when regions are marked dirty
      this.resetCache();
    }
  }
  
  /**
   * Start a render cycle, optionally during an animation frame
   * @param {boolean} isAnimationFrame - Whether this is during an animation frame
   */
  beginRender(isAnimationFrame = false) {
    this.isAnimationFrame = isAnimationFrame;
    this.lastRenderTime = performance.now();
  }
  
  /**
   * End a render cycle and update performance metrics
   */
  endRender() {
    const renderTime = performance.now() - this.lastRenderTime;
    
    // Track frame times for adaptive optimization
    this.frameTimeHistory.unshift(renderTime);
    if (this.frameTimeHistory.length > 10) {
      this.frameTimeHistory.pop();
    }
    
    // Adjust adaptive configuration based on performance
    if (this.isAnimationFrame) {
      this.updateAdaptiveConfig();
    }
    
    this.dirtyRegions = [];
    this.isAnimationFrame = false;
  }
  
  /**
   * Update adaptive configuration based on recent performance
   */
  updateAdaptiveConfig() {
    // Calculate average frame time
    const avgFrameTime = this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / 
                         Math.max(1, this.frameTimeHistory.length);
    
    // If frame time is too high (e.g., > 33ms for 30fps target)
    if (avgFrameTime > 33) {
      // Gradually increase optimization
      this.adaptiveConfig.renderMargin = Math.max(1, this.adaptiveConfig.renderMargin - 1);
      this.adaptiveConfig.lodThresholds.high = Math.min(2.0, this.adaptiveConfig.lodThresholds.high + 0.1);
      this.adaptiveConfig.lodThresholds.medium = Math.min(1.0, this.adaptiveConfig.lodThresholds.medium + 0.05);
      this.adaptiveConfig.lodThresholds.low = Math.min(0.5, this.adaptiveConfig.lodThresholds.low + 0.05);
    } 
    // If frame time is very good (e.g., < 16ms for 60fps target with headroom)
    else if (avgFrameTime < 16 && this.frameTimeHistory.length >= 5) {
      // Gradually decrease optimization (improve quality)
      this.adaptiveConfig.renderMargin = Math.min(
        this.config.renderMargin,
        this.adaptiveConfig.renderMargin + 1
      );
      this.adaptiveConfig.lodThresholds.high = Math.max(
        this.config.lodThresholds.high,
        this.adaptiveConfig.lodThresholds.high - 0.05
      );
      this.adaptiveConfig.lodThresholds.medium = Math.max(
        this.config.lodThresholds.medium,
        this.adaptiveConfig.lodThresholds.medium - 0.025
      );
      this.adaptiveConfig.lodThresholds.low = Math.max(
        this.config.lodThresholds.low,
        this.adaptiveConfig.lodThresholds.low - 0.025
      );
    }
  }
  
  /**
   * Generate a unique key for a renderable entity
   * @param {string} type - Entity type
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} size - Entity size
   * @param {string} lod - Level of detail
   * @returns {string} Unique cache key
   */
  generateCacheKey(type, x, y, size, lod) {
    return `${type}_${x}_${y}_${size}_${lod}`;
  }
  
  /**
   * Divide a large rendering task into smaller chunks
   * @param {Object} bounds - Area bounds {x, y, width, height}
   * @returns {Array} Array of chunk bounds
   */
  getChunks(bounds) {
    const { x, y, width, height } = bounds;
    const { chunkSize } = this.config;
    const chunks = [];
    
    // Calculate number of chunks in each dimension
    const numX = Math.ceil(width / chunkSize);
    const numY = Math.ceil(height / chunkSize);
    
    // Create chunk bounds
    for (let cy = 0; cy < numY; cy++) {
      for (let cx = 0; cx < numX; cx++) {
        const chunkX = x + cx * chunkSize;
        const chunkY = y + cy * chunkSize;
        const chunkWidth = Math.min(chunkSize, x + width - chunkX);
        const chunkHeight = Math.min(chunkSize, y + height - chunkY);
        
        chunks.push({
          x: chunkX,
          y: chunkY,
          width: chunkWidth,
          height: chunkHeight
        });
      }
    }
    
    return chunks;
  }
  
  /**
   * Draw debug visualization of optimization boundaries
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawDebugVisualization(ctx) {
    if (!this.config.debugMode) return;
    
    const { x, y, width, height } = this.currentViewport;
    const margin = this.config.renderMargin;
    
    // Draw viewport boundary
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    
    // Draw culling boundary
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      x - margin, 
      y - margin, 
      width + 2 * margin, 
      height + 2 * margin
    );
    
    // Draw dirty regions
    ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
    for (const region of this.dirtyRegions) {
      ctx.fillRect(region.x, region.y, region.width, region.height);
    }
    
    // Draw rendering chunks
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.lineWidth = 0.5;
    const chunks = this.getChunks(this.currentViewport);
    for (const chunk of chunks) {
      ctx.strokeRect(chunk.x, chunk.y, chunk.width, chunk.height);
    }
    
    // Display current LOD level
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px sans-serif';
    ctx.fillText(`LOD: ${this.getCurrentLOD()}`, x + 5, y + 20);
    ctx.fillText(`Zoom: ${this.currentViewport.zoom.toFixed(2)}`, x + 5, y + 40);
    
    // Display average frame time
    if (this.frameTimeHistory.length > 0) {
      const avgFrameTime = this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / 
                         this.frameTimeHistory.length;
      ctx.fillText(`Frame time: ${avgFrameTime.toFixed(1)}ms`, x + 5, y + 60);
    }
  }
}

// Create and export singleton instance
const optimizer = new CanvasOptimizer();
export default optimizer;
