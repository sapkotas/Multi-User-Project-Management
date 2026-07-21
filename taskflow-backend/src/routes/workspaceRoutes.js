import express from 'express';
import {
  createWorkspace,
  getWorkspaces,
  updateWorkspace,
  deleteWorkspace,
} from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all workspace routes
router.use(protect);

router.route('/')
  .post(createWorkspace)
  .get(getWorkspaces);

router.route('/:id')
  .put(updateWorkspace)
  .delete(deleteWorkspace);

export default router;
