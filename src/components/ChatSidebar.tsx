import React, { useEffect } from 'react';
import { useChatStore, type Chat } from '../store/chatStore';
import { PlusCircle, Settings, Trash2 } from 'lucide-react';

export function ChatSidebar() {
  const { chats, currentChat, fetchChats, createChat, selectChat, deleteChat } = useChatStore();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleNewChat = async () => {
    try {
      const newChat = await createChat();
      await selectChat(newChat.id);
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      deleteChat(chatId);
    }
  };

  const truncateText = (text: string | null | undefined, maxLength: number) => {
    if (!text) return 'New Chat';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="w-64 h-full flex flex-col border-r border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 shadow-md dark:shadow-soft-dark transition-colors duration-300">
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center w-full py-2 px-3 bg-primary-700 text-light-text rounded-md hover:bg-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 shadow-soft dark:shadow-soft-dark"
        >
          <PlusCircle size={16} className="mr-2" />
          <span className="text-sm font-medium">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleSelectChat(chat.id)}
            className={`p-3 rounded-md cursor-pointer flex justify-between items-center hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors duration-200 ${
              currentChat?.id === chat.id ? 'bg-neutral-200 dark:bg-neutral-800' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {chat.agent?.name || 'No Agent Selected'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {truncateText(chat.last_message, 30)}
              </p>
            </div>
            <button
              onClick={(e) => handleDeleteChat(e, chat.id)}
              className="text-neutral-400 hover:text-red-500 ml-2 transition-colors duration-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {chats.length === 0 && (
          <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
            No chats yet. Create a new chat to get started.
          </div>
        )}
      </div>

      <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
        <a
          href="/settings"
          className="flex items-center justify-center w-full py-2 px-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 shadow-soft dark:shadow-soft-dark"
        >
          <Settings size={16} className="mr-2" />
          <span className="text-sm font-medium">Settings</span>
        </a>
      </div>
    </div>
  );
}
