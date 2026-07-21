import express from 'express';
import {
  createBoard,
  getBoards,
  updateBoard,
  deleteBoard,
} from '../controllers/boardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all board routes
router.use(protect);

router.route('/')
  .post(createBoard);

router.route('/workspace/:workspaceId')
  .get(getBoards);

router.route('/:id')
  .put(updateBoard)
  .delete(deleteBoard);

export default router;
