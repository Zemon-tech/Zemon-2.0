import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  CalendarIcon, 
  UserCircleIcon, 
  TagIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/slices/taskSlice';
import TaskModal from '../components/tasks/TaskModal';
import TaskList from '../components/tasks/TaskList';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

export default function Tasks() {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length
  };

  const handleCreateTask = async (formData) => {
    try {
      const taskData = {
        ...formData,
        createdBy: user._id,
        stages: formData.stages || ['Planning'],
        stage: formData.stage || 'Planning'
      };
      
      const resultAction = await dispatch(createTask(taskData));
      
      if (createTask.fulfilled.match(resultAction)) {
        setCreateModalOpen(false);
        dispatch(fetchTasks());
      } else if (createTask.rejected.match(resultAction)) {
        console.error('Failed to create task:', resultAction.error);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (formData) => {
    try {
      const response = await axios.put(`/tasks/${selectedTask._id}`, formData);
      
      if (response.data) {
        dispatch(updateTask({ id: selectedTask._id, taskData: response.data }));
        setEditModalOpen(false);
        setSelectedTask(null);
        dispatch(fetchTasks());
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(taskId)).unwrap();
        dispatch(fetchTasks());
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await dispatch(updateTask({ 
        id: taskId, 
        taskData: { status: newStatus }
      })).unwrap();
      dispatch(fetchTasks());
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleStageChange = async (taskId, newStage) => {
    try {
      await dispatch(updateTask({ 
        id: taskId, 
        taskData: { stage: newStage }
      })).unwrap();
      dispatch(fetchTasks());
    } catch (error) {
      console.error('Failed to update task stage:', error);
    }
  };

  const handleStageUpdate = async (taskId, newStage) => {
    try {
      await dispatch(updateTask({ 
        id: taskId, 
        taskData: { stage: newStage }
      })).unwrap();
      dispatch(fetchTasks());
    } catch (error) {
      console.error('Failed to update task stage:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesStage = filterStage === 'all' || task.stage.toLowerCase() === filterStage;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesStage && matchesSearch;
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'in-progress':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      default:
        return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-50 ring-red-600/10';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 ring-yellow-600/10';
      case 'low':
        return 'text-green-700 bg-green-50 ring-green-600/10';
      default:
        return 'text-gray-600 bg-gray-50 ring-gray-500/10';
    }
  };

  return (
    <div className="h-full overflow-y-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            {(user.role === 'admin' || user.role === 'team-leader') && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Task
              </button>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                  <p className="text-2xl font-semibold text-gray-900">{taskStats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{taskStats.completed}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 whitespace-nowrap">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">{taskStats.inProgress}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{taskStats.pending}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
                  <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

              {/* Stage Filter */}
              <div className="relative">
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="block w-full rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Stages</option>
                  <option value="planning">Planning</option>
                  <option value="development">Development</option>
                  <option value="review">Review</option>
                  <option value="testing">Testing</option>
                  <option value="deployment">Deployment</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onEdit={(task) => {
                setSelectedTask(task);
                setEditModalOpen(true);
              }}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
              onStageChange={handleStageChange}
            />
          )}
        </div>

        {/* Modals */}
        <TaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateTask}
        />

      <TaskModal
          isOpen={isEditModalOpen}
        onClose={() => {
            setEditModalOpen(false);
          setSelectedTask(null);
        }}
          onSubmit={handleUpdateTask}
        task={selectedTask}
      />
      </div>
    </div>
  );
} 