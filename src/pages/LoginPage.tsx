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

  return (
    <div className="h-screen flex overflow-hidden mt-2">
      <div className="p-4 bg-light-bg dark:bg-dark-bg transition-colors duration-300" style={{maxWidth: '800px', margin: '0 auto'}}>
        <AuthForm />
      </div>
    </div>
  );
}
