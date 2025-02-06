import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch, useSelector } from 'react-redux';
import { createChat } from '../../store/slices/chatSlice';
import axios from '../../utils/axios';

export default function NewGroupChatModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/chats/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError(error.code === 'ERR_NETWORK' 
          ? 'Unable to connect to server. Please check if the backend is running.'
          : 'Failed to fetch users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
      setGroupName('');
      setSelectedUsers([]);
    }
  }, [isOpen]);

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      setError('Please provide a group name and select at least one user');
      return;
    }

    try {
      setError(null);
      const result = await dispatch(createChat({
        participants: selectedUsers,
        name: groupName.trim(),
        type: 'group'
      })).unwrap();
      
      onClose();
    } catch (error) {
      console.error('Failed to create group:', error);
      setError(error?.message || 'Failed to create group chat');
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
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Create New Group Chat
                    </Dialog.Title>
                  </div>
                </div>

                {error && (
                  <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 rounded">
                    {error}
                  </div>
                )}

                <div className="mt-4">
                  <label htmlFor="group-name" className="block text-sm font-medium text-gray-700">
                    Group Name
                  </label>
                  <input
                    type="text"
                    id="group-name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter group name"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Members {selectedUsers.length > 0 && `(${selectedUsers.length} selected)`}
                  </label>
                  <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-4">Loading users...</div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <div
                            key={user._id}
                            className={`flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                              selectedUsers.includes(user._id) ? 'bg-indigo-50' : ''
                            }`}
                            onClick={() => toggleUserSelection(user._id)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user._id)}
                              onChange={() => toggleUserSelection(user._id)}
                              className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <div className="ml-3 flex items-center">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                                <span className="text-sm font-medium leading-none text-white">
                                  {user.name.charAt(0)}
                                </span>
                              </span>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50"
                    onClick={handleCreateGroup}
                    disabled={!groupName.trim() || selectedUsers.length === 0}
                  >
                    Create Group
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 