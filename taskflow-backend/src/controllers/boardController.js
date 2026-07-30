import { Board } from '../models/Board.js';
import { Workspace } from '../models/Workspace.js';

// @desc    Create board
// @route   POST /api/v1/boards
export const createBoard = async (req, res) => {
  try {
    const { name, workspaceId, columns } = req.body;

    if (!name || !workspaceId) {
      return res.status(400).json({ status: 'fail', message: 'Board name and Workspace ID are required' });
    }

    // Verify workspace exists and user is a member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ status: 'fail', message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (workspace.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to create a board in this workspace' });
    }

    const board = await Board.create({
      name,
      workspace: workspaceId,
      columns: columns || ['To Do', 'In Progress', 'Done'],
    });

    res.status(201).json({ status: 'success', data: { board } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all boards in a workspace
// @route   GET /api/v1/boards/workspace/:workspaceId
export const getBoards = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Verify workspace membership
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ status: 'fail', message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (workspace.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to view boards in this workspace' });
    }

    const boards = await Board.find({ workspace: workspaceId });

    res.status(200).json({ status: 'success', results: boards.length, data: { boards } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update board
// @route   PUT /api/v1/boards/:id
export const updateBoard = async (req, res) => {
  try {
    const { name, columns } = req.body;
    let board = await Board.findById(req.params.id).populate('workspace');

    if (!board) {
      return res.status(404).json({ status: 'fail', message: 'Board not found' });
    }

    // Check workspace membership
    const workspace = board.workspace;
    const isMember = workspace.members.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (workspace.owner.toString() !== req.user._id.toString() && !isMember) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to update this board' });
    }

    board = await Board.findByIdAndUpdate(
      req.params.id,
      { name, columns },
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: 'success', data: { board } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Delete board
// @route   DELETE /api/v1/boards/:id
export const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('workspace');

    if (!board) {
      return res.status(404).json({ status: 'fail', message: 'Board not found' });
    }

    // Check workspace membership (only owner or workspace owner can delete)
    const workspace = board.workspace;
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Only workspace owner can delete boards' });
    }

    await board.deleteOne();

    res.status(200).json({ status: 'success', message: 'Board deleted successfully' });
  } catch (error) {
    // res.status(500).json({ status: 'error', message: error.message });
  }
};
