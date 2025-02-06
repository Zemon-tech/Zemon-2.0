import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers } from '../../store/slices/authSlice';
import { 
  CalendarIcon, 
  FlagIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  TagIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function TaskModal({ isOpen, onClose, onSubmit, task = null }) {
  const dispatch = useDispatch();
  const { users, user: currentUser } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      stage: 'planning',
      deadline: new Date().toISOString().split('T')[0],
      assignees: []
    }
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [stages, setStages] = useState(task?.stages || ['Planning']);
  const [newStage, setNewStage] = useState('');
  const [selectedTeamLeader, setSelectedTeamLeader] = useState(null);
  const teamLeaders = users.filter(u => u.role === 'team-leader');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchUsers());
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (task) {
      reset({
        ...task,
        deadline: new Date(task.deadline).toISOString().split('T')[0],
        assignees: task.assignees?.map(user => user._id) || []
      });
    }
  }, [task, reset]);

  useEffect(() => {
    if (task) {
      const assignees = Array.isArray(task.assignees) ? task.assignees : [task.assignees];
      const selectedAssignees = assignees.map(assignee => 
        users.find(user => user._id === (assignee._id || assignee))
      ).filter(Boolean);
      setSelectedUsers(selectedAssignees);
    } else {
      setSelectedUsers([]);
    }
  }, [task, users]);

  useEffect(() => {
    if (task) {
      setStages(task.stages || ['Planning']);
    } else {
      setStages(['Planning']);
    }
  }, [task]);

  useEffect(() => {
    if (task && task.teamLeader) {
      setSelectedTeamLeader(task.teamLeader);
    } else {
      setSelectedTeamLeader(null);
    }
  }, [task]);

  const availableUsers = users.filter(u => 
    currentUser?.role === 'admin' || u._id !== currentUser?._id
  );

  const sectionHeading = (text, icon) => (
    <div className="flex items-center space-x-2 mb-4">
      {icon && <icon className="h-5 w-5 text-indigo-600" />}
      <h4 className="text-lg font-semibold text-gray-900">{text}</h4>
    </div>
  );

  const formSection = (children, bgColor = 'bg-white') => (
    <div className={`${bgColor} p-6 rounded-lg shadow-sm space-y-4 border border-gray-100`}>
      {children}
    </div>
  );

  const handleAddStage = () => {
    if (newStage.trim() && !stages.includes(newStage.trim())) {
      setStages([...stages, newStage.trim()]);
      setNewStage('');
    }
  };

  const handleRemoveStage = (index) => {
    if (stages.length > 1) {
      setStages(stages.filter((_, i) => i !== index));
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      title: formData.get('title').trim(),
      description: formData.get('description').trim(),
      deadline: formData.get('deadline'),
      status: formData.get('status') || 'pending',
      priority: formData.get('priority') || 'medium',
      teamLeader: selectedTeamLeader?._id || null,
      assignees: selectedUsers.map(user => user._id),
      category: formData.get('category'),
      tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean) : [],
      stages: stages,
      stage: stages[0],
      stageHistory: [{
        stage: stages[0],
        updatedAt: new Date()
      }]
    };

    if (!data.title || !data.description || !data.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit(data);
  };

  const toggleUser = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700';
      case 'medium': return 'bg-yellow-50 text-yellow-700';
      case 'low': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const inputClasses = "w-full h-11 rounded-lg border-gray-300 pl-11 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 placeholder-gray-400";
  const selectClasses = "w-full h-11 rounded-lg border-gray-300 pl-11 pr-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white";
  const iconClasses = "absolute left-3.5 top-3 h-5 w-5 text-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";

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
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-xl">
                <Dialog.Title as="div" className="border-b border-gray-200 px-6 py-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {task ? 'Edit Task' : 'Create New Task'}
                  </span>
                </Dialog.Title>

                <form onSubmit={handleSubmitForm}>
                  <div className="flex">
                    {/* Left Column - Input Fields */}
                    <div className="flex-1 p-6 space-y-6 border-r border-gray-200">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          required
                          className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Enter task title"
                          defaultValue={task?.title}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="description"
                          required
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Enter task description"
                          defaultValue={task?.description}
                        />
                      </div>

                      {/* Deadline and Status */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deadline <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="deadline"
                            required
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            defaultValue={task?.deadline?.split('T')[0]}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            name="status"
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            defaultValue={task?.status || 'pending'}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {/* Add Team Leader Selection before Category and Priority */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Team Leader
                        </label>
                        <div className="space-y-2">
                          {teamLeaders.map(leader => (
                            <button
                              key={leader._id}
                              type="button"
                              onClick={() => setSelectedTeamLeader(selectedTeamLeader?._id === leader._id ? null : leader)}
                              className={`w-full flex items-center p-3 rounded-lg border ${
                                selectedTeamLeader?._id === leader._id
                                  ? 'border-indigo-600 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium ${
                                selectedTeamLeader?._id === leader._id
                                  ? 'bg-indigo-100 text-indigo-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {leader.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3 text-left min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {leader.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  Team Leader
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Category and Priority */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                          </label>
                          <select
                            name="category"
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            defaultValue={task?.category || ''}
                          >
                            <option value="">Select Category</option>
                            <option value="development">Development</option>
                            <option value="design">Design</option>
                            <option value="marketing">Marketing</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <select
                            name="priority"
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            defaultValue={task?.priority || 'medium'}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>

                      {/* Tags and Stages */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                          </label>
                          <input
                            type="text"
                            name="tags"
                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="tag1, tag2, tag3"
                            defaultValue={task?.tags?.join(', ')}
                          />
                        </div>

                        {/* Stage Management (Admin Only) */}
                        {(currentUser?.role === 'admin' || currentUser?.role === 'team-leader') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Task Stages
                            </label>
                            <div className="space-y-2 mb-2">
                              {stages.map((stage, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                                    {stage}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveStage(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={newStage}
                                onChange={(e) => setNewStage(e.target.value)}
                                placeholder="Enter new stage"
                                className="flex-1 h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={handleAddStage}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                              >
                                Add Stage
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Assignees List */}
                    <div className="w-96 p-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned To
                      </label>
                      <div className="h-[calc(100vh-280px)] overflow-y-auto pr-2 -mr-2">
                        <div className="space-y-2">
                          {users?.map(user => (
                            <button
                              key={user._id}
                              type="button"
                              onClick={() => toggleUser(user)}
                              className={`w-full flex items-center p-3 rounded-lg border ${
                                selectedUsers.some(u => u._id === user._id)
                                  ? 'border-indigo-600 bg-indigo-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium ${
                                selectedUsers.some(u => u._id === user._id)
                                  ? 'bg-indigo-100 text-indigo-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3 text-left min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {user.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {user.email}
                                </div>
                                <div className="text-xs font-medium mt-0.5">
                                  <span className={`${
                                    user.role === 'admin' 
                                      ? 'text-indigo-600' 
                                      : user.role === 'team-leader'
                                      ? 'text-green-600'
                                      : 'text-gray-600'
                                  }`}>
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('-', ' ')}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                      {task ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 