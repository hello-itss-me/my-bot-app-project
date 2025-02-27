import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from './authStore';
import { sendMessageToAgent } from '../api/webhookHandler'; // Import sendMessageToAgent

export interface Agent {
  id: string;
  name: string;
  webhook_url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
  agent?: Agent | null;
  last_message?: string | null;
}

export interface Message {
  id: string;
  chat_id: string;
  user_id: string | null;
  sender_type: 'user' | 'agent';
  content: string;
  created_at: string;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  agents: Agent[];
  loading: boolean;
  error: string | null;
  isTyping: boolean;

  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  fetchAgents: () => Promise<void>;
  createChat: () => Promise<Chat>;
  selectChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  createAgent: (name: string, webhookUrl: string) => Promise<void>;
  updateAgent: (id: string, name: string, webhookUrl: string) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  setCurrentChatAgent: (agentId: string | null) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  agents: [],
  loading: false,
  error: null,
  isTyping: false,

  fetchChats: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          agent:agents(*)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // For each chat, fetch the last message
      const chatsWithLastMessage = await Promise.all(
        data.map(async (chat) => {
          const { data: messagesData } = await supabase
            .from('messages')
            .select('content')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...chat,
            last_message: messagesData && messagesData.length > 0 ? messagesData[0].content : null
          };
        })
      );

      set({ chats: chatsWithLastMessage });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchMessages: async (chatId) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set({ messages: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchAgents: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;

      set({ agents: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createChat: async () => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    try {
      set({ loading: true, error: null });

      const newChat = {
        id: uuidv4(),
        user_id: user.id,
        agent_id: null,
      };

      const { error } = await supabase
        .from('chats')
        .insert(newChat);

      if (error) throw error;

      // Fetch the newly created chat
      const { data, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', newChat.id)
        .single();

      if (fetchError) throw fetchError;

      const chat = data as Chat;

      // Update the chats list
      set((state) => ({
        chats: [chat, ...state.chats],
        currentChat: chat,
      }));

      return chat;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  selectChat: async (chatId) => {
    try {
      set({ loading: true, error: null });

      // Find the chat in the existing chats
      const chat = get().chats.find((c) => c.id === chatId);

      if (chat) {
        set({ currentChat: chat });
        await get().fetchMessages(chatId);
      } else {
        // If not found, fetch it from the database
        const { data, error } = await supabase
          .from('chats')
          .select(`
            *,
            agent:agents(*)
          `)
          .eq('id', chatId)
          .single();

        if (error) throw error;

        set({ currentChat: data });
        await get().fetchMessages(chatId);
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (content) => {
    const user = useAuthStore.getState().user;
    const currentChat = get().currentChat;

    if (!user || !currentChat) return;

    try {
      set({ error: null });

      // Add user message to the database
      const newMessage = {
        chat_id: currentChat.id,
        user_id: user.id,
        sender_type: 'user' as const,
        content,
      };

      const { error } = await supabase
        .from('messages')
        .insert(newMessage);

      if (error) throw error;

      // Update the chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentChat.id);

      // Refresh messages
      await get().fetchMessages(currentChat.id);

      // If there's an agent assigned to this chat, send the message to the webhook
      if (currentChat.agent_id) {
        const agent = get().agents.find(a => a.id === currentChat.agent_id);
        if (agent && agent.webhook_url) {
          set({ isTyping: true });

          try {
            // Подготовка payload для Netlify Function
            const functionPayload = {
              webhook_url: agent.webhook_url, // URL вебхука n8n
              payload: { // Payload, который будет отправлен на вебхук
                message: content,
                chat_id: currentChat.id,
                user_id: user.id,
                session_id: currentChat.id,
                timestamp: new Date().toISOString(),
                sender: {
                  id: user.id,
                  email: user.email
                }
              }
            };

            // Вызов Netlify Function вместо прямого вебхука
            const response = await fetch('/.netlify/functions/webhook-proxy', { // Путь к Netlify Function
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(functionPayload),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Netlify Function error:', response.status, errorText);
              throw new Error(`Netlify Function failed: ${response.status} ${errorText}`);
            }

            const responseData = await response.json();
            console.log('Netlify Function response:', responseData);

            // Add agent response to the database
            const agentMessage = {
              chat_id: currentChat.id,
              user_id: null,
              sender_type: 'agent' as const,
              content: responseData?.output || 'No response from agent', // Use actual response here
            };

            await supabase
              .from('messages')
              .insert(agentMessage);

            // Refresh messages
            await get().fetchMessages(currentChat.id);
            set({ isTyping: false });


          } catch (webhookError) {
            console.error('Webhook error:', webhookError);

            // Create a more detailed error message
            let errorMessage = 'Error: Could not reach the agent.';

            if (webhookError instanceof Error) {
              if (webhookError.name === 'AbortError') {
                errorMessage = `Error: Request to agent timed out. Please check if the webhook URL (${agent.webhook_url}) is correct and the service is running.`;
              } else {
                errorMessage = `Error: ${webhookError.message}. Please check if the webhook URL (${agent.webhook_url}) is correct.`;
              }
            }

            // Add CORS explanation
            errorMessage += "\n\nNote: This may be due to CORS restrictions. Browser security prevents direct calls to external webhooks. In a production environment, you would need a server-side proxy or use Supabase Edge Functions to handle these requests.";

            // Add error message from agent
            const errorMessageObj = {
              chat_id: currentChat.id,
              user_id: null,
              sender_type: 'agent' as const,
              content: errorMessage,
            };

            await supabase
              .from('messages')
              .insert(errorMessageObj);

            // Refresh messages
            await get().fetchMessages(currentChat.id);
            set({ isTyping: false });
          }
        } else {
          console.log('Agent or webhook URL is missing');
          if (!agent) {
            console.log('Agent is null or undefined:', agent);
          } else if (!agent.webhook_url) {
            console.log('Webhook URL is missing:', agent);
          }
        }
      } else {
        console.log('currentChat.agent_id is missing');
      }


      // Refresh the chats list to update the last message
      await get().fetchChats();
    } catch (error) {
      set({ error: (error as Error).message });
      set({ isTyping: false });
    }
  },

  createAgent: async (name, webhookUrl) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true, error: null });

      const newAgent = {
        user_id: user.id,
        name,
        webhook_url: webhookUrl,
      };

      const { error } = await supabase
        .from('agents')
        .insert(newAgent);

      if (error) throw error;

      // Refresh agents
      await get().fetchAgents();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateAgent: async (id, name, webhookUrl) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('agents')
        .update({
          name,
          webhook_url: webhookUrl,
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh agents
      await get().fetchAgents();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteAgent: async (id) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh agents
      await get().fetchAgents();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  setCurrentChatAgent: async (agentId) => {
    const currentChat = get().currentChat;
    if (!currentChat) return;

    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('chats')
        .update({ agent_id: agentId })
        .eq('id', currentChat.id);

      if (error) throw error;

      // Update the current chat in state
      set((state) => ({
        currentChat: {
          ...state.currentChat!,
          agent_id: agentId,
          agent: state.agents.find(a => a.id === agentId) || null,
        },
      }));

      // Refresh chats
      await get().fetchChats();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteChat: async (chatId) => {
    try {
      set({ loading: true, error: null });

      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      // Remove the chat from state
      set((state) => ({
        chats: state.chats.filter(c => c.id !== chatId),
        currentChat: state.currentChat?.id === chatId ? null : state.currentChat,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
