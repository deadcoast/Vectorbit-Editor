# Finalizing Outstanding Front-End Features

**NOTE:** ALL DOCUMENTATION IS SUBJECT TO CHANGE, EXAMPLES LISTED ARE NOT DIRECT AND OR LITTERAL TRANSLATIONS TO THE SOURCE CODE.

---

Below is the step-by-step implementation plan to finalize all outstanding front-end features. This includes dynamic grid resizing, full drawing tool functionality, menus, and export options.

## Step 1: Finalize Dynamic Grid Resizing

Ensure resizing the grid dynamically adjusts the number of cells and preserves the current artwork.

Implementation

1. Update the Grid component to regenerate cells when the grid size changes while retaining colors.

1. Introduce logic to resize while keeping the art proportional.

### File: src/frontend/Grid.js

```javascript
const handleGridResize = (newGridSize) => {
const updatedColors = {};
const scale = newGridSize / gridSize;

Object.keys(cellColors).forEach((key) => {
const index = parseInt(key);
const x = index % gridSize;
const y = Math.floor(index / gridSize);
const newX = Math.floor(x _scale);
const newY = Math.floor(y_ scale);
const newIndex = newY \* newGridSize + newX;

    updatedColors[newIndex] = cellColors[index];

});

setGridSize(newGridSize);
setCellColors(updatedColors);
};

Add resizing options to the Settings Menu:

<div className="menu">
  <span>Settings</span>
  <div className="dropdown">
    <button onClick={() => handleGridResize(8)}>8x8</button>
    <button onClick={() => handleGridResize(16)}>16x16</button>
    <button onClick={() => handleGridResize(32)}>32x32</button>
    <button onClick={() => handleGridResize(64)}>64x64</button>
  </div>
</div>
```

## Step 2: Finalize Drawing Tools

Adjustable Brush Sizes

Add a size selector for the brush tool.

### File: src/frontend/Toolbar.js

```javascript
<div className="brush-size">
  <label>Brush Size:</label>
  <input
    type="number"
    value={brushSize}
    min="1"
    max="10"
    onChange={(e) => setBrushSize(parseInt(e.target.value))}
  />
</div>

// Modify handleCellClick to apply brush strokes of the selected size:

const applyBrush = (index, size) => {
const updatedColors = { ...cellColors };
const x = index % gridSize;
const y = Math.floor(index / gridSize);

for (let i = -size; i <= size; i++) {
for (let j = -size; j <= size; j++) {
const brushIndex = (y + i) _gridSize + (x + j);
if (brushIndex >= 0 && brushIndex < gridSize_ gridSize) {
updatedColors[brushIndex] = activeColor;
}
}
}

setCellColors(updatedColors);
};
```

### Finalize Eraser Tool

Modify applyBrush to support erasing:

```javascript
const handleCellClick = (index) => {
  if (activeTool === "brush") {
    applyBrush(index, brushSize);
  } else if (activeTool === "eraser") {
    applyBrush(index, brushSize, true); // Pass a flag for erasing
  }
};
```

## Step 3: Finalize Menus

File Menu

Add project saving and loading functionality.

### Save Project

```javascript
const saveProject = () => {
  const projectData = {
    gridSize,
    cellColors,
  };
  const blob = new Blob([JSON.stringify(projectData)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "project.json";
  link.click();
};
```

### Load Project

```javascript
const loadProject = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const projectData = JSON.parse(e.target.result);
    setGridSize(projectData.gridSize);
    setCellColors(projectData.cellColors);
  };
  reader.readAsText(file);
};
```

### Add buttons to the File Menu

```javascript
<button onClick={saveProject}>Save Project</button>
<input type="file" onChange={loadProject} />

## Step 4: Finalize Export Options

Ensure .svg, .png, and .jpg exports support all transformations (scale, rotation, position).

#### File: src/frontend/Grid.js

const exportToPNG = () => {
renderToCanvas(1); // Render to the hidden canvas
const canvas = canvasRef.current;
const link = document.createElement("a");
link.href = canvas.toDataURL("image/png");
link.download = "pixel-art.png";
link.click();
};

const exportToJPG = () => {
renderToCanvas(1); // Render to the hidden canvas
const canvas = canvasRef.current;
const link = document.createElement("a");
link.href = canvas.toDataURL("image/jpeg");
link.download = "pixel-art.jpg";
link.click();
};
```

### Add buttons to the Export Menu

```javascript
<div className="export-options">
  <button onClick={exportToSVG}>Export to SVG</button>
  <button onClick={exportToPNG}>Export to PNG</button>
  <button onClick={exportToJPG}>Export to JPG</button>
</div>
```

## Step 5: Test All Features

1. Grid Resizing:
   • Test resizing the grid while retaining art proportions.
   • Verify all standard bit sizes (8x8 to 1024x1024).
1. Drawing Tools:
   • Test the brush tool with adjustable sizes.
   • Test the eraser tool.
1. Menus:
   • Verify saving and loading projects.
   • Test all export options (.svg, .png, .jpg).
1. Final Integration:
   • Ensure all components (menus, tools, grid, export) work together seamlessly.

## Next Steps

After completing front-end features, the next step is back-end integration for:

1. Persistent color palette and project storage.
1. SVG-to-PNG/JPG conversion on the server.
1. API for file uploads/downloads.

## Implementing Back-End Integration for Persistent Storage and SVG-to-PNG/JPG Conversion

We will now:

1. Implement persistent storage for user-created color palettes and project files.
1. Add SVG-to-PNG/JPG conversion functionality using a back-end service.

## Step 1: Set Up the Back-End

We’ll use Node.js with Express for the back-end and MongoDB for persistent storage.

### 1.1 Initialize the Back-End

1. Create the project folder:

   ```bash
   mkdir pixelart-backend

   cd pixelart-backend
   ```

1. Initialize Node.js:

   ```bash
   npm init -y
   ```

1. Install dependencies:

   ```bash
   npm install express body-parser mongoose sharp multer cors
   ```

1. Set up the folder structure:

   ```bash
   mkdir pixelart-backend

   mkdir pixelart-backend/models
   mkdir pixelart-backend/routes
   ```

```text
pixelart-backend/
├── models/
│ └── Project.js
├── routes/
│ └── projects.js
├── server.js
└── .env
```

### 1.2 Configure the Server

#### File: server.js

```javascript
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const projectsRouter = require("./routes/projects");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/projects", projectsRouter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## Step 2: Persistent Storage for Projects

### 2.1 Define the Project Schema

#### File: models/Project.js

```javascript
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gridSize: { type: Number, required: true },
  cellColors: { type: Map, of: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);
```

### 2.2 Create API Routes

#### File: routes/projects.js

```javascript
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

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
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedProject)
      return res.status(404).json({ error: "Project not found" });
    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject)
      return res.status(404).json({ error: "Project not found" });
    res.status(200).json(deletedProject);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

module.exports = router;
```

## Step 3: SVG-to-PNG/JPG Conversion

## 3.1 Set Up Multer for File Uploads

Install Multer for handling file uploads:

```bash
npm install multer
```

### File: routes/projects.js (Updated Snippet)

```javascript
const multer = require("multer");
const sharp = require("sharp");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Convert SVG to PNG
router.post("/convert/png", upload.single("file"), async (req, res) => {
  try {
    const pngBuffer = await sharp(req.file.buffer).toFormat("png").toBuffer();
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
```

## Step 4: Front-End Integration

## 4.1 Save Project

Send project data to the back-end API.

### Save Project in File: src/frontend/Grid.js

```javascript
const saveProjectToServer = async () => {
  const projectData = { name: "My Project", gridSize, cellColors };

  try {
    const response = await fetch("<http://localhost:5000/projects>", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    if (response.ok) {
      alert("Project saved successfully!");
    } else {
      alert("Failed to save project.");
    }
  } catch (err) {
    alert("Error saving project.");
  }
};
```

## 4.2 Export PNG/JPG via Back-End

Upload the SVG and fetch the converted file.

### SVG and Fetch converted File: src/frontend/Grid.js

```javascript
const exportImage = async (format) => {
  const canvas = canvasRef.current;
  const svgBlob = new Blob([canvas.toDataURL("image/svg+xml")], {
    type: "image/svg+xml",
  });

  const formData = new FormData();
  formData.append("file", svgBlob);

  try {
    const response = await fetch(
      `http://localhost:5000/projects/convert/${format}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pixel-art.${format}`;
      link.click();
    } else {
      alert("Failed to export image.");
    }
  } catch (err) {
    alert("Error exporting image.");
  }
};
```

## Step 5: Testing

1. Run the back-end server:
   node server.js
1. Test Persistent Storage:
   • Save a project via the front-end and verify it is stored in MongoDB.
   • Fetch and load projects into the grid.
1. Test SVG-to-PNG/JPG Conversion:
   • Export SVG files and verify the PNG/JPG conversion works correctly.

Next Steps:

After completing front-end features, the next step is back-end integration for:

1. Persistent color palette and project storage.
1. SVG-to-PNG/JPG conversion on the server.
1. API for file uploads/downloads.

## Integrating a Back-End Using Node.js with Express

We will set up a Node.js back-end with Express for handling file storage, export functionality, and API endpoints. Below is a thorough implementation plan.

## Step 1: Initialize the Back-End

## 1.1 Create the Project

1. Open your terminal and create a folder for the back-end:

   ```bash
   mkdir pixelart-backend

   cd pixelart-backend
   ```

1. Initialize a new Node.js project:

```bash
npm init -y
```

## 1.2 Install Required Dependencies

```bash
npm install express body-parser mongoose multer sharp cors dotenv
```

• express: Web framework for building APIs.
• body-parser: Middleware to parse JSON request bodies.
• mongoose: ORM for MongoDB.
• multer: For handling file uploads.
• sharp: For SVG-to-PNG/JPG conversion.
• cors: To handle cross-origin requests.
• dotenv: To manage environment variables.

## 2.1 Server Configuration

Create a new file server.js:

### Create Server in File: server.js

```javascript
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// Import routes
const projectsRouter = require("./routes/projects");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/projects", projectsRouter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## 3.1 Create the models Folder

Inside the pixelart-backend directory, create a folder named models.

## 3.2 Create the Project Model

Create a file models/Project.js:

### Create Project Model in File: models/Project.js

````javascript
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
name: { type: String, required: true },
gridSize: { type: Number, required: true },
cellColors: { type: Map, of: String },
createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);

## 3.3 Create API Routes

## 3.4 Create the routes Folder

Inside the pixelart-backend directory, create a folder named routes.

## 3.5 Create the Projects API

Create a file routes/projects.js:

### Create Projects API in File: routes/projects.js

```javascript
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

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

module.exports = router;
````

## Step 5: SVG-to-PNG/JPG Conversion

## 5.1 Add Conversion Routes

Update routes/projects.js to handle file uploads and conversions.

### Add Conversion Routes in File: routes/projects.js

```javascript
const multer = require("multer");
const sharp = require("sharp");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Convert SVG to PNG
router.post("/convert/png", upload.single("file"), async (req, res) => {
  try {
    const pngBuffer = await sharp(req.file.buffer).toFormat("png").toBuffer();
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
```

## 6.1 Test the Back-End

1. Run the Server:

````bash
node server.js

2. Test API Endpoints:

• Use tools like Postman or curl to test:

• Create a project (POST /projects).

• Fetch all projects (GET /projects).

• Convert SVG files to PNG/JPG (POST /projects/convert/png and /convert/jpg).

---

---

Integrating the Front-End with the Back-End

We will now integrate the front-end with the Node.js back-end to handle project saving, loading, and file exports. This integration will allow the front-end to utilize the APIs we created in the back-end.

## Step 1: Connect the Front-End to the Back-End

1.1 Install Axios

Axios will be used to make HTTP requests from the front-end to the back-end.

Install Axios:

```bash
npm install axios
````

## 1.2 Create an API Utility

Centralize all API calls in a single file for maintainability.

### Create API Utility in File: src/api/api.js

```javascript
import axios from "axios";

const API_BASE_URL = "<http://localhost:5000>";

export const createProject = async (project) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/projects`, project);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`);
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const fetchProjectById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project by ID:", error);
    throw error;
  }
};

export const updateProject = async (id, project) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/projects/${id}`, project);
    return response.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const convertSvgToPng = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(
      `${API_BASE_URL}/projects/convert/png`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error converting SVG to PNG:", error);
    throw error;
  }
};

export const convertSvgToJpg = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(
      `${API_BASE_URL}/projects/convert/jpg`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error converting SVG to JPG:", error);
    throw error;
  }
};
```

## 2.1 Save Project

Add a “Save Project” button to the front-end and implement the save logic.

### Add Save Project Button in File: src/frontend/Grid.js

```javascript
import { createProject } from "../api/api";

const saveProject = async () => {
  const projectData = {
    name: "My Project",
    gridSize,
    cellColors,
  };

  try {
    const savedProject = await createProject(projectData);
    alert(`Project saved successfully! ID: ${savedProject._id}`);
  } catch (error) {
    alert("Failed to save project.");
  }
};
```

Add a button to the toolbar or menu:

```javascript
<button onClick={saveProject}>Save Project</button>
```

## 2.2 Load Projects

Fetch and display saved projects in a dropdown or sidebar.

### Fetch Projects in File: src/frontend/Grid.js

```javascript
import { fetchProjects } from "../api/api";
import { useState, useEffect } from "react";

const [projects, setProjects] = useState([]);

useEffect(() => {
const loadProjects = async () => {
try {
const loadedProjects = await fetchProjects();
setProjects(loadedProjects);
} catch (error) {
alert("Failed to fetch projects.");
}
};

loadProjects();
}, []);

const loadProject = (project) => {
setGridSize(project.gridSize);
setCellColors(project.cellColors);
};

return (

  <div>
    <h3>Saved Projects</h3>
    <ul>
      {projects.map((project) => (
        <li key={project._id}>
          <button onClick={() => loadProject(project)}>{project.name}</button>
        </li>
      ))}
    </ul>
  </div>
);
};
```

## 3.1 Export SVG and Convert to PNG/JPG

Upload the current SVG to the back-end for conversion.

### Upload SVG to Back-End in File: src/frontend/Grid.js

```javascript
import { convertSvgToPng, convertSvgToJpg } from "../api/api";

const exportToImage = async (format) => {
  const canvas = canvasRef.current;
  const svgBlob = new Blob([canvas.toDataURL("image/svg+xml")], {
    type: "image/svg+xml",
  });

  try {
    let response;
    if (format === "png") {
      response = await convertSvgToPng(svgBlob);
    } else if (format === "jpg") {
      response = await convertSvgToJpg(svgBlob);
    }

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([response]));
    link.download = `pixel-art.${format}`;
    link.click();
  } catch (error) {
    alert(`Failed to export to ${format}`);
  }
};
```

Add buttons for exporting to PNG and JPG;

```html
<button onClick={() => exportToImage("png")}>Export to PNG</button>
<button onClick={() => exportToImage("jpg")}>Export to JPG</button>
```

## 3.2 Test Front-End and Back-End Integration

## 3.2.1 Run the Back-End

Start the back-end server:

```bash
node server.js
```

## 3.2.2 Run the Front-End

Start the React development server:

```bash
npm start
```

## 3.2.3 Test Features

• Save Project: Verify that project data is saved in the back-end and accessible via the API.
• Load Projects: Ensure projects can be fetched and loaded into the grid.
• Export Options: Test exporting SVG to PNG and JPG via the back-end.

## 3.2.4 Test All Features

1. Grid Resizing:
   • Test resizing the grid while retaining art proportions.
   • Verify all standard bit sizes (8x8 to 1024x1024).
1. Drawing Tools:
   • Test the brush tool with adjustable sizes.
   • Test the eraser tool.
1. Menus:
   • Verify saving and loading projects.
   • Test all export options (.svg, .png, .jpg).
1. Final Integration:
   • Ensure all components (menus, tools, grid, export) work together seamlessly.

Enhancing Custom Palette Storage, Settings, and Zoom Features

We will focus on the following tasks:

1. Persistent Storage for Custom Color Palettes (back-end integration).
2. Advanced Customization Options in the Settings Menu (e.g., format presets).
3. Enhanced Zoom Functionality (smooth zooming and keyboard shortcuts).
4. Persistent Storage for Custom Color Palettes

## 1.1 Back-End: Extend Project Schema for Palettes

Add a colorPalettes field to the Project schema.

### Add colorPalettes field to File: models/Project.js

````javascript
const projectSchema = new mongoose.Schema({
name: { type: String, required: true },
gridSize: { type: Number, required: true },
cellColors: { type: Map, of: String },
colorPalettes: { type: [String], default: [] }, // Array of HEX color codes
createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", projectSchema);

## 1.2 API: Add Endpoints for Color Palettes

Update the routes/projects.js file to handle saving and loading palettes.

### File: routes/projects.js

// Update color palettes for a project
router.put("/:id/palettes", async (req, res) => {
try {
const { palettes } = req.body;
const updatedProject = await Project.findByIdAndUpdate(
req.params.id,
{ colorPalettes: palettes },
{ new: true }
);

    if (!updatedProject) return res.status(404).json({ error: "Project not found" });
    res.status(200).json(updatedProject);

} catch (err) {
res.status(500).json({ error: "Failed to update color palettes" });
}
});

## 1.3 Front-End: Integrate Palette Storage

Update the Grid.js component to save and load custom palettes.

### File: src/frontend/Grid.js

import { updateProject } from "../api/api";

const savePalette = async (projectId, palettes) => {
try {
const updatedProject = await updateProject(projectId, { palettes });
alert("Palettes saved successfully!");
} catch (error) {
alert("Failed to save palettes.");
}
};

const loadPalettes = async (projectId) => {
try {
const project = await fetchProjectById(projectId);
setCustomPalettes(project.colorPalettes);
} catch (error) {
alert("Failed to load palettes.");
}
};

2. Advanced Customization Options in the Settings Menu

## 2.1 Add Format Presets

Enable users to set and save default export file formats (e.g., .svg, .png, .jpg).

### File: src/frontend/Grid.js

```javascript
const [defaultFormat, setDefaultFormat] = useState("svg");

const saveDefaultFormat = () => {
localStorage.setItem("defaultFormat", defaultFormat);
alert(`Default format saved: ${defaultFormat}`);
};

const loadDefaultFormat = () => {
const format = localStorage.getItem("defaultFormat");
if (format) setDefaultFormat(format);
};

useEffect(() => {
loadDefaultFormat();
}, []);

Add the format selector to the Settings Menu:

<div className="settings">
  <h3>Default Export Format</h3>
  <select value={defaultFormat} onChange={(e) => setDefaultFormat(e.target.value)}>
    <option value="svg">SVG</option>
    <option value="png">PNG</option>
    <option value="jpg">JPG</option>
  </select>
  <button onClick={saveDefaultFormat}>Save Format</button>
</div>

3. Enhanced Zoom Functionality

## 3.1 Add Smooth Zooming

Update the grid display to support smooth zoom levels.

### File: src/frontend/Grid.js

```javascript
const [zoomLevel, setZoomLevel] = useState(1);

const handleZoom = (zoomIn) => {
setZoomLevel((prev) => Math.min(Math.max(prev + (zoomIn ? 0.1 : -0.1), 0.5), 2));
};

Apply the zoom level to the grid:

<div
  className="grid"
  style={{
    transform: `scale(${zoomLevel})`,
    transformOrigin: "0 0",
  }}
>
  {createGrid()}
</div>

Add zoom controls:

<div className="zoom-controls">
  <button onClick={() => handleZoom(true)}>Zoom In</button>
  <button onClick={() => handleZoom(false)}>Zoom Out</button>
</div>

## 3.2 Add Keyboard Shortcuts

Enable + and - for zooming.

### File: src/frontend/Grid.js

```javascript
useEffect(() => {
const handleKeyDown = (e) => {
if (e.key === "+") handleZoom(true);
if (e.key === "-") handleZoom(false);
};

window.addEventListener("keydown", handleKeyDown);
return () => {
window.removeEventListener("keydown", handleKeyDown);
};
}, []);
````

## 4. Test and Validate

1. Run the back-end server:

   ```bash
   node server.js
   ```

1. Test Palette Storage:
   • Save a custom palette to a project.
   • Reload the project and verify the palette is restored.

1. Test Format Presets:
   • Save a default file format.
   • Verify the correct format is pre-selected during export.

1. Test Enhanced Zoom:
   • Use the zoom controls and keyboard shortcuts.
   • Ensure the grid scales smoothly and maintains proper alignment.
