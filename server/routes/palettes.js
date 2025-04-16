
const express = require("express");
const router = express.Router();
const { Palette } = require("../models/models");

// Middleware for validating palette data
const validatePalette = (req, res, next) => {
  const { name, colors } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Invalid or missing palette name" });
  }

  if (!Array.isArray(colors) || colors.some((color) => !/^#[0-9A-Fa-f]{6}$/.test(color))) {
    return res.status(400).json({ error: "Invalid or missing color array" });
  }

  next();
};

// Fetch all palettes with optional filters (e.g., shared, tags)
router.get("/", async (req, res) => {
  const { shared, tags } = req.query;
  const filter = {};

  if (shared) {
    filter.shared = shared === "true";
  }
  if (tags) {
    filter.tags = { $in: tags.split(",") };
  }

  try {
    const palettes = await Palette.find(filter).sort({ createdAt: -1 });
    res.status(200).json(palettes);
  } catch (err) {
    console.error("Error fetching palettes:", err);
    res.status(500).json({ error: "Failed to fetch palettes" });
  }
});

// Fetch a single palette by ID
router.get("/:id", async (req, res) => {
  try {
    const palette = await Palette.findById(req.params.id);
    if (!palette) {
      return res.status(404).json({ error: "Palette not found" });
    }

    res.status(200).json(palette);
  } catch (err) {
    console.error("Error fetching palette by ID:", err);
    res.status(500).json({ error: "Failed to fetch palette" });
  }
});

// Create a new palette
router.post("/", validatePalette, async (req, res) => {
  const { name, colors, tags = [], shared = false } = req.body;

  try {
    const newPalette = new Palette({ name, colors, tags, shared });
    await newPalette.save();
    res.status(201).json(newPalette);
  } catch (err) {
    console.error("Error creating palette:", err);
    res.status(500).json({ error: "Failed to create palette" });
  }
});

// Update a palette's tags
router.put("/:id/tags", async (req, res) => {
  const { tags } = req.body;

  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: "Tags must be an array" });
  }

  try {
    const updatedPalette = await Palette.findByIdAndUpdate(
      req.params.id,
      { tags },
      { new: true }
    );

    if (!updatedPalette) {
      return res.status(404).json({ error: "Palette not found" });
    }
    res.status(200).json(updatedPalette);
  } catch (err) {
    console.error("Error updating tags:", err);
    res.status(500).json({ error: "Failed to update tags" });
  }
});

// Toggle sharing for a palette
router.put("/:id/share", async (req, res) => {
  try {
    const palette = await Palette.findById(req.params.id);
    if (!palette) {
      return res.status(404).json({ error: "Palette not found" });
    }

    palette.shared = !palette.shared; // Toggle sharing
    await palette.save();
    res.status(200).json(palette);
  } catch (err) {
    console.error("Error toggling sharing status:", err);
    res.status(500).json({ error: "Failed to update sharing status" });
  }
});

// Update a palette's colors or name
router.put("/:id", async (req, res) => {
  const { name, colors } = req.body;

  const updateData = {};
  if (name) {
    updateData.name = name;
  }
  if (colors) {
    if (!Array.isArray(colors) || colors.some((color) => !/^#[0-9A-Fa-f]{6}$/.test(color))) {
      return res.status(400).json({ error: "Invalid color array" });
    }
    updateData.colors = colors;
  }

  try {
    const updatedPalette = await Palette.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedPalette) {
      return res.status(404).json({ error: "Palette not found" });
    }

    res.status(200).json(updatedPalette);
  } catch (err) {
    console.error("Error updating palette:", err);
    res.status(500).json({ error: "Failed to update palette" });
  }
});

// Delete a palette
router.delete("/:id", async (req, res) => {
  try {
    const deletedPalette = await Palette.findByIdAndDelete(req.params.id);
    if (!deletedPalette) {
      return res.status(404).json({ error: "Palette not found" });
    }

    res.status(200).json(deletedPalette);
  } catch (err) {
    console.error("Error deleting palette:", err);
    res.status(500).json({ error: "Failed to delete palette" });
  }
});

// Export router
module.exports = router;
