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
  
  return <SettingsPage />;
}
