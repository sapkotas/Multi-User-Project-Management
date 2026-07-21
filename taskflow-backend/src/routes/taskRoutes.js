import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all task routes
router.use(protect);

router.route('/')
  .post(createTask);

router.route('/board/:boardId')
  .get(getTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
