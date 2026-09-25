import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('frenix_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('frenix_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('frenix_user');
    }
  }, [user]);

  const loginWithSession = useCallback((sessionData) => {
    const userData = {
      id: sessionData?.telegram_id || sessionData?.id || `tg_${Math.floor(100000 + Math.random() * 900000)}`,
      username: sessionData?.username || 'telegram_user',
      displayName: sessionData?.username ? (sessionData.username.startsWith('@') ? sessionData.username : `@${sessionData.username}`) : '@telegram_user',
      sessionToken: sessionData?.session_token || null,
      authenticatedVia: 'Telegram (@frenix_bot)',
      signedInAt: new Date().toISOString()
    };
    setUser(userData);
    setIsAuthModalOpen(false);
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('frenix_user');
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loginWithSession,
    logout,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal
  }), [user, isAuthModalOpen, loginWithSession, logout, openAuthModal, closeAuthModal]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}