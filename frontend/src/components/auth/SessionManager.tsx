import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../lib/authStore';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const SessionManager: React.FC = () => {
  const { isAuthenticated, expiresAt, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !expiresAt) {
      setShowWarning(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeRemaining = expiresAt - now;

      if (timeRemaining <= 0) {
        logout();
        navigate('/login');
      } else if (timeRemaining <= 5 * 60 * 1000) { // 5 minutes
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }, 10000); // Check every 10 seconds

    // Initial check
    const timeRemaining = expiresAt - Date.now();
    if (timeRemaining <= 0) {
      logout();
      navigate('/login');
    } else if (timeRemaining <= 5 * 60 * 1000) {
      setShowWarning(true);
    }

    return () => clearInterval(interval);
  }, [isAuthenticated, expiresAt, logout, navigate]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-rose-600 px-4 py-3 text-white shadow-xl flex items-center justify-center animate-in slide-in-from-top-4 duration-300">
      <AlertCircle className="w-5 h-5 mr-3 animate-pulse" />
      <span className="font-medium text-sm sm:text-base">
        Warning: Your secure session is expiring soon due to inactivity. You will be automatically logged out.
      </span>
    </div>
  );
};
