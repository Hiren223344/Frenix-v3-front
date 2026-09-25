import React, { createContext, useContext, useMemo } from 'react';
import {
  AnimatedToastStack,
  useAnimatedToastStack,
} from '../components/motion/animated-toast-stack';

const ToastContext = createContext(null);

// Wraps useAnimatedToastStack in a small status-named API (error/success/
// info/loading) and mounts the stack once at the app root, so any page can
// fire a toast — e.g. `useToast().error('Failed to revoke key', err.message)`
// — without wiring up its own AnimatedToastStack instance.
export function ToastProvider({ children }) {
  const { toasts, showToast, updateToast, dismissToast, clearToasts } = useAnimatedToastStack({
    defaultDuration: 4500,
    limit: 4,
  });

  const value = useMemo(
    () => ({
      error: (title, description) => showToast({ status: 'error', title, description }),
      success: (title, description) => showToast({ status: 'success', title, description }),
      info: (title, description) => showToast({ status: 'info', title, description }),
      loading: (title, description) => showToast({ status: 'loading', title, description, duration: 0 }),
      update: updateToast,
      dismiss: dismissToast,
      clear: clearToasts,
    }),
    [showToast, updateToast, dismissToast, clearToasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AnimatedToastStack toasts={toasts} onDismiss={dismissToast} position="bottom-right" placement="fixed" />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
