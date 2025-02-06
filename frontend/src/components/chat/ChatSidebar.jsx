import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveChat } from '../../store/slices/chatSlice';
import { format } from 'date-fns';
import { 
  MagnifyingGlassIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import NewChatModal from './NewChatModal';

export default function ChatSidebar({ chats, activeChat, loading, error, socket }) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);

  const filteredChats = chats.filter(chat => {
    const otherParticipant = chat.participants.find(p => p._id !== currentUser._id);
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getLastMessage = (chat) => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (!lastMessage) return 'No messages yet';
    return lastMessage.content;
  };

  const getLastMessageTime = (chat) => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (!lastMessage) return '';
    return format(new Date(lastMessage.createdAt), 'h:mm a');
  };

  return (
    <div className="w-96 flex-shrink-0 border-r border-gray-200 bg-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Chats</h2>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-500"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border-gray-300 pl-10 pr-4 focus:border-primary-500 focus:ring-primary-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Chat List */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => {
              const isActive = activeChat?._id === chat._id;
              const otherParticipant = chat.participants.find(p => p._id !== currentUser._id);
              
              return (
                <button
                  key={chat._id}
                  onClick={() => dispatch(setActiveChat(chat))}
                  className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 focus:outline-none transition-colors ${
                    isActive ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
                        <span className="font-medium text-white">
                          {otherParticipant?.name.charAt(0)}
                        </span>
                      </span>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {otherParticipant?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getLastMessageTime(chat)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {getLastMessage(chat)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
      />
    </div>
  );
} 