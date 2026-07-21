import { Workspace } from '../models/Workspace.js';

// @desc    Create workspace
// @route   POST /api/v1/workspaces
export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ status: 'fail', message: 'Workspace name is required' });
    }

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json({ status: 'success', data: { workspace } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get all user workspaces (owned or member)
// @route   GET /api/v1/workspaces
export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).populate('owner', 'name email').populate('members', 'name email');

    res.status(200).json({ status: 'success', results: workspaces.length, data: { workspaces } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update workspace
// @route   PUT /api/v1/workspaces/:id
export const updateWorkspace = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    let workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ status: 'fail', message: 'Workspace not found' });
    }

    // Check ownership
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to edit this workspace' });
    }

    workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      { name, description, members },
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: 'success', data: { workspace } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/v1/workspaces/:id
export const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ status: 'fail', message: 'Workspace not found' });
    }

    // Check ownership
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to delete this workspace' });
    }

    await workspace.deleteOne();

    res.status(200).json({ status: 'success', message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
