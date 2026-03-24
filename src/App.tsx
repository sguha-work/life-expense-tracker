import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const DateWiseHistory = lazy(() => import('./pages/history/DateWiseHistory').then(m => ({ default: m.DateWiseHistory })));
const MonthWiseHistory = lazy(() => import('./pages/history/MonthWiseHistory').then(m => ({ default: m.MonthWiseHistory })));
const YearWiseHistory = lazy(() => import('./pages/history/YearWiseHistory').then(m => ({ default: m.YearWiseHistory })));
const Visualize = lazy(() => import('./pages/Visualize').then(m => ({ default: m.Visualize })));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-slate-100 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/history/date" element={<DateWiseHistory />} />
            <Route path="/history/month" element={<MonthWiseHistory />} />
            <Route path="/history/year" element={<YearWiseHistory />} />
            <Route path="/visualize" element={<Visualize />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
