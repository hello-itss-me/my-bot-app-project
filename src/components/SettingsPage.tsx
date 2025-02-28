import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Trash2, Edit, PlusCircle } from 'lucide-react';

interface Agent {
  id: string;
  created_at: string;
  name: string;
  webhook_url: string;
  user_id: string;
}

export function SettingsPage() {
  const { session } = useAuthStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editedAgentName, setEditedAgentName] = useState('');
  const [editedWebhookUrl, setEditedWebhookUrl] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      fetchAgents(session.user.id);
    }
  }, [session]);

  const fetchAgents = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching agents:', error);
      } else {
        setAgents(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching agents:', error);
    }
  };

  const handleAddAgent = async () => {
    if (!session?.user?.id || !newAgentName.trim() || !newWebhookUrl.trim()) {
      alert('Please enter agent name and webhook URL.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([{ user_id: session.user.id, name: newAgentName, webhook_url: newWebhookUrl }])
        .select()
        .single();

      if (error) {
        console.error('Error adding agent:', error);
        alert('Failed to add new agent.');
      } else {
        setAgents([...agents, data]);
        setNewAgentName('');
        setNewWebhookUrl('');
      }
    } catch (error) {
      console.error('Unexpected error adding agent:', error);
      alert('Unexpected error adding agent.');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!session?.user?.id) return;
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error deleting agent:', error);
        alert('Failed to delete agent.');
      } else {
        setAgents(agents.filter(agent => agent.id !== agentId));
      }
    } catch (error) {
      console.error('Unexpected error deleting agent:', error);
      alert('Unexpected error deleting agent.');
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgentId(agent.id);
    setEditedAgentName(agent.name);
    setEditedWebhookUrl(agent.webhook_url);
  };

  const handleUpdateAgent = async () => {
    if (!session?.user?.id || !editingAgentId || !editedAgentName.trim() || !editedWebhookUrl.trim()) {
      alert('Please ensure all fields are filled.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .update({ name: editedAgentName, webhook_url: editedWebhookUrl })
        .eq('id', editingAgentId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating agent:', error);
        alert('Failed to update agent.');
      } else {
        setAgents(agents.map(agent => agent.id === editingAgentId ? data : agent));
        setEditingAgentId(null);
      }
    } catch (error) {
      console.error('Unexpected error updating agent:', error);
      alert('Unexpected error updating agent.');
    }
  };

  const handleCancelEdit = () => {
    setEditingAgentId(null);
  };


  return (
    <div className="container mx-auto p-4 dark:bg-dark-bg dark:text-light-text transition-colors duration-300">
      <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-md shadow-md border border-neutral-200 dark:border-neutral-700">
        <h3 className="text-lg font-medium mb-3 text-neutral-900 dark:text-neutral-100">My Agents</h3>
        <div className="mb-3">
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              placeholder="Agent Name"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className="border p-2 rounded-md w-1/2 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 text-neutral-900"
            />
            <input
              type="text"
              placeholder="Webhook URL"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="border p-2 rounded-md w-1/2 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 text-neutral-900"
            />
          </div>
          <button
            onClick={handleAddAgent}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-light-text bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 shadow-soft dark:shadow-soft-dark"
          >
            <PlusCircle size={16} className="mr-2" />
            Add Agent
          </button>
        </div>

        <ul>
          {agents.map(agent => (
            <li key={agent.id} className="mb-2 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
              {editingAgentId === agent.id ? (
                <div className="flex flex-grow space-x-2">
                  <input
                    type="text"
                    value={editedAgentName}
                    onChange={(e) => setEditedAgentName(e.target.value)}
                    placeholder="Agent Name"
                    className="border p-2 rounded-md flex-grow dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 text-neutral-900"
                  />
                  <input
                    type="text"
                    value={editedWebhookUrl}
                    onChange={(e) => setEditedWebhookUrl(e.target.value)}
                    placeholder="Webhook URL"
                    className="border p-2 rounded-md flex-grow dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-100 text-neutral-900"
                  />
                  <button onClick={handleUpdateAgent} className="px-3 py-2 bg-primary-500 text-light-text rounded-md hover:bg-primary-600 transition-colors duration-200">Save</button>
                  <button onClick={handleCancelEdit} className="px-3 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-200">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{agent.name}</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{agent.webhook_url}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEditAgent(agent)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors duration-200">
                      <Edit size={16} className="text-neutral-600 dark:text-neutral-400" />
                    </button>
                    <button onClick={() => handleDeleteAgent(agent.id)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors duration-200">
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
