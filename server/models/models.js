const mongoose = require('mongoose');

/**
 * Palette Schema
 * Represents a color palette with metadata and sharing options.
 */
const paletteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Palette name is required.'],
    trim: true,
    maxlength: [50, 'Palette name cannot exceed 50 characters.'],
  },
  colors: {
    type: [String],
    required: [true, 'At least one color is required.'],
    validate: {
      validator: arr => arr.every(color => /^#[0-9A-F]{6}$/i.test(color)),
      message: 'All colors must be valid HEX codes.',
    },
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: arr => arr.every(tag => typeof tag === 'string'),
      message: 'Tags must be an array of strings.',
    },
  },
  shared: {
    type: Boolean,
    default: false,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Optional: Link palettes to user accounts
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Project Schema
 * Represents a project with grid and metadata.
 */
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required.'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters.'],
  },
  gridSize: {
    type: Number,
    required: [true, 'Grid size is required.'],
    min: [1, 'Grid size must be at least 1.'],
  },
  cellColors: {
    type: Map,
    of: String,
    validate: {
      validator: map => [...map.values()].every(color => /^#[0-9A-F]{6}$/i.test(color)),
      message: 'All cell colors must be valid HEX codes.',
    },
  },
  layers: {
    type: [
      {
        name: { type: String, required: true },
        visible: { type: Boolean, default: true },
        opacity: { type: Number, default: 1, min: 0, max: 1 },
        gridData: { type: Map, of: String }, // Nested grid data per layer
      },
    ],
    default: [],
  },
  colorPalettes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Palette', // Link to palettes for the project
    default: [],
  },
  metadata: {
    author: { type: String, trim: true },
    tags: { type: [String], default: [] },
    shared: { type: Boolean, default: false },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Middleware to handle timestamps for updates.
 */
projectSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

paletteSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Models
 */
const Palette = mongoose.model('Palette', paletteSchema);
const Project = mongoose.model('Project', projectSchema);

module.exports = { Palette, Project };
