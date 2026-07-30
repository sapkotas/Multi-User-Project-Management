import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Plus, ArrowLeft, Trash2, ArrowRight, ArrowLeftRight, Calendar, AlertTriangle } from 'lucide-react';

const KanbanView = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal / Form state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskStatus, setTaskStatus] = useState('To Do');
  const [taskDueDate, setTaskDueDate] = useState('');

  useEffect(() => {
    fetchWorkspaces();
  }, [boardId]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workspaces');
      const wsList = response.data.data.workspaces;
      setWorkspaces(wsList);
      
      // Fetch details of the current board
      fetchBoardDetails(wsList);
    } catch (error) {
      console.error('Error fetching workspaces', error);
      setLoading(false);
    }
  };

  const fetchBoardDetails = async (wsList) => {
    try {
      // Find workspace by making call/checking. We need details of this specific board first
      // Let's search for this board across workspaces.
      // Alternatively, we can just load the board directly.
      const boardRes = await api.get(`/boards/workspace/${wsList[0]?._id}`); // fallback workspace
      
      // In a real app we might fetch the board directly. Let's do that:
      // Since our getBoards takes a workspaceId, let's fetch boards for each workspace until we find our board
      let activeWs = null;
      let activeBoard = null;
      let activeBoardsList = [];

      for (let ws of wsList) {
        const res = await api.get(`/boards/workspace/${ws._id}`);
        const boardsInWs = res.data.data.boards;
        const found = boardsInWs.find((b) => b._id === boardId);
        if (found) {
          activeWs = ws;
          activeBoard = found;
          activeBoardsList = boardsInWs;
          break;
        }
      }

      if (activeBoard) {
        setBoard(activeBoard);
        setCurrentWorkspace(activeWs);
        setBoards(activeBoardsList);
        fetchTasks(activeBoard._id);
      } else {
        // If not found, redirect to dashboard
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching board details', error);
      setLoading(false);
    }
  };

  const fetchTasks = async (bId) => {
    try {
      const response = await api.get(`/tasks/board/${bId}`);
      setTasks(response.data.data.tasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks', error);
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      const response = await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        boardId: board._id,
      });
      setTasks([...tasks, response.data.data.task]);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('medium');
      setTaskStatus('To Do');
      setTaskDueDate('');
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const handleMoveTask = async (taskId, currentStatus, direction) => {
    const columns = board.columns || ['To Do', 'In Progress', 'Done'];
    const curIdx = columns.indexOf(currentStatus);
    let nextIdx = curIdx + direction;
    
    if (nextIdx < 0 || nextIdx >= columns.length) return;
    
    const nextStatus = columns[nextIdx];

    // Optimistic Update
    const prevTasks = [...tasks];
    setTasks(tasks.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t)));

    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
    } catch (error) {
      console.error('Error updating task status', error);
      // Revert if API failed
      setTasks(prevTasks);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    const prevTasks = [...tasks];
    setTasks(tasks.filter((t) => t._id !== taskId));

    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error('Error deleting task', error);
      setTasks(prevTasks);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 border border-red-500/20 text-red-400';
      case 'medium':
        return 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
      case 'low':
      default:
        return 'bg-sky-500/10 border border-sky-500/20 text-sky-400';
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handleWorkspaceChange = (ws) => {
    setCurrentWorkspace(ws);
    // Find first board in that workspace and redirect, or go to dashboard
    api.get(`/boards/workspace/${ws._id}`).then((res) => {
      const boardsInWs = res.data.data.boards;
      if (boardsInWs.length > 0) {
        navigate(`/board/${boardsInWs[0]._id}`);
      } else {
        navigate('/');
      }
    });
  };

  const columns = board?.columns || ['To Do', 'In Progress', 'Done'];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-white select-none">
      <Navbar 
        activeWorkspaceName={currentWorkspace?.name} 
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceSelect={handleWorkspaceChange}
          boards={boards}
          onAddBoardClick={() => navigate('/')} // Redirect to dashboard to create board
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 gap-4 md:gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 truncate max-w-[200px] xs:max-w-none">{board?.name || 'Loading Board...'}</h2>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5">Workspace: {currentWorkspace?.name}</p>
              </div>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all duration-200 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Kanban Board Layout */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500">Loading tasks...</div>
          ) : (
            <div className="flex-grow overflow-x-auto flex gap-4 md:gap-6 pb-4 w-full select-none cursor-grab active:cursor-grabbing scrollbar-thin touch-pan-x">
              {columns.map((column) => {
                const columnTasks = tasks.filter((t) => t.status === column);
                return (
                  <div key={column} className="w-[85vw] sm:w-80 bg-zinc-950 border border-zinc-900/80 rounded-2xl flex flex-col max-h-full overflow-hidden shrink-0">
                    {/* Column Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-900/30">
                      <h4 className="font-bold text-zinc-300 text-sm">{column}</h4>
                      <span className="text-xs font-mono font-bold bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Column Body / Cards List */}
                    <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3.5 bg-zinc-900/10">
                      {columnTasks.length === 0 ? (
                        <div className="text-center py-8 text-xs text-zinc-600 italic">No tasks in this list</div>
                      ) : (
                        columnTasks.map((task) => (
                          <div
                            key={task._id}
                            className="glass-card p-4 rounded-xl border border-white/5 hover:border-zinc-700/60 shadow-sm transition-all duration-300 flex flex-col gap-3 group relative"
                          >
                            <div className="flex items-start justify-between">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${getPriorityBadge(task.priority)}`}>
                                {task.priority}
                              </span>
                              
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-all duration-200"
                                title="Delete task"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div>
                              <h5 className="font-semibold text-sm text-zinc-200 group-hover:text-white transition-colors">{task.title}</h5>
                              {task.description && (
                                <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                              )}
                            </div>

                            {/* Card Footer */}
                            <div className="flex items-center justify-between mt-1 border-t border-zinc-900/50 pt-2.5">
                              {task.dueDate ? (
                                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{formatDueDate(task.dueDate)}</span>
                                </div>
                              ) : (
                                <div />
                              )}

                              {/* Navigation Controls */}
                              <div className="flex items-center gap-1">
                                {columns.indexOf(column) > 0 && (
                                  <button
                                    onClick={() => handleMoveTask(task._id, column, -1)}
                                    className="p-1 text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800 rounded transition-colors"
                                    title="Move left"
                                  >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {columns.indexOf(column) < columns.length - 1 && (
                                  <button
                                    onClick={() => handleMoveTask(task._id, column, 1)}
                                    className="p-1 text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800 rounded transition-colors"
                                    title="Move right"
                                  >
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card max-w-md w-full rounded-2xl p-6 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-zinc-100">Add New Task</h3>
            <p className="text-xs text-zinc-400 mt-1">Fill in the details for your new task assignment.</p>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Design database schema, Build auth UI"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Provide context and notes for this task..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors resize-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-white outline-none transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Initial Column</label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-white outline-none transition-colors"
                  >
                    {columns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold text-white transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanView;
