const mongoose = require("mongoose");

const paletteSchema = new mongoose.Schema({
name: { type: String, required: true },
colors: { type: [String], required: true }, // Array of HEX color codes
createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Palette", paletteSchema);
