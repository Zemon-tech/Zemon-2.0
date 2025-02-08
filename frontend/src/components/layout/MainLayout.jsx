import { Fragment, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition, Disclosure, Menu } from '@headlessui/react';
import {
  HomeIcon,
  XMarkIcon,
  Bars3Icon,
  ClipboardDocumentListIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BookOpenIcon,
  UsersIcon,
  FolderIcon,
  ArrowRightOnRectangleIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';
import { logout } from '../../store/slices/authSlice';
import MusicPlayer from '../MusicPlayer';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isAdminOrTeamLeader = user?.role === 'admin' || user?.role === 'team-leader';

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon },
    { name: 'Ideas', href: '/ideas', icon: LightBulbIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Resources', href: '/resources', icon: DocumentChartBarIcon },
    { name: 'Wall of Victory', href: '/wallofvictory', icon: DocumentChartBarIcon },
  ];

  const adminNavigation = [
    { name: 'Manage Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Reports', href: '/admin/reports', icon: DocumentChartBarIcon },
    { name: 'Music Manager', href: '/admin/music', icon: MusicalNoteIcon },
  ];

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

  const renderNavLinks = (items) => (
    <ul role="list" className="-mx-2 space-y-1">
      {items.map((item) => (
        <li key={item.name}>
          <Link
            to={item.href}
            className={`group flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium transition-all duration-200 ${
              item.href === location.pathname
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon
              className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                item.href === location.pathname
                  ? 'text-gray-900'
                  : 'text-gray-400 group-hover:text-gray-900'
              }`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );

  const sidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center justify-center">
        <Link to="/" className="flex items-center">
          <img className="h-10 w-auto" src="/logo.svg" alt="Zemon" />
        </Link>
      </div>

      {/* Updated User Profile */}
      <div className="relative mb-6 mt-2">
        <div className="flex items-center gap-x-4 px-4 py-3 bg-gray-50 rounded-xl">
          <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
            <span className="text-lg font-medium text-gray-900">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-indigo-600 font-medium truncate">
              {formatRole(user?.role)}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            {renderNavLinks(navigation)}
          </li>

          {user?.role === 'admin' && (
            <li>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-2">
                Admin
              </div>
              {renderNavLinks(adminNavigation)}
            </li>
          )}

          <li className="mt-auto">
            <button
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
              className="w-full flex items-center gap-x-3 rounded-lg p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-400" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  {sidebarContent}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200/50 bg-white px-6 pb-4 shadow-sm">
          {sidebarContent}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-72">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex h-16 flex-shrink-0 bg-white shadow-sm lg:hidden">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Add MusicPlayer */}
      <MusicPlayer />
    </div>
  );
} 