import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { User } from '../../interfaces';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useOutletContext<{ user: User }>() || { user: null };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-primary flex justify-center w-full transition-colors duration-300">
      {/* 
        This is the main mobile wrapper that is centered on the screen 
        for desktop, and takes full width on mobile.
      */}
      <div className="w-full max-w-md bg-card min-h-screen relative shadow-2xl overflow-hidden flex flex-col items-center border-main border-x">
        
        {/* Topbar */}
        <header className="w-full bg-blue-600 text-white p-4 flex items-center justify-between z-20 shadow-md">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 hover:bg-blue-700 rounded-md transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold tracking-wide truncate max-w-[200px]">
              Life ExpenseTracker
            </h1>
          </div>

          {user && (
            <div 
              className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full border border-white/30 text-sm font-bold shadow-inner"
              title={user.name}
            >
              {getInitials(user.name)}
            </div>
          )}
        </header>

        {/* Sidebar Overlay & Content */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="w-full flex-grow overflow-y-auto bg-primary relative transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};
