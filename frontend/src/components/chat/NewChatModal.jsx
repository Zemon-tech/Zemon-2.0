import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useDispatch } from 'react-redux';
import axios from '../../utils/axios';
import { createChat, setActiveChat } from '../../store/slices/chatSlice';

export default function NewChatModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

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
    }
  }, [isOpen]);

  const handleStartChat = async () => {
    if (selectedUser) {
      try {
        setError(null);
        const result = await dispatch(createChat(selectedUser._id)).unwrap();
        dispatch(setActiveChat(result));
        onClose();
      } catch (error) {
        console.error('Failed to create chat:', error);
        setError(error?.message || 'Failed to create chat');
      }
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
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
              as={Fragment}
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
                      Start New Chat
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Select a user to start a conversation with
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show error message if there's an error */}
                {error && (
                  <div className="text-center py-4 px-6 bg-red-50 text-red-600">
                    {error}
                  </div>
                )}

                {/* User List */}
                <div className="mt-6 max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <li
                          key={user._id}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                            selectedUser?._id === user._id ? 'bg-primary-50' : ''
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                                <span className="text-sm font-medium leading-none text-white">
                                  {user.name.charAt(0)}
                                </span>
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 sm:col-start-2"
                    onClick={handleStartChat}
                    disabled={!selectedUser}
                  >
                    Start Chat
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