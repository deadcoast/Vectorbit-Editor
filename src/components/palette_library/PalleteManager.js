// File: src/components/PalleteLibrary/PalleteManager.js
import {
  fetchPalettes,
  createPalette,
  deletePalette,
  updatePaletteTags,
  togglePaletteSharing,
} from '../api/api';
import harmonizePalette from '../utils/colorHarmony';
import {
  generateComplementary,
  generateAnalogous,
  generateTriadic,
  generateTetradic,
} from '../utils/colorTheory';
import generateRandomPalette from '../utils/randomPalette';

/**
 * Load palettes from the API and set the state.
 * Provides fallback to ensure application stability.
 * @param {Function} setPalettes - State setter for palettes.
 */
export const loadPalettes = async setPalettes => {
  try {
    const fetchedPalettes = await fetchPalettes();
    setPalettes(fetchedPalettes);
    console.log('Palettes loaded successfully.');
  } catch (err) {
    console.error('Failed to load palettes:', err);
    setPalettes([]); // Fallback to an empty array
    alert('Unable to load palettes. Please check your connection.');
  }
};

/**
 * Save a new palette with advanced validation and update the state.
 * @param {string} paletteName - Name of the new palette.
 * @param {Array} currentColors - Array of color codes for the palette.
 * @param {Function} setPalettes - State setter for palettes.
 * @param {Function} setPaletteName - State setter for palette name input.
 */
export const savePalette = async (paletteName, currentColors, setPalettes, setPaletteName) => {
  if (!paletteName.trim()) {
    return alert('Palette name cannot be empty.');
  }
  if (currentColors.length === 0) {
    return alert('Palette must contain at least one color.');
  }
  if (currentColors.length > 10) {
    return alert('A palette cannot contain more than 10 colors.');
  }

  try {
    const newPalette = await createPalette({
      name: paletteName,
      colors: currentColors,
    });
    setPalettes(prev => [...prev, newPalette]);
    setPaletteName('');
    alert('Palette saved successfully!');
  } catch (err) {
    console.error('Failed to save palette:', err);
    alert('An error occurred while saving the palette. Please try again.');
  }
};

/**
 * Delete a palette by its ID and confirm the action.
 * @param {string} id - ID of the palette to delete.
 * @param {Function} setPalettes - State setter for palettes.
 */
export const deletePaletteById = async (id, setPalettes) => {
  if (!confirm('Are you sure you want to delete this palette? This action is irreversible.')) {
    return;
  }

  try {
    await deletePalette(id);
    setPalettes(prev => prev.filter(palette => palette._id !== id));
    alert('Palette deleted successfully!');
  } catch (err) {
    console.error('Failed to delete palette:', err);
    alert('An error occurred while deleting the palette. Please try again.');
  }
};

/**
 * Generate a palette based on a base color and scheme with enhanced error handling.
 * @param {string} baseColor - The base color for the palette.
 * @param {string} scheme - The color scheme to use (complementary, analogous, etc.).
 * @returns {Array} - Generated palette colors.
 */
export const generatePalette = (baseColor, scheme) => {
  if (!baseColor) {
    console.error('Base color is required for palette generation.');
    alert('Please provide a base color.');
    return [];
  }

  try {
    switch (scheme) {
      case 'complementary':
        return generateComplementary(baseColor);
      case 'analogous':
        return generateAnalogous(baseColor);
      case 'triadic':
        return generateTriadic(baseColor);
      case 'tetradic':
        return generateTetradic(baseColor);
      default:
        console.warn(`Unknown color scheme: ${scheme}`);
        return [];
    }
  } catch (err) {
    console.error('Failed to generate palette:', err);
    alert('An error occurred while generating the palette.');
    return [];
  }
};

/**
 * Generate a random palette and set it in the state.
 * @param {Function} setGeneratedPalette - State setter for generated palettes.
 */
export const generateRandomPaletteAndSet = setGeneratedPalette => {
  try {
    const randomPalette = generateRandomPalette();
    setGeneratedPalette(randomPalette);
    console.log('Random palette generated successfully.');
  } catch (err) {
    console.error('Failed to generate random palette:', err);
    alert('An error occurred while generating a random palette.');
  }
};

/**
 * Harmonize an existing palette and update the state.
 * Allows dynamic saturation adjustment for flexibility.
 * @param {Array} generatedPalette - Array of existing palette colors.
 * @param {Function} setGeneratedPalette - State setter for generated palettes.
 * @param {number} saturationLevel - Saturation adjustment factor.
 */
export const harmonizePaletteAndSet = (
  generatedPalette,
  setGeneratedPalette,
  saturationLevel = 1.2
) => {
  if (!generatedPalette || generatedPalette.length === 0) {
    return alert('No palette available for harmonization.');
  }

  try {
    const harmonized = harmonizePalette(generatedPalette, saturationLevel);
    setGeneratedPalette(harmonized);
    console.log('Palette harmonized successfully.');
  } catch (err) {
    console.error('Failed to harmonize palette:', err);
    alert('An error occurred while harmonizing the palette.');
  }
};

/**
 * Toggle palette sharing and update its shared status in the database.
 * @param {string} id - ID of the palette to toggle sharing.
 * @param {Function} setPalettes - State setter for palettes.
 */
export const togglePaletteSharedStatus = async (id, setPalettes) => {
  try {
    const updatedPalette = await togglePaletteSharing(id);
    setPalettes(prev => prev.map(palette => (palette._id === id ? updatedPalette : palette)));
    alert(`Palette sharing ${updatedPalette.shared ? 'enabled' : 'disabled'} successfully!`);
  } catch (err) {
    console.error('Failed to toggle palette sharing:', err);
    alert("An error occurred while updating the palette's sharing status.");
  }
};
