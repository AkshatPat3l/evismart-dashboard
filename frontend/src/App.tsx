import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { ModuleLauncher } from './pages/ModuleLauncher';
import { Cases } from './pages/Cases';
import { Analytics } from './pages/Analytics';
import { Clients } from './pages/Clients';
import { Invoices } from './pages/Invoices';
import PaymentGateway from './pages/PaymentGateway';
import { Finances } from './pages/Finances';
import { Login } from './pages/Login';
import { useAuthStore } from './lib/authStore';

const queryClient = new QueryClient();

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

import { SessionManager } from './components/auth/SessionManager';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionManager />
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '10px', background: '#333', color: '#fff' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/modules" element={<ModuleLauncher />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/pay/:id" element={<PaymentGateway />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1></div>} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
