import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    columns: { type: [String], default: ['To Do', 'In Progress', 'Done'] },
  },
  { timestamps: true }
);

export const Board = mongoose.model('Board', boardSchema);
