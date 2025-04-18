const express = require('express');
const projectController = require('../controllers/projects');

const router = express.Router();

/**
 * Fetch all projects with optional filters and sorting.
 * Supports filtering by shared status, tags, or user-specific projects.
 */
router.get('/', async (req, res) => {
  try {
    const { shared, tags, userId } = req.query;
    const filter = {};

    if (shared) {
      filter.shared = shared === 'true';
    }
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }
    if (userId) {
      filter.userId = userId;
    }

    const projects = await projectController.getProjects(filter);
    res.status(200).json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * Create a new project.
 * Requires a name, gridSize, and userId.
 */
router.post('/', async (req, res) => {
  const { name, gridSize, userId, layers = [], metadata = {} } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Invalid or missing project name' });
  }

  if (!gridSize || typeof gridSize !== 'number') {
    return res.status(400).json({ error: 'Invalid or missing gridSize' });
  }

  try {
    const newProject = await projectController.createProject({
      name,
      gridSize,
      userId,
      layers,
      metadata,
    });
    res.status(201).json(newProject);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * Update an existing project.
 * Allows partial updates (e.g., updating only metadata or layers).
 */
router.put('/:id', async (req, res) => {
  const updates = req.body;
  const projectId = req.params.id;

  try {
    const updatedProject = await projectController.updateProject(projectId, updates);
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(updatedProject);
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/**
 * Delete a project by ID.
 */
router.delete('/:id', async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  try {
    const deletedProject = await projectController.deleteProject(projectId, userId);
    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(deletedProject);
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

/**
 * Toggle sharing status for a project.
 */
router.put('/:id/share', async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  try {
    const updatedProject = await projectController.toggleProjectSharing(projectId, userId);
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(updatedProject);
  } catch (err) {
    console.error('Error toggling sharing status:', err);
    res.status(500).json({ error: 'Failed to toggle sharing status' });
  }
});

/**
 * Duplicate a project.
 * Creates a copy of an existing project under a new name.
 */
router.post('/:id/duplicate', async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;

  try {
    const { newName } = req.body;
    if (!newName || typeof newName !== 'string' || newName.trim() === '') {
      return res.status(400).json({ error: 'Invalid or missing new project name' });
    }

    const duplicatedProject = await projectController.duplicateProject(projectId, userId, newName);
    if (!duplicatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(201).json(duplicatedProject);
  } catch (err) {
    console.error('Error duplicating project:', err);
    res.status(500).json({ error: 'Failed to duplicate project' });
  }
});

export default router;
