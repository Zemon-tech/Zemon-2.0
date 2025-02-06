import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  DocumentArrowDownIcon, 
  ArrowTopRightOnSquareIcon, 
  PlayCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { deleteResourceAsync } from '../../store/slices/resourceSlice';
import axiosInstance from '../../utils/axios';

const ResourceCard = ({ resource, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { _id, title, description, type, url, tags } = resource;

  const canManageResource = user?.role === 'admin' || user?.role === 'team-leader';

  const handleDelete = async () => {
    if (!_id) {
      console.error('Resource ID is missing');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await dispatch(deleteResourceAsync(_id)).unwrap();
        console.log(`Resource ${_id} deleted successfully`);
      } catch (error) {
        console.error('Failed to delete resource:', error);
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to delete resource. Please try again.';
        alert(errorMessage);
      }
    }
  };

  const handleView = async () => {
    try {
      // Increment view count
      await axiosInstance.post(`/resources/${_id}/view`);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  const renderThumbnail = () => {
    const thumbnailClasses = "mb-4 aspect-video rounded-lg overflow-hidden flex items-center justify-center";
    
    switch (type) {
      case 'video':
        return (
          <div className={`${thumbnailClasses} bg-blue-50`}>
            <PlayCircleIcon className="h-12 w-12 text-blue-600" />
          </div>
        );
      case 'article':
        return (
          <div className={`${thumbnailClasses} bg-green-50`}>
            <DocumentTextIcon className="h-12 w-12 text-green-600" />
          </div>
        );
      case 'tool':
        return (
          <div className={`${thumbnailClasses} bg-purple-50`}>
            <WrenchScrewdriverIcon className="h-12 w-12 text-purple-600" />
          </div>
        );
      default:
        return null;
    }
  };

  const renderFormatIcon = () => {
    switch (type) {
      case 'video':
        return <PlayCircleIcon className="h-6 w-6 text-blue-500" />;
      case 'article':
        return <DocumentTextIcon className="h-6 w-6 text-green-500" />;
      case 'tool':
        return <WrenchScrewdriverIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <ArrowTopRightOnSquareIcon className="h-6 w-6 text-green-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full w-full overflow-hidden">
      <div className="p-4 flex-1 w-full min-w-0">
        {renderThumbnail()}

        <div className="flex items-start justify-between min-w-0">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{title}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {type}
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {renderFormatIcon()}
          </div>
        </div>

        {description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        )}

        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 w-full bg-white">
        <div className="flex flex-col gap-2 w-full">
          <a
            onClick={handleView}
            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
          >
            {type === 'video' ? 'Watch Video' : type === 'article' ? 'Read Article' : type === 'tool' ? 'Use Tool' : 'Visit Link'}
          </a>

          {canManageResource && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => onEdit(resource)}
                className="text-blue-600 hover:text-blue-700"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onDelete(resource._id)}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ResourceCard); 