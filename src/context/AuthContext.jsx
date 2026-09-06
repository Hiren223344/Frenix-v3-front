import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const loginWithSession = (sessionData) => {
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
  };

  const loginWithBot = () => {
    return loginWithSession({});
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('frenix_user');
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithSession,
        loginWithBot,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}