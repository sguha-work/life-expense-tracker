import { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const ForgotPassword = lazy(() =>
  import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword }))
);
const ResetPassword = lazy(() =>
  import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword }))
);
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Categories = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const CategoryDetails = lazy(() => import('./pages/CategoryDetails').then(m => ({ default: m.CategoryDetails })));
const PaymentModeDetails = lazy(() =>
  import('./pages/PaymentModeDetails').then(m => ({ default: m.PaymentModeDetails }))
);
const PaymentModes = lazy(() => import('./pages/PaymentModes').then(m => ({ default: m.PaymentModes })));
const DateWiseHistory = lazy(() => import('./pages/history/DateWiseHistory').then(m => ({ default: m.DateWiseHistory })));
const MonthWiseHistory = lazy(() => import('./pages/history/MonthWiseHistory').then(m => ({ default: m.MonthWiseHistory })));
const YearWiseHistory = lazy(() => import('./pages/history/YearWiseHistory').then(m => ({ default: m.YearWiseHistory })));
const Visualize = lazy(() => import('./pages/Visualize').then(m => ({ default: m.Visualize })));
const ExportReport = lazy(() => import('./pages/ExportReport').then(m => ({ default: m.ExportReport })));
const ExpenseDetails = lazy(() => import('./pages/ExpenseDetails').then(m => ({ default: m.ExpenseDetails })));
const Budget = lazy(() => import('./pages/Budget').then(m => ({ default: m.Budget })));
const UserDetails = lazy(() => import('./pages/UserDetails').then(m => ({ default: m.UserDetails })));

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category-details" element={<CategoryDetails />} />
            <Route path="/payment-mode-details" element={<PaymentModeDetails />} />
            <Route path="/payment-modes" element={<PaymentModes />} />
            <Route path="/expense-details/:id" element={<ExpenseDetails />} />
            <Route path="/budget" element={<Budget />} />

            <Route path="/history/date" element={<DateWiseHistory />} />
            <Route path="/history/month" element={<MonthWiseHistory />} />
            <Route path="/history/year" element={<YearWiseHistory />} />
            <Route path="/visualize" element={<Visualize />} />
            <Route path="/export-report" element={<ExportReport />} />
            <Route path="/user-details" element={<UserDetails />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
