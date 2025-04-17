const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
name: { type: String, required: true },
gridSize: { type: Number, required: true },
cellColors: { type: Map, of: String },
colorPalettes: { type: [String], default: [] }, // Array of HEX color codes
createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);

const express = require("express");
const router = express.Router();
const multer = require("multer");
const sharp = require("sharp");
const Project = require("../models/Project");

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new project
router.post("/", async (req, res) => {
const { name, gridSize, cellColors } = req.body;

try {
const newProject = new Project({ name, gridSize, cellColors });
await newProject.save();
res.status(201).json(newProject);
} catch (err) {
res.status(500).json({ error: "Failed to create project" });
}
});

// Fetch all projects
router.get("/", async (req, res) => {
try {
const projects = await Project.find();
res.status(200).json(projects);
} catch (err) {
res.status(500).json({ error: "Failed to fetch projects" });
}
});

// Fetch a single project by ID
router.get("/:id", async (req, res) => {
try {
const project = await Project.findById(req.params.id);
if (!project) return res.status(404).json({ error: "Project not found" });
res.status(200).json(project);
} catch (err) {
res.status(500).json({ error: "Failed to fetch project" });
}
});

// Update a project
router.put("/:id", async (req, res) => {
try {
const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
new: true,
});
if (!updatedProject) return res.status(404).json({ error: "Project not found" });
res.status(200).json(updatedProject);
} catch (err) {
res.status(500).json({ error: "Failed to update project" });
}
});

// Update color palettes for a project
router.put("/:id/palettes", async (req, res) => {
try {
const { palettes } = req.body;
const updatedProject = await Project.findByIdAndUpdate(
req.params.id,
{ colorPalettes: palettes },
{ new: true }
);

```
if (!updatedProject) return res.status(404).json({ error: "Project not found" });
res.status(200).json(updatedProject);
```

} catch (err) {
res.status(500).json({ error: "Failed to update color palettes" });
}
});

// Delete a project
router.delete("/:id", async (req, res) => {
try {
const deletedProject = await Project.findByIdAndDelete(req.params.id);
if (!deletedProject) return res.status(404).json({ error: "Project not found" });
res.status(200).json(deletedProject);
} catch (err) {
res.status(500).json({ error: "Failed to delete project" });
}
});

// Convert SVG to PNG
router.post("/convert/png", upload.single("file"), async (req, res) => {
try {
const pngBuffer = await sharp(req.file.buffer).png().toBuffer();
res.type("image/png").send(pngBuffer);
} catch (err) {
res.status(500).json({ error: "Failed to convert SVG to PNG" });
}
});

// Convert SVG to JPG
router.post("/convert/jpg", upload.single("file"), async (req, res) => {
try {
const jpgBuffer = await sharp(req.file.buffer).jpeg().toBuffer();
res.type("image/jpeg").send(jpgBuffer);
} catch (err) {
res.status(500).json({ error: "Failed to convert SVG to JPG" });
}
});

module.exports = router;
