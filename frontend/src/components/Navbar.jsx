import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ activeWorkspaceName }) => {
  const { user, logout } = useContext(AuthContext);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="glass sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 text-indigo-400 font-bold text-xl hover:opacity-90 transition-opacity">
          <FolderKanban className="h-6 w-6" />
          <span>TaskFlow</span>
        </Link>
        {activeWorkspaceName && (
          <>
            <span className="text-zinc-600 font-light">/</span>
            <span className="text-zinc-300 text-sm font-medium bg-zinc-800/50 px-2.5 py-1 rounded-md border border-zinc-700/50">
              {activeWorkspaceName}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-zinc-200">{user.name}</span>
              <span className="text-xs text-zinc-500">{user.email}</span>
            </div>
            
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-sm font-semibold text-white shadow-md border border-indigo-400/30">
              {getInitials(user.name)}
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
