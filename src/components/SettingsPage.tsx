import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { AlertCircle, Pencil, Trash2 } from 'lucide-react';

export function SettingsPage() {
  const { user, signOut } = useAuthStore();
  const [agents, setAgents] = useState<any[]>([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editedAgentName, setEditedAgentName] = useState('');
  const [editedWebhookUrl, setEditedWebhookUrl] = useState('');

  useEffect(() => {
    if (user) {
      fetchAgents();
    }
  }, [user]);

  const fetchAgents = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id);
      if (error) {
        console.error('Error fetching agents:', error);
      } else {
        setAgents(data || []);
      }
    } catch (error) {
        console.error('Error fetching agents:', error);
    }
  };

  const handleAddAgent = async () => {
    if (!user || !newAgentName.trim() || !newWebhookUrl.trim()) return;
    try {
      const { error } = await supabase
        .from('agents')
        .insert([{ user_id: user.id, name: newAgentName, webhook_url: newWebhookUrl }]);
      if (error) {
        console.error('Error adding agent:', error);
      } else {
        setNewAgentName('');
        setNewWebhookUrl('');
        fetchAgents();
      }
    } catch (error) {
      console.error('Error adding agent:', error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)
        .eq('user_id', user.id);
      if (error) {
        console.error('Error deleting agent:', error);
      } else {
        fetchAgents();
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleStartEdit = (agent: any) => {
    setEditingAgentId(agent.id);
    setEditedAgentName(agent.name);
    setEditedWebhookUrl(agent.webhook_url);
  };

  const handleCancelEdit = () => {
    setEditingAgentId(null);
    setEditedAgentName('');
    setEditedWebhookUrl('');
  };

  const handleSaveEdit = async (agentId: string) => {
    if (!user || !editedAgentName.trim() || !editedWebhookUrl.trim()) return;
    try {
      const { error } = await supabase
        .from('agents')
        .update({ name: editedAgentName, webhook_url: editedWebhookUrl })
        .eq('id', agentId)
        .eq('user_id', user.id);
      if (error) {
        console.error('Error updating agent:', error);
      } else {
        setEditingAgentId(null);
        setEditedAgentName('');
        setEditedWebhookUrl('');
        fetchAgents();
      }
    } catch (error) {
      console.error('Error updating agent:', error);
    }
  };


  return (
    <div className="container mx-auto px-4 pb-8">
      <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow-soft dark:shadow-soft-dark p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Settings</h2>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm font-medium rounded-md text-neutral-900 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Sign Out
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">My Agents</h3>
          <div className="mb-4 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-700">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="agentName" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Agent Name</label>
                <input
                  type="text"
                  id="agentName"
                  className="mt-1 block w-full rounded-md border-neutral-500 dark:border-neutral-500 shadow-sm sm:text-sm bg-transparent text-neutral-900 dark:text-neutral-100"
                  placeholder="Enter agent name"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="webhookUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Webhook URL</label>
                <input
                  type="url"
                  id="webhookUrl"
                  className="mt-1 block w-full rounded-md border-neutral-500 dark:border-neutral-500 shadow-sm sm:text-sm bg-transparent text-neutral-900 dark:text-neutral-100"
                  placeholder="Enter webhook URL"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={handleAddAgent}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-light-text bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              + Add Agent
            </button>
          </div>

          {agents.length === 0 ? (
            <div className="text-neutral-500 dark:text-neutral-400 mt-4">
              <AlertCircle size={20} className="inline-block mr-1 align-text-top" />
              No agents configured yet. Add your first agent.
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {agents.map(agent => (
                <li key={agent.id} className="bg-neutral-100 dark:bg-neutral-900 rounded-md p-4 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                  {editingAgentId === agent.id ? (
                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div>
                        <label htmlFor={`agentName-${agent.id}`} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Agent Name</label>
                        <input
                          type="text"
                          id={`agentName-${agent.id}`}
                          className="mt-1 block w-full rounded-md border-neutral-500 dark:border-neutral-500 shadow-sm sm:text-sm bg-transparent text-neutral-900 dark:text-neutral-100"
                          value={editedAgentName}
                          onChange={(e) => setEditedAgentName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor={`webhookUrl-${agent.id}`} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Webhook URL</label>
                        <input
                          type="url"
                          id={`webhookUrl-${agent.id}`}
                          className="mt-1 block w-full rounded-md border-neutral-500 dark:border-neutral-500 shadow-sm sm:text-sm bg-transparent text-neutral-900 dark:text-neutral-100"
                          value={editedWebhookUrl}
                          onChange={(e) => setEditedWebhookUrl(e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 flex justify-end mt-2">
                        <button
                          onClick={() => handleSaveEdit(agent.id)}
                          className="px-3 py-2 text-sm font-medium rounded-md text-light-text bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-2 text-sm font-medium rounded-md text-neutral-900 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{agent.name}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{agent.webhook_url}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                        <button
                          onClick={() => handleStartEdit(agent)}
                          className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        >
                          <Pencil size={16} className="text-neutral-700 dark:text-neutral-300" />
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent.id)}
                          className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>


      </div>
    </div>
  );
}
