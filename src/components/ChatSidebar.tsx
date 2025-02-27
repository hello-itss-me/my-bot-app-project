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
    <div className="w-64 bg-gray-100 h-full flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle size={18} className="mr-2" />
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleSelectChat(chat.id)}
            className={`p-3 border-b border-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-200 ${
              currentChat?.id === chat.id ? 'bg-gray-200' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {chat.agent?.name || 'No Agent Selected'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {truncateText(chat.last_message, 30)}
              </p>
            </div>
            <button
              onClick={(e) => handleDeleteChat(e, chat.id)}
              className="text-gray-400 hover:text-red-500 ml-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        
        {chats.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No chats yet. Create a new chat to get started.
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <a
          href="/settings"
          className="flex items-center justify-center w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          <Settings size={18} className="mr-2" />
          <span>Settings</span>
        </a>
      </div>
    </div>
  );
}
