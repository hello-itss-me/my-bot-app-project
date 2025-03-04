import React, { useEffect } from 'react';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatInterface } from '../components/ChatInterface';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export function ChatPage() {
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
      <ChatSidebar />
      <ChatInterface />
    </div>
  );
}
