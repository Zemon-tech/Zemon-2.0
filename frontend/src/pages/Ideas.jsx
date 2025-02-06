import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PlusIcon, 
  LightBulbIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  HandThumbUpIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { fetchIdeas } from '../store/slices/ideaSlice';
import IdeaModal from '../components/ideas/IdeaModal';
import IdeaList from '../components/ideas/IdeaList';

export default function Ideas() {
  const dispatch = useDispatch();
  const { ideas, loading, error } = useSelector((state) => state.ideas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchIdeas());
  }, [dispatch]);

  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const ideaStats = {
    total: ideas.length,
    totalVotes: ideas.reduce((acc, idea) => acc + idea.votes.length, 0),
    totalComments: ideas.reduce((acc, idea) => acc + idea.comments.length, 0),
    mostVoted: ideas.reduce((max, idea) => idea.votes.length > (max?.votes?.length || 0) ? idea : max, null)
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Ideas</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Share Idea
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <LightBulbIcon className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Ideas</p>
                  <p className="text-2xl font-semibold text-gray-900">{ideaStats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <HandThumbUpIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Votes</p>
                  <p className="text-2xl font-semibold text-gray-900">{ideaStats.totalVotes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <ChatBubbleLeftIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Comments</p>
                  <p className="text-2xl font-semibold text-gray-900">{ideaStats.totalComments}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Most Voted</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {ideaStats.mostVoted?.votes?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ideas..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Ideas List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <ArrowPathIcon className="h-8 w-8 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12 text-red-500">
            <ExclamationCircleIcon className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        ) : (
          <IdeaList ideas={filteredIdeas} />
        )}

        {/* New Idea Modal */}
        <IdeaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
} 