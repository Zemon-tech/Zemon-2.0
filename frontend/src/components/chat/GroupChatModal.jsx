import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { addGroupMembers, removeGroupMember } from '../../store/slices/chatSlice';
import { XMarkIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import axios from '../../utils/axios';

export default function GroupChatModal({ isOpen, onClose, chat: initialChat }) {
  const dispatch = useDispatch();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chat, setChat] = useState(initialChat);
  const currentUser = useSelector(state => state.auth.user);
  const isAdmin = chat?.admin?._id === currentUser?._id;

  // Update local chat state when initialChat changes
  useEffect(() => {
    setChat(initialChat);
  }, [initialChat]);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      if (!chat || !chat.participants) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/chats/users');
        
        // Filter out users who are already in the chat
        const filteredUsers = response.data.filter(user => 
          !chat.participants.some(participant => 
            participant._id === user._id || participant === user._id
          ) && user._id !== currentUser?.id
        );
        
        setAvailableUsers(filteredUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('Failed to load available users');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && chat) {
      fetchAvailableUsers();
      setSelectedUsers([]);
    }
  }, [isOpen, chat, currentUser?.id]);

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setError(null);
      
      const result = await dispatch(addGroupMembers({
        chatId: chat._id,
        userIds: selectedUsers
      })).unwrap();
      
      // Update local chat state with new participants
      setChat(result);
      
      // Update available users list
      const newAvailableUsers = availableUsers.filter(
        user => !selectedUsers.includes(user._id)
      );
      setAvailableUsers(newAvailableUsers);
      setSelectedUsers([]); // Clear selection
      
      // Close the modal if no more users are available
      if (newAvailableUsers.length === 0) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to add members:', error);
      setError(
        error.response?.data?.error || 
        error.message || 
        'Failed to add members to the group'
      );
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      setError(null);
      await dispatch(removeGroupMember({
        chatId: chat._id,
        userId
      })).unwrap();

      // Update local chat state by removing the user
      setChat(prevChat => ({
        ...prevChat,
        participants: prevChat.participants.filter(p => p._id !== userId)
      }));

      // Add the removed user back to available users
      const removedUser = chat.participants.find(p => p._id === userId);
      if (removedUser) {
        setAvailableUsers(prev => [...prev, removedUser]);
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      setError('Failed to remove member from the group');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">
              Manage Group: {chat?.name}
            </Dialog.Title>
            <button onClick={onClose}>
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
              {error}
            </div>
          )}

          {isAdmin && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">
                Add Members {selectedUsers.length > 0 && `(${selectedUsers.length} selected)`}
              </h3>
              <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto mb-2">
                {loading ? (
                  <div className="text-center py-4">Loading users...</div>
                ) : availableUsers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No users available to add</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {availableUsers.map(user => (
                      <div
                        key={user._id}
                        className={`flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer ${
                          selectedUsers.includes(user._id) ? 'bg-indigo-50' : ''
                        }`}
                        onClick={() => toggleUserSelection(user._id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                          <span className="ml-2 text-sm text-gray-500">{user.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Selected Members
              </button>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-2">Current Members</h3>
            <div className="space-y-2">
              {chat?.participants.map(participant => (
                <div key={participant._id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                      <span className="text-sm font-medium text-white">
                        {participant.name.charAt(0)}
                      </span>
                    </span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                      <p className="text-sm text-gray-500">{participant.email}</p>
                    </div>
                  </div>
                  {isAdmin && participant._id !== currentUser._id && (
                    <button
                      onClick={() => handleRemoveMember(participant._id)}
                      className="text-red-600 hover:text-red-700"
                      title="Remove member"
                    >
                      <UserMinusIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 