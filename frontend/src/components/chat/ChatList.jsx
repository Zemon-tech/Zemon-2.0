import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon,
  UserGroupIcon,
  UsersIcon,
  EllipsisHorizontalIcon 
} from "@heroicons/react/24/outline";
import { Menu } from '@headlessui/react';
import GroupChatModal from "./GroupChatModal";
import NewChatModal from "./NewChatModal";
import NewGroupChatModal from "./NewGroupChatModal";

export default function ChatList({ chats, activeChat, loading, error, onDeleteChat, onChatSelect }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isNewGroupChatModalOpen, setIsNewGroupChatModalOpen] = useState(false);
  const [isGroupChatModalOpen, setIsGroupChatModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const handleGroupChatSettings = (chat) => {
    setSelectedChat(chat);
    setIsGroupChatModalOpen(true);
  };

  const filteredChats = chats.filter(chat => {
    const searchValue = searchTerm.toLowerCase();
    if (!chat || !chat.participants) return false;
    
    if (chat.type === 'group') {
      return chat.name?.toLowerCase().includes(searchValue);
    } else {
      const otherParticipant = chat.participants.find(p => p?._id !== currentUser?.id);
      return otherParticipant?.name?.toLowerCase().includes(searchValue);
    }
  });

  const getChatName = (chat) => {
    if (!chat || !chat.participants) return 'Unknown';
    
    if (chat.type === 'group') {
      return chat.name || 'Unnamed Group';
    }
    const otherParticipant = chat.participants.find(p => p?._id !== currentUser?.id);
    return otherParticipant?.name || 'Unknown User';
  };

  const getChatAvatar = (chat) => {
    if (!chat || !chat.participants) {
      return (
        <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center">
          <span className="text-sm font-medium text-white">?</span>
        </div>
      );
    }

    if (chat.type === 'group') {
      return (
        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
          <UsersIcon className="h-6 w-6 text-white" />
        </div>
      );
    }
    
    const otherParticipant = chat.participants.find(p => p?._id !== currentUser?.id);
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
        <span className="text-sm font-medium text-white">
          {otherParticipant?.name?.charAt(0) || '?'}
        </span>
      </span>
    );
  };

  if (loading) {
    return <div className="p-4 text-center">Loading chats...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Chats</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              title="New Private Chat"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsNewGroupChatModalOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
              title="New Group Chat"
            >
              <UserGroupIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat._id}
            className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 ${
              activeChat?._id === chat._id ? "bg-gray-100" : ""
            }`}
          >
            <div 
              className="flex-1 flex items-center"
              onClick={() => onChatSelect(chat)}
            >
              {getChatAvatar(chat)}
              <div className="ml-3 min-w-0">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {getChatName(chat)}
                  </h3>
                  {chat.type === 'group' && chat.admin_id === currentUser.id && (
                    <span className="ml-2 text-xs text-gray-500">(Admin)</span>
                  )}
                </div>
                {chat.lastMessage && (
                  <div className="flex items-center">
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage.content}
                    </p>
                    <span className="ml-2 text-xs text-gray-400">
                      {format(new Date(chat.lastMessage.createdAt), 'HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Menu as="div" className="relative">
              <Menu.Button className="p-2 text-gray-400 hover:text-gray-600">
                <EllipsisHorizontalIcon className="h-5 w-5" />
              </Menu.Button>
              <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                {chat.type === 'group' && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleGroupChatSettings(chat)}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                      >
                        Manage Group
                      </button>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => onDeleteChat(chat._id)}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } block px-4 py-2 text-sm text-red-600 w-full text-left`}
                    >
                      Delete Chat
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        ))}
      </div>

      {/* Modals */}
      {isNewChatModalOpen && (
        <NewChatModal
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
        />
      )}
      {isNewGroupChatModalOpen && (
        <NewGroupChatModal
          isOpen={isNewGroupChatModalOpen}
          onClose={() => setIsNewGroupChatModalOpen(false)}
        />
      )}
      {isGroupChatModalOpen && (
        <GroupChatModal
          isOpen={isGroupChatModalOpen}
          onClose={() => setIsGroupChatModalOpen(false)}
          chat={selectedChat}
        />
      )}
    </div>
  );
}
