const path = require("path");

/**
 * Custom Jest Resolver for Advanced File Handling
 * - Supports resolution for SVG files and other custom extensions.
 * - Implements module aliasing for cleaner imports.
 * - Provides enhanced debugging and error handling.
 *
 * @param {string} request - The module request string.
 * @param {Object} options - Options provided by Jest for resolution.
 * @returns {string} - The resolved module path.
 */
module.exports = (request, options) => {
  const SUPPORTED_EXTENSIONS = [".svg", ".svgx"]; // Extensions handled by the resolver
  const MODULE_ALIASES = {
    "@/components": "src/components",
    "@/utils": "src/utils",
    "@/assets": "src/assets",
    "@/styles": "src/styles",
  };

  /**
   * Resolve SVG files or other custom extensions
   */
  const isSupportedExtension = SUPPORTED_EXTENSIONS.some((ext) =>
    request.endsWith(ext)
  );
  if (isSupportedExtension) {
    const resolvedPath = path.join(options.basedir, request);
    console.log(`[Resolver] Resolved SVG or Custom File: ${resolvedPath}`);
    return resolvedPath;
  }

  /**
   * Handle alias mappings for module imports
   */
  for (const alias in MODULE_ALIASES) {
    if (request.startsWith(alias)) {
      const aliasPath = request.replace(alias, MODULE_ALIASES[alias]);
      const resolvedAliasPath = path.resolve(options.basedir, aliasPath);
      console.log(`[Resolver] Resolved Alias: ${alias} -> ${resolvedAliasPath}`);
      return resolvedAliasPath;
    }
  }

  /**
   * Fallback to default Jest resolver
   * Ensures all other files are resolved using Jest's default mechanism.
   */
  try {
    const defaultResolvedPath = options.defaultResolver(request, options);
    console.log(`[Resolver] Default Resolved Path: ${defaultResolvedPath}`);
    return defaultResolvedPath;
  } catch (error) {
    console.error(`[Resolver] Failed to resolve: ${request}`, error);
    throw error; // Bubble up the error for debugging
  }
};
