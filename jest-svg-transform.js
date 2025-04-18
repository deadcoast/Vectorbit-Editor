/**
 * Jest Transformer for SVG Files
 * Converts SVG files into valid JavaScript modules for Jest tests.
 * Supports optional debugging and enhanced metadata for easier testing.
 */
module.exports = {
  /**
   * Transforms SVG files into a JS module export.
   * Adds `default` export for compatibility with ES modules.
   * Provides `raw` and `path` properties for advanced testing scenarios.
   *
   * @param {string} sourceText - The content of the SVG file.
   * @param {string} sourcePath - The path to the SVG file.
   * @returns {Object} - Transformed JavaScript module.
   */
  process(sourceText, sourcePath) {
    const svgContent = `
      module.exports = {
        __esModule: true,
        default: ${JSON.stringify(sourceText)},
        raw: ${JSON.stringify(sourceText || '')},
        path: ${JSON.stringify(sourcePath)},
        metadata: {
          width: '24',
          height: '24',
        },
      };
    `;
    // Disabled for production
    // console.log(\`[SVG Transformer] Processed: \${sourcePath}\`);
    return { code: svgContent };
  },

  /**
   * Generates a cache key for transformed SVG files.
   * Optimizes Jest's caching mechanism to avoid redundant transformations.
   *
   * @param {string} fileData - File content as string.
   * @param {string} filePath - Path to the SVG file.
   * @param {string} configString - Jest configuration as string.
   * @param {Object} options - Additional Jest transformation options.
   * @returns {string} - Unique cache key.
   */
  getCacheKey(fileData, filePath, configString, options) {
    // Disabled for production
    // console.log(`[SVG Transformer] Cache Key Generated: ${cacheKey}`);
    return `${fileData}-${filePath}-${configString}-${JSON.stringify(options)}`;
  },
};
