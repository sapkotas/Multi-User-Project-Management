import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Plus, Users, Settings, FolderClosed, SquareCheckBig } from 'lucide-react';

const Sidebar = ({ workspaces, currentWorkspace, onWorkspaceSelect, boards, onAddBoardClick }) => {
  return (
    <aside className="w-64 bg-zinc-950/80 border-r border-white/5 h-[calc(100vh-73px)] p-4 flex flex-col gap-6 select-none shrink-0 overflow-y-auto">
      {/* Workspaces Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2">Workspaces</label>
        <div className="flex flex-col gap-1">
          {workspaces.map((ws) => (
            <button
              key={ws._id}
              onClick={() => onWorkspaceSelect(ws)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all duration-200 ${
                currentWorkspace?._id === ws._id
                  ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
              }`}
            >
              <FolderClosed className="h-4 w-4" />
              <span className="truncate">{ws.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Boards Section */}
      {currentWorkspace && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Boards</label>
            <button
              onClick={onAddBoardClick}
              className="text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 p-1 rounded transition-colors"
              title="Create new board"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {boards.length === 0 ? (
              <span className="text-xs text-zinc-600 italic px-3 py-2">No boards created</span>
            ) : (
              boards.map((board) => (
                <NavLink
                  key={board._id}
                  to={`/board/${board._id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-zinc-800 border border-zinc-700/50 text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                    }`
                  }
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="truncate">{board.name}</span>
                </NavLink>
              ))
            )}
          </div>
        </div>
      )}

      {/* Workspace Members list if selected */}
      {currentWorkspace && (
        <div className="flex flex-col gap-2 mt-auto border-t border-white/5 pt-4">
          <div className="flex items-center justify-between px-2 text-zinc-500">
            <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" />
              <span>Team Members</span>
            </div>
            <span className="text-xs font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">
              {currentWorkspace.members?.length || 0}
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto px-2 flex flex-col gap-1.5 mt-1">
            {currentWorkspace.members?.map((member) => (
              <div key={member._id} className="flex items-center gap-2 text-xs text-zinc-400">
                <div className="h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-300">
                  {member.name?.[0].toUpperCase() || 'M'}
                </div>
                <span className="truncate" title={member.email}>{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
