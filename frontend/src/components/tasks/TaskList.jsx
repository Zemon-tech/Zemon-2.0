import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: ClockIcon,
  'in-progress': ExclamationCircleIcon,
  completed: CheckCircleIcon
};

const statusColors = {
  pending: 'text-yellow-500',
  'in-progress': 'text-blue-500',
  completed: 'text-green-500'
};

const stageColors = {
  Planning: 'bg-purple-100 text-purple-800',
  Development: 'bg-blue-100 text-blue-800',
  Review: 'bg-yellow-100 text-yellow-800',
  Testing: 'bg-orange-100 text-orange-800',
  Deployment: 'bg-green-100 text-green-800'
};

export default function TaskList({ tasks, onEdit, onDelete, onStatusChange, onStageChange }) {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  
  const canUpdateTask = (task) => {
    return user.role === 'admin' || 
           user.role === 'team-leader' || 
           task.assignees.some(assignee => assignee._id === user._id);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
      {tasks.map((task) => {
        const StatusIcon = statusIcons[task.status];
        const isAssigned = task.assignees.some(assignee => assignee._id === user._id);
        
        // Calculate days left
        const dueDate = new Date(task.deadline);
        const today = new Date();
        const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        return (
          <div key={task._id} className="bg-white shadow rounded-lg p-5 flex flex-col w-full max-w-sm">
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-4 truncate">{task.title}</h3>

            {/* Add Creator and Team Leader info */}
            <div className="mb-4 space-y-2">
              {task.createdBy && (
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4 mr-1.5" />
                  <span>Created by: {task.createdBy?.name || 'Unknown'}</span>
                </div>
              )}
              {task.teamLeader && (
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4 mr-1.5" />
                  <span>Team Lead: {task.teamLeader?.name || 'Unknown'}</span>
                </div>
              )}
            </div>

            {/* Status and Priority Row */}
            <div className="flex justify-between items-center gap-3 mb-4">
              <button
                onClick={() => {
                  if (canUpdateTask(task)) {
                    const nextStatus = {
                      pending: 'in-progress',
                      'in-progress': 'completed',
                      completed: 'pending'
                    };
                    onStatusChange(task._id, nextStatus[task.status]);
                  }
                }}
                className={`flex-1 inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-medium ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : task.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
                disabled={!canUpdateTask(task)}
              >
                <StatusIcon className="h-4 w-4 mr-1.5" />
                {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
              </button>

              <span
                className={`flex-1 inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>

            {/* Due Date and Days Left Row */}
            <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1.5" />
                <span>Due: {dueDate.toLocaleDateString()}</span>
              </div>
              <div>
                <span className={`font-medium ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {daysLeft < 0 ? 'Overdue' : `${daysLeft} days left`}
                </span>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex justify-between items-center gap-3 mt-auto">
              <button
                onClick={() => navigate(`/tasks/${task._id}`)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium text-sm transition-colors text-center"
              >
                View Details
              </button>

              {canUpdateTask(task) && (
                <div className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md gap-4">
                  <button
                    onClick={() => onEdit(task)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <div className="h-5 w-px bg-gray-300"></div>
                  <button
                    onClick={() => onDelete(task._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 