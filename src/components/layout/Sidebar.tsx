import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PieChart, Layers, Calendar, ChevronDown, List, X, LogOut, CreditCard, Sun, Moon } from 'lucide-react';
import { authService } from '../../services/authService';
import { useTheme } from '../../configuration/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Categories', path: '/categories', icon: <Layers size={20} /> },
    { name: 'Payment Modes', path: '/payment-modes', icon: <CreditCard size={20} /> },
    { name: 'Visualize', path: '/visualize', icon: <PieChart size={20} /> },
  ];

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-30"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-0 left-0 bottom-0 w-64 bg-card shadow-2xl z-40 flex flex-col border-main border-r"
      >
        <div className="p-4 flex items-center justify-between border-b border-main bg-blue-600 text-white">
          <h2 className="text-xl font-bold tracking-tight">Menu</h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-md transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow overflow-y-auto px-4 py-6 space-y-2 text-main">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 w-full p-3 rounded-xl transition-all font-medium ${
                  isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}

          {/* Accordion Menu */}
          <div className="pt-2">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors font-medium text-main hover:text-blue-600 dark:hover:text-blue-400"
            >
              <div className="flex items-center space-x-3">
                <Calendar size={20} />
                <span>History</span>
              </div>
              <motion.div animate={{ rotate: isHistoryOpen ? 180 : 0 }}>
                <ChevronDown size={16} />
              </motion.div>
            </button>
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden flex flex-col space-y-1 pl-10 pt-1"
                >
                  <NavLink
                    to="/history/date"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                        isActive ? 'text-blue-600 font-semibold' : 'text-muted hover:text-blue-600 dark:hover:text-blue-400'
                      }`
                    }
                  >
                    <List size={16} /> <span>Date-wise</span>
                  </NavLink>
                  <NavLink
                    to="/history/month"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                        isActive ? 'text-blue-600 font-semibold' : 'text-muted hover:text-blue-600 dark:hover:text-blue-400'
                      }`
                    }
                  >
                    <Calendar size={16} /> <span>Month-wise</span>
                  </NavLink>
                  <NavLink
                    to="/history/year"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 p-2 rounded-lg transition-colors text-sm ${
                        isActive ? 'text-blue-600 font-semibold' : 'text-muted hover:text-blue-600 dark:hover:text-blue-400'
                      }`
                    }
                  >
                    <Layers size={16} /> <span>Yearly</span>
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="p-4 border-t border-main space-y-3">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center space-x-2 w-full p-3 text-main bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors font-semibold"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full p-3 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors font-semibold"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};
