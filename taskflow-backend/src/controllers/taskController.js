import { Task } from '../models/Task.js';
import { Board } from '../models/Board.js';

// @desc    Create task
// @route   POST /api/v1/tasks
export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, boardId, assignedTo } = req.body;

    if (!title || !boardId) {
      return res.status(400).json({ status: 'fail', message: 'Task title and Board ID are required' });
    }

    // Verify board exists
    const board = await Board.findById(boardId).populate('workspace');
    if (!board) {
      return res.status(404).json({ status: 'fail', message: 'Board not found' });
    }

    // Check workspace membership
    const workspace = board.workspace;
    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (workspace.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to create tasks in this workspace' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'medium',
      dueDate,
      board: boardId,
      assignedTo: assignedTo || [],
    });

    res.status(201).json({ status: 'success', data: { task } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all tasks for a board
// @route   GET /api/v1/tasks/board/:boardId
export const getTasks = async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId).populate('workspace');
    if (!board) {
      return res.status(404).json({ status: 'fail', message: 'Board not found' });
    }

    // Check workspace membership
    const workspace = board.workspace;
    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (workspace.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to view tasks' });
    }

    const tasks = await Task.find({ board: boardId }).populate('assignedTo', 'name email');

    res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, board } = req.body;
    let task = await Task.findById(req.params.id).populate({
      path: 'board',
      populate: { path: 'workspace' },
    });

    if (!task) {
      return res.status(404).json({ status: 'fail', message: 'Task not found' });
    }

    // Check workspace membership
    const workspace = task.board.workspace;
    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (workspace.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to edit this task' });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate, assignedTo, board },
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: 'success', data: { task } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: 'board',
      populate: { path: 'workspace' },
    });

    if (!task) {
      return res.status(404).json({ status: 'fail', message: 'Task not found' });
    }

    // Check workspace membership
    const workspace = task.board.workspace;
    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (workspace.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({ status: 'success', message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
