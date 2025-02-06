import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  CheckIcon, 
  XMarkIcon,
  DocumentIcon,
  VideoCameraIcon,
  LinkIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import ResourceCard from '../components/resources/ResourceCard';
import AddResourceModal from '../components/resources/AddResourceModal';
import { fetchResources, selectResources, selectResourcesLoading, selectResourcesError, selectLastFetched } from '../store/slices/resourceSlice';

const Resources = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  
  const resources = useSelector(selectResources);
  const loading = useSelector(selectResourcesLoading);
  const error = useSelector(selectResourcesError);
  const lastFetched = useSelector(selectLastFetched);
  const user = useSelector((state) => state.auth.user);

  const resourceTypes = ['article', 'video', 'tool'];

  const canManageResources = user?.role === 'admin' || user?.role === 'team_leader';

  // Initial fetch on mount and token change
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await dispatch(fetchResources()).unwrap();
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      }
    };

    // Fetch if not fetched in the last 5 minutes
    const shouldFetch = !lastFetched || Date.now() - lastFetched > 5 * 60 * 1000;
    if (shouldFetch) {
      fetchInitialData();
    }
  }, [dispatch, lastFetched]);

  // Fetch when filters change
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        await dispatch(fetchResources({
          type: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined,
          search: searchQuery || undefined,
        })).unwrap();
      } catch (error) {
        console.error('Failed to fetch resources:', error);
        // You might want to show a toast or notification here
      }
    };

    const debounceTimer = setTimeout(fetchFilteredData, 300);
    return () => clearTimeout(debounceTimer);
  }, [dispatch, selectedTypes, searchQuery]);

  // Filter out resources with known problematic IDs
  const problematicIds = ['67923f22fe3faf3d70081aa5'];
  
  const validResources = resources.filter(resource => 
    resource && resource._id && !problematicIds.includes(resource._id)
  );

  const filteredResources = validResources.filter((resource) => {
    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.includes(resource.type);
    
    const matchesSearch =
      searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.keywords && resource.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      ));

    return matchesType && matchesSearch;
  });

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleFormatToggle = (format) => {
    setSelectedFormats(prev =>
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedFormats([]);
    setSearchQuery('');
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingResource(null);
  };

  const stats = [
    { 
      name: 'Total Resources', 
      value: validResources.length || 0,
      icon: Square3Stack3DIcon,
      color: 'text-indigo-600 bg-indigo-100' 
    },
    { 
      name: 'Articles',
      value: validResources.filter(r => r.type === 'article').length || 0,
      icon: DocumentIcon,
      color: 'text-red-600 bg-red-100' 
    },
    { 
      name: 'Videos',
      value: validResources.filter(r => r.type === 'video').length || 0,
      icon: VideoCameraIcon,
      color: 'text-blue-600 bg-blue-100' 
    },
    { 
      name: 'Tools',
      value: validResources.filter(r => r.type === 'tool').length || 0,
      icon: LinkIcon,
      color: 'text-green-600 bg-green-100' 
    }
  ];

  const clearResourcesAndRefetch = async () => {
    // Clear any stored resources
    localStorage.removeItem('resources');
    // Reset the lastFetched timestamp
    localStorage.removeItem('resourcesLastFetched');
    
    try {
      await dispatch(fetchResources()).unwrap();
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  // Add a function to clean up resources
  const cleanupResources = () => {
    // Remove problematic resource from localStorage
    const storedResources = localStorage.getItem('resources');
    if (storedResources) {
      try {
        const parsedResources = JSON.parse(storedResources);
        const cleanedResources = parsedResources.filter(
          resource => !problematicIds.includes(resource._id)
        );
        localStorage.setItem('resources', JSON.stringify(cleanedResources));
      } catch (error) {
        console.error('Error cleaning up localStorage:', error);
      }
    }

    // Clear other related storage
    localStorage.removeItem('resourcesLastFetched');
    
    // Refetch resources
    dispatch(fetchResources());
  };

  // Call cleanup on mount
  useEffect(() => {
    cleanupResources();
  }, []);

  // Add a useEffect to update stats when resources change
  useEffect(() => {
    // The stats will automatically update when validResources changes
    // because they're calculated from validResources in the stats array
  }, [validResources]);

  // Add a debug useEffect to monitor resource counts
  useEffect(() => {
    console.log('Valid Resources:', validResources);
    console.log('Resource Counts:', {
      total: validResources.length,
      articles: validResources.filter(r => r.type === 'article').length,
      videos: validResources.filter(r => r.type === 'video').length,
      tools: validResources.filter(r => r.type === 'tool').length
    });
  }, [validResources]);

  // Update the categories array to match our resource types
  const categories = resourceTypes;

  // Update the formats array to remove it since we're using types
  // Remove the formats-related code or update it to match our needs
  const formats = []; // Empty array since we're not using formats anymore

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Learning Resources</h1>
              <p className="mt-1 text-sm text-gray-500">
                Access and share educational materials with your team
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={cleanupResources}
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200"
              >
                Refresh Resources
              </button>
              {canManageResources && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Resource
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border-gray-300 pl-10 pr-4 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Type Filters */}
            <div className="flex gap-2 flex-wrap">
              {resourceTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeToggle(type)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${
                      selectedTypes.includes(type)
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {selectedTypes.includes(type) && (
                    <XMarkIcon className="ml-1.5 h-4 w-4" onClick={(e) => {
                      e.stopPropagation();
                      handleTypeToggle(type);
                    }} />
                  )}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {(selectedTypes.length > 0 || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resources Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              Error loading resources: {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
              {filteredResources.length > 0 ? (
                filteredResources.map((resource) => (
                  <div key={resource._id} className="min-w-0 w-full">
                    <ResourceCard 
                      resource={resource} 
                      onEdit={handleEdit}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                  <div className="rounded-full bg-gray-100 p-3 mb-4">
                    <MagnifyingGlassIcon className="h-6 w-6" />
                  </div>
                  <p className="text-lg font-medium">No resources found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editResource={editingResource}
      />
    </div>
  );
};

export default Resources;