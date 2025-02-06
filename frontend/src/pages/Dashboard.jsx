import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTasks } from '../store/slices/taskSlice';
import { fetchIdeas } from '../store/slices/ideaSlice';
import { fetchChats } from '../store/slices/chatSlice';
import TaskModal from '../components/tasks/TaskModal';
import { Toaster, toast } from 'react-hot-toast';
import {
  DocumentTextIcon, 
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  BellIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMeetingNotice, setShowMeetingNotice] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.tasks);
  const { ideas, loading: ideasLoading } = useSelector((state) => state.ideas);
  const { chats, loading: chatsLoading } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchIdeas());
    dispatch(fetchChats());
  }, [dispatch]);

  // Real calculations from actual data
  const activeTasks = tasks.filter(task => !task.completed).length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalIdeas = ideas.length;
  const totalMessages = chats.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0);
  const successRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const activeChats = chats.length;
  const pendingIdeas = ideas.filter(idea => idea.status === 'pending').length;

  // Add this function to evaluate today's priority task
  const getTodaysPriorityTask = () => {
    if (!tasks.length) return null;

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter and sort tasks based on multiple criteria
    const priorityTask = tasks
      .filter(task => {
        // Only include non-completed tasks
        if (task.completed) return false;
        
        // Convert task deadline to date object
        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);
        
        // Include tasks that are:
        // 1. Due today
        // 2. Overdue
        // 3. Due within next 3 days
        const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return daysUntilDeadline <= 3;
      })
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }

        // Then sort by deadline
        return new Date(a.deadline) - new Date(b.deadline);
      })[0]; // Get the first task after sorting

    return priorityTask;
  };

  // Get today's priority task
  const todaysPriorityTask = getTodaysPriorityTask();

  // Handle Create Task
  const handleCreateTask = () => {
    setShowTaskModal(true);
  };

  // Handle Schedule Meeting
  const handleScheduleMeeting = () => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full flex items-start space-x-4">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Feature Coming Soon
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The meeting scheduler feature is currently under development. Stay tuned!
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
        </div>
      ),
      {
        duration: 3000,
        position: 'top-center',
      }
    );
  };

  // Handle Task Click
  const handleTaskClick = (taskId) => {
    navigate(`/tasks?taskId=${taskId}`);
  };

  // Add this helper function to format role display
  const formatRole = (role) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'team-leader':
        return 'Team Leader';
      case 'user':
        return 'Team Member';
      default:
        return role;
    }
  };

  return (
    <div className="py-6 min-h-screen bg-gray-50">
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
          },
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Welcome Section with better gradients and animations */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 rounded-3xl p-8 mb-8 shadow-xl transition-all hover:shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-col">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Welcome back, {user?.name}! 👋
                  </h1>
                  <span className="text-indigo-200 text-sm mt-1">
                    {formatRole(user?.role)}
                  </span>
                </div>
                <p className="text-indigo-100 text-lg">
                  Here's what's happening with your projects today.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleCreateTask}
                  className="bg-white/15 hover:bg-white/25 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105">
                  Create Task
                </button>
                <button 
                  onClick={handleScheduleMeeting}
                  className="bg-white/15 hover:bg-white/25 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105">
                  Schedule Meeting
                </button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl w-full lg:w-auto min-w-[250px]">
              <p className="text-white text-sm font-medium mb-2">Today's Priority</p>
              {todaysPriorityTask ? (
                <div className="space-y-2">
                  <h3 className="text-white text-xl font-bold">
                    {todaysPriorityTask.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                      ${todaysPriorityTask.priority === 'high' ? 'bg-red-100 text-red-700' : 
                        todaysPriorityTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'}`}>
                      {todaysPriorityTask.priority.charAt(0).toUpperCase() + todaysPriorityTask.priority.slice(1)}
                    </span>
                    <span className="text-white/80 text-xs">
                      Due {new Date(todaysPriorityTask.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-white text-xl font-bold">
                  No urgent tasks
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid with better responsiveness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tasks Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100/50 p-3 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Tasks</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {tasksLoading ? '...' : activeTasks}
                </h3>
                <p className="text-sm text-gray-500">Active tasks</p>
              </div>
              <div className="text-green-500 text-sm font-medium flex items-center gap-1">
                <span>+{completedTasks}</span>
                <ArrowTrendingUpIcon className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Ideas Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100/50 p-3 rounded-xl">
                <LightBulbIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Ideas Submitted</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {ideasLoading ? '...' : totalIdeas}
                </h3>
                <p className="text-sm text-gray-500">Total ideas</p>
              </div>
            </div>
          </div>

          {/* Messages Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100/50 p-3 rounded-xl">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Messages</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {chatsLoading ? '...' : totalMessages}
                </h3>
                <p className="text-sm text-gray-500">Total messages</p>
              </div>
            </div>
          </div>

          {/* Team Members Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100/50 p-3 rounded-xl">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Team</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {activeChats}
                </h3>
                <p className="text-sm text-gray-500">Team members</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Activity & Stats Section with better layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <div className="flex items-center gap-3">
                <button className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                  Filter
                </button>
                <ClockIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="space-y-4">
              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-3 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : tasks.slice(0, 4).map((task) => (
                <div 
                  key={task._id} 
                  onClick={() => handleTaskClick(task._id)}
                  className="group flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100/80 transition-all duration-200 cursor-pointer">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    task.completed ? 'bg-green-500' : 'bg-blue-500'
                  } group-hover:scale-110 transition-transform`} />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                      {task.priority && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats with enhanced visuals */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm font-medium text-indigo-600">Completed Tasks</p>
                <h4 className="mt-2 text-xl font-semibold text-indigo-900">
                  {tasksLoading ? '...' : completedTasks}
                </h4>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-600">Success Rate</p>
                <h4 className="mt-2 text-xl font-semibold text-green-900">
                  {tasksLoading ? '...' : `${successRate}%`}
                </h4>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-600">Active Chats</p>
                <h4 className="mt-2 text-xl font-semibold text-purple-900">
                  {chatsLoading ? '...' : activeChats}
                </h4>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">Pending Ideas</p>
                <h4 className="mt-2 text-xl font-semibold text-yellow-900">
                  {ideasLoading ? '...' : pendingIdeas}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          task={null}
          onSubmit={(data) => {
            // Handle task creation
            console.log('Creating task:', data);
            setShowTaskModal(false);
          }}
        />
      )}
    </div>
  );
} 