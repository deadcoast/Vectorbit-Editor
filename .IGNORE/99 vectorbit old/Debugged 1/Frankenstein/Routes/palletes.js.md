const express = require("express");
const router = express.Router();
const Palette = require("../models/Palette");

// Update tags for a palette
router.put("/:id/tags", async (req, res) => {
const { tags } = req.body;

try {
const updatedPalette = await Palette.findByIdAndUpdate(
req.params.id,
{ tags },
{ new: true }
);

```
if (!updatedPalette) return res.status(404).json({ error: "Palette not found" });
res.status(200).json(updatedPalette);
```

} catch (err) {
res.status(500).json({ error: "Failed to update tags" });
}
});

// Toggle sharing for a palette
router.put("/:id/share", async (req, res) => {
try {
const palette = await Palette.findById(req.params.id);
if (!palette) return res.status(404).json({ error: "Palette not found" });

```
palette.shared = !palette.shared; // Toggle sharing
await palette.save();
res.status(200).json(palette);
```

} catch (err) {
res.status(500).json({ error: "Failed to update sharing status" });
}
});

// Create a new palette
router.post("/", async (req, res) => {
const { name, colors } = req.body;

try {
const newPalette = new Palette({ name, colors });
await newPalette.save();
res.status(201).json(newPalette);
} catch (err) {
res.status(500).json({ error: "Failed to create palette" });
}
});

// Fetch all palettes
router.get("/", async (req, res) => {
try {
const palettes = await Palette.find();
res.status(200).json(palettes);
} catch (err) {
res.status(500).json({ error: "Failed to fetch palettes" });
}
});

// Delete a palette
router.delete("/:id", async (req, res) => {
try {
const deletedPalette = await Palette.findByIdAndDelete(req.params.id);
if (!deletedPalette) return res.status(404).json({ error: "Palette not found" });
res.status(200).json(deletedPalette);
} catch (err) {
res.status(500).json({ error: "Failed to delete palette" });
}
});

module.exports = router;
