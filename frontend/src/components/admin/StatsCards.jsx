import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

export default function StatsCards() {
  const users = useSelector((state) => state.admin.users);
  const tasks = useSelector((state) => state.tasks.tasks);
  const ideas = useSelector((state) => state.ideas.ideas);
  const chats = useSelector((state) => state.chats.chats);

  const stats = [
    {
      name: 'Total Users',
      value: users.length,
      icon: UsersIcon,
      color: 'text-blue-500',
    },
    {
      name: 'Active Tasks',
      value: tasks.filter(task => task.status !== 'completed').length,
      icon: ClipboardDocumentListIcon,
      color: 'text-green-500',
    },
    {
      name: 'Ideas Submitted',
      value: ideas.length,
      icon: LightBulbIcon,
      color: 'text-yellow-500',
    },
    {
      name: 'Active Chats',
      value: chats.length,
      icon: ChatBubbleLeftRightIcon,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${stat.color} bg-opacity-10`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </div>
      ))}
    </div>
  );
} 