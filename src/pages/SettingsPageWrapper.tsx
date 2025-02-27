import React, { useEffect } from 'react';
import { SettingsPage } from '../components/SettingsPage';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export function SettingsPageWrapper() {
  const { user, initialize, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  if (initialized && !user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="flex-1 p-4 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        <SettingsPage />
      </div>
    </div>
  );
}
