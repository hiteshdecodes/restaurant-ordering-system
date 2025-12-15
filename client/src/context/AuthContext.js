import React, { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const SESSION_DURATION = 120 * 60 * 1000; // 120 minutes in milliseconds

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('dashboardAuth');
    if (savedAuth) {
      setIsAuthenticated(true);
      resetSessionTimer();
    }
  }, []);

  // Reset session timer on user activity
  const resetSessionTimer = useCallback(() => {
    // Clear existing timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }

    // Set new timeout
    const newTimeout = setTimeout(() => {
      logout();
    }, SESSION_DURATION);

    setSessionTimeout(newTimeout);
  }, [sessionTimeout]);

  // Login function
  const login = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('dashboardAuth', 'true');
    resetSessionTimer();
  }, [resetSessionTimer]);

  // Logout function
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('dashboardAuth');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    setSessionTimeout(null);
  }, [sessionTimeout]);

  // Add activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      resetSessionTimer();
    };

    // Listen for user activity
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [isAuthenticated, resetSessionTimer]);

  const value = {
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

