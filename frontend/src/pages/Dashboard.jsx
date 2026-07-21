import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Plus, LayoutGrid, Calendar, KanbanSquare, CheckSquare, Layers, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals / forms state
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [wsName, setWsName] = useState('');
  const [wsDescription, setWsDescription] = useState('');
  const [boardName, setBoardName] = useState('');
  
  // Dashboard stats placeholder
  const [stats, setStats] = useState({
    totalBoards: 0,
    totalTasks: 0,
  });

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (currentWorkspace) {
      fetchBoards(currentWorkspace._id);
    } else {
      setBoards([]);
    }
  }, [currentWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workspaces');
      const wsList = response.data.data.workspaces;
      setWorkspaces(wsList);
      if (wsList.length > 0) {
        // Set first workspace as active by default if not set
        setCurrentWorkspace(wsList[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workspaces', error);
      setLoading(false);
    }
  };

  const fetchBoards = async (wsId) => {
    try {
      const response = await api.get(`/boards/workspace/${wsId}`);
      const boardList = response.data.data.boards;
      setBoards(boardList);
      setStats({
        totalBoards: boardList.length,
        totalTasks: boardList.length * 3, // placeholder stats multiplier
      });
    } catch (error) {
      console.error('Error fetching boards', error);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!wsName) return;
    try {
      const response = await api.post('/workspaces', { name: wsName, description: wsDescription });
      const newWs = response.data.data.workspace;
      setWorkspaces([...workspaces, newWs]);
      setCurrentWorkspace(newWs);
      setWsName('');
      setWsDescription('');
      setShowWorkspaceModal(false);
    } catch (error) {
      console.error('Error creating workspace', error);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardName || !currentWorkspace) return;
    try {
      const response = await api.post('/boards', { name: boardName, workspaceId: currentWorkspace._id });
      const newBoard = response.data.data.board;
      setBoards([...boards, newBoard]);
      setBoardName('');
      setShowBoardModal(false);
    } catch (error) {
      console.error('Error creating board', error);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-white select-none">
      <Navbar activeWorkspaceName={currentWorkspace?.name} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceSelect={setCurrentWorkspace}
          boards={boards}
          onAddBoardClick={() => setShowBoardModal(true)}
        />

        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-zinc-100 flex items-center gap-2">
                  Hello, {user?.name || 'Developer'}
                  <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                </h2>
                <p className="text-sm text-zinc-400 mt-1">Here is what is happening across your projects today.</p>
              </div>
              <button
                onClick={() => setShowWorkspaceModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all duration-200"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>New Workspace</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5 shadow-md">
                <div className="p-3.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Active Workspaces</span>
                  <h3 className="text-2xl font-bold text-zinc-100 mt-0.5">{workspaces.length}</h3>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5 shadow-md">
                <div className="p-3.5 rounded-xl bg-violet-500/15 text-violet-400">
                  <KanbanSquare className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Boards</span>
                  <h3 className="text-2xl font-bold text-zinc-100 mt-0.5">{stats.totalBoards}</h3>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-white/5 shadow-md">
                <div className="p-3.5 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Team Tasks</span>
                  <h3 className="text-2xl font-bold text-zinc-100 mt-0.5">{stats.totalTasks}</h3>
                </div>
              </div>
            </div>

            {/* Boards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-zinc-200">Boards in this Workspace</h4>
                {currentWorkspace && (
                  <button
                    onClick={() => setShowBoardModal(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Board</span>
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12 text-zinc-500">Loading workspaces...</div>
              ) : !currentWorkspace ? (
                <div className="glass-card border-dashed border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                  <span className="text-zinc-500 text-sm">No active workspaces. Get started by creating one.</span>
                  <button
                    onClick={() => setShowWorkspaceModal(true)}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold"
                  >
                    Create a Workspace
                  </button>
                </div>
              ) : boards.length === 0 ? (
                <div className="glass-card border-dashed border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                  <span className="text-zinc-500 text-sm">No boards inside this workspace yet.</span>
                  <button
                    onClick={() => setShowBoardModal(true)}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-semibold"
                  >
                    Create a Board
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {boards.map((board) => (
                    <Link
                      key={board._id}
                      to={`/board/${board._id}`}
                      className="glass-card p-6 rounded-2xl hover:border-indigo-500/40 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group shadow-sm min-h-[140px]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="bg-zinc-800/80 p-2.5 rounded-xl text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                          <LayoutGrid className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <h5 className="font-bold text-zinc-200 group-hover:text-white transition-colors">{board.name}</h5>
                        <p className="text-xs text-zinc-500 mt-1">Columns: {board.columns?.length || 3}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Workspace Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-zinc-100">Create New Workspace</h3>
            <p className="text-xs text-zinc-400 mt-1">Group your team boards and collaboration settings.</p>
            
            <form onSubmit={handleCreateWorkspace} className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Marketing, Dev Team"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="e.g. Asynchronous workspace for campaign setups"
                  value={wsDescription}
                  onChange={(e) => setWsDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors resize-none h-20"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowWorkspaceModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Board Modal */}
      {showBoardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-zinc-100">Create New Board</h3>
            <p className="text-xs text-zinc-400 mt-1">A visual layout for managing work inside your workspace.</p>
            
            <form onSubmit={handleCreateBoard} className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Board Name</label>
                <input
                  type="text"
                  placeholder="e.g. Product Backlog, Sprint 1"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  required
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowBoardModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
