import React, { useEffect } from 'react';
import { AuthForm } from '../components/AuthForm';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export function LoginPage() {
  const { user, initialize, initialized } = useAuthStore();
  
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);
  
  if (initialized && user) {
    return <Navigate to="/" />;
  }
  
  return <AuthForm />;
}
