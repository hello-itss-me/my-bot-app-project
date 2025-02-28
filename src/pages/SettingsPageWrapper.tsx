import React, { useEffect } from 'react';
import { SettingsPage } from '../components/SettingsPage';
import { useAuthStore } from '../store/authStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';

export function SettingsPageWrapper() {
  const { user, initialize, initialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  if (initialized && !user) {
    return <Navigate to="/login" />;
  }

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="h-screen flex overflow-hidden mt-2">
      <div className="p-4 bg-light-bg dark:bg-dark-bg transition-colors duration-300" style={{maxWidth: '800px', margin: '0 auto'}}>
        <div className="flex items-center mb-4">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center justify-center px-2 py-2 text-sm font-medium rounded-md text-neutral-900 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 shadow-soft dark:shadow-soft-dark mr-2 -ml-4"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 ">Settings</h1>
          <div className="flex-grow"></div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="ml-auto -ml-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-neutral-900 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 shadow-soft dark:shadow-soft-dark"
          >
            Sign Out
          </button>
        </div>
        <SettingsPage />
      </div>
    </div>
  );
}
