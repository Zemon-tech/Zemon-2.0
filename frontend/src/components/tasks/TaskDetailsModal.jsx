import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ClockIcon, 
  CalendarIcon, 
  UserCircleIcon,
  TagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function TaskDetailsModal({ isOpen, onClose, task, onStageUpdate }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'in-progress': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'pending': return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      default: return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{task.title}</h2>
                    
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                        <p className="text-gray-700">{task.description}</p>
                      </div>

                      {/* Stages Progress */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Stages Progress</h3>
                        <div className="space-y-3">
                          {task.stages?.map((stage, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <span className="text-sm font-medium text-gray-700">{stage}</span>
                              <button
                                onClick={() => onStageUpdate(task._id, stage)}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  task.stage === stage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                } hover:bg-blue-50 transition-colors`}
                              >
                                {task.stage === stage ? 'Current Stage' : 'Move to Stage'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Task Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(task.status)}`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Priority</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-50 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-green-50 text-green-700'
                          }`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                        {task.deadline && (
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Assignees */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned To</h3>
                        <div className="space-y-2">
                          {task.assignees?.map(user => (
                            <div key={user._id} className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4 bg-white">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-300"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 