import React, { useState, useEffect } from 'react';
import { useChatStore, type Agent } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Plus, Trash2, Edit, Save, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SettingsPage() {
  const { agents, fetchAgents, createAgent, updateAgent, deleteAgent } = useChatStore();
  const { signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('my-agents');
  
  // Form state
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentWebhook, setNewAgentWebhook] = useState('');
  
  // Edit state
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editName, setEditName] = useState('');
  const [editWebhook, setEditWebhook] = useState('');

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAgentName.trim() || !newAgentWebhook.trim()) return;
    
    try {
      await createAgent(newAgentName, newAgentWebhook);
      setNewAgentName('');
      setNewAgentWebhook('');
    } catch (error) {
      console.error('Failed to add agent:', error);
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setEditName(agent.name);
    setEditWebhook(agent.webhook_url);
  };

  const handleCancelEdit = () => {
    setEditingAgent(null);
    setEditName('');
    setEditWebhook('');
  };

  const handleSaveEdit = async () => {
    if (!editingAgent || !editName.trim() || !editWebhook.trim()) return;
    
    try {
      await updateAgent(editingAgent.id, editName, editWebhook);
      setEditingAgent(null);
      setEditName('');
      setEditWebhook('');
    } catch (error) {
      console.error('Failed to update agent:', error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await deleteAgent(agentId);
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
            <div className="flex items-center">
              <Link to="/" className="mr-4">
                <ArrowLeft size={20} className="text-gray-500 hover:text-gray-700" />
              </Link>
              <h1 className="text-lg font-medium text-gray-900">Settings</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Sign out
            </button>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('my-agents')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'my-agents'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Agents
              </button>
              <button
                onClick={() => setActiveTab('public-agents')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'public-agents'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Public Agents
              </button>
            </nav>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {activeTab === 'my-agents' ? (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">My Agents</h2>
                
                <div className="mb-8">
                  <form onSubmit={handleAddAgent} className="space-y-4">
                    <div>
                      <label htmlFor="agent-name" className="block text-sm font-medium text-gray-700">
                        Agent Name
                      </label>
                      <input
                        type="text"
                        id="agent-name"
                        value={newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                        placeholder="Enter agent name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700">
                        Webhook URL
                      </label>
                      <input
                        type="text"
                        id="webhook-url"
                        value={newAgentWebhook}
                        onChange={(e) => setNewAgentWebhook(e.target.value)}
                        placeholder="Enter webhook URL"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                      <div className="flex">
                        <AlertCircle size={18} className="mr-2 flex-shrink-0 text-amber-500" />
                        <div>
                          <p className="font-medium">CORS Limitation</p>
                          <p className="mt-1">
                            Due to browser security restrictions (CORS), direct webhook calls to external domains are not possible from the browser. 
                            In a production environment, you would need a server-side proxy or Supabase Edge Functions to handle these requests.
                          </p>
                          <p className="mt-1">
                            For testing purposes, the app will simulate responses from your webhook.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!newAgentName.trim() || !newAgentWebhook.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <Plus size={18} className="mr-2" />
                      Add Agent
                    </button>
                  </form>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Your Agents</h3>
                  
                  {agents.length === 0 ? (
                    <p className="text-gray-500">You haven't added any agents yet.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {agents.map((agent) => (
                        <li key={agent.id} className="py-4">
                          {editingAgent?.id === agent.id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Agent Name
                                </label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Webhook URL
                                </label>
                                <input
                                  type="text"
                                  value={editWebhook}
                                  onChange={(e) => setEditWebhook(e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                  <Save size={16} className="mr-1" />
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <X size={16} className="mr-1" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{agent.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{agent.webhook_url}</p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditAgent(agent)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAgent(agent.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Public Agents</h2>
                <p className="text-gray-500">
                  This feature is coming soon. You'll be able to discover and use public agents shared by the community.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
