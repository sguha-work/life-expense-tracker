import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PieChart, Layers, Calendar, ChevronDown, List, X, LogOut, CreditCard } from 'lucide-react';
import { authService } from '../../services/authService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);

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
        className="absolute top-0 left-0 bottom-0 w-64 bg-white shadow-2xl z-40 flex flex-col"
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-blue-600 text-white">
          <h2 className="text-xl font-bold tracking-tight">Menu</h2>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-md transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow overflow-y-auto px-4 py-6 space-y-2 text-gray-700">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 w-full p-3 rounded-xl transition-all font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'hover:bg-gray-50 hover:text-blue-600'
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
              className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 hover:text-blue-600"
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
                        isActive ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
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
                        isActive ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
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
                        isActive ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
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

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-semibold"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};
