import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { Send, AlertCircle, Copy, Expand, Minimize } from 'lucide-react'; // Import Expand and Minimize icons

export function ChatInterface() {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false); // State for textarea expansion
  const { currentChat, messages, agents, isTyping, sendMessage, fetchAgents, setCurrentChatAgent } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!currentChat?.agent_id) {
      // If no agent is selected, show a warning
      alert('Please select an agent before sending a message.');
      return;
    }

    sendMessage(message);
    setMessage('');
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentId = e.target.value || null;
    setCurrentChatAgent(agentId);
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Message copied to clipboard!'); // Optional: provide user feedback
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy message to clipboard.');
    }
  };

  const toggleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    setIsExpanded(!isExpanded);
  };


  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No chat selected</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Select a chat from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <div className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 pb-2.5"> {/* Removed translate-y-[-6px] */}
        <div className="p-2 flex items-center justify-between">
          <div className="relative"> {/* Container for select and icon */}
            <select
              value={currentChat.agent_id || ''}
              onChange={handleAgentChange}
              className="block appearance-none w-full max-w-md rounded-md border border-neutral-300 dark:border-neutral-500 focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none px-3 py-2 pr-8 font-medium mt-2" // Changed mt-1 to mt-2
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id} className="bg-light-bg dark:bg-dark-bg text-neutral-900 dark:text-neutral-100">
                  {agent.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-700 dark:text-neutral-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          {!currentChat.agent_id && (
            <div className="ml-2 text-amber-600 flex items-center text-sm">
              <AlertCircle size={16} className="mr-1" />
              Please select an agent
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-500 dark:text-neutral-400 mt-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_type === 'user' ? 'justify-end' : 'justify-start'
              } relative`} // Added relative for positioning
            >
              <div className="flex items-center"> {/* Flex container for message and copy icon */}
                <div
                  className={`max-w-[70%] rounded-xl px-4 py-2 shadow-soft dark:shadow-soft-dark ${
                    msg.sender_type === 'user'
                      ? 'bg-primary-700 text-light-text'
                      : 'bg-neutral-100 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <button
                  onClick={() => handleCopyMessage(msg.content)}
                  className="ml-2 p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200" // Added button for copy icon
                  aria-label="Copy message"
                >
                  <Copy size={16} className="text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-xl px-4 py-2 bg-neutral-100 dark:bg-neutral-600 text-neutral-900 dark:text-neutral-100 shadow-soft dark:shadow-soft-dark">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-neutral-500 dark:bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-800">
        <form onSubmit={handleSendMessage} className="flex items-center relative">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className={`w-full rounded-md resize-none bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 outline-none p-3 rounded-md transition-height duration-200 ${isExpanded ? 'rows-15' : 'rows-1'}`}
              rows={isExpanded ? 15 : 1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button
              onClick={toggleExpand}
              className="absolute bottom-1 right-[1.2rem] p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
              aria-label="Expand input"
              style={{ bottom: '0.5rem' }}
            >
              {isExpanded ? <Minimize size={16} className="text-neutral-500 dark:text-neutral-400" /> : <Expand size={16} className="text-neutral-500 dark:text-neutral-400" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || !currentChat.agent_id}
            className="ml-3 inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-light-text bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors duration-200 h-full rounded-md"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
