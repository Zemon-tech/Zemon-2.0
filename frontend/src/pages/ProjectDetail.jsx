import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import TimelineEntryForm from '../components/projects/TimelineEntryForm';
import * as projectService from '../services/projectService';
import { toast } from 'react-toastify';

export default function ProjectDetail() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const { projectId } = useParams();
  const user = useSelector((state) => state.auth.user);
  const isAdminOrTeamLeader = user?.role === 'admin' || user?.role === 'team-leader';

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProject(projectId);
      setProject(data);
    } catch (error) {
      toast.error('Failed to fetch project details');
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (entryData) => {
    try {
      const updatedProject = await projectService.addTimelineEntry(projectId, entryData);
      setProject(updatedProject);
      setShowEntryForm(false);
      toast.success('Timeline entry added successfully');
    } catch (error) {
      toast.error('Failed to add timeline entry');
      console.error('Error adding timeline entry:', error);
    }
  };

  const handleEditEntry = async (entryData) => {
    try {
      const updatedProject = await projectService.updateTimelineEntry(
        projectId,
        entryData._id,
        entryData
      );
      setProject(updatedProject);
      setEditingEntry(null);
      toast.success('Timeline entry updated successfully');
    } catch (error) {
      toast.error('Failed to update timeline entry');
      console.error('Error updating timeline entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this timeline entry?')) {
      try {
        const updatedProject = await projectService.deleteTimelineEntry(projectId, entryId);
        setProject(updatedProject);
        toast.success('Timeline entry deleted successfully');
      } catch (error) {
        toast.error('Failed to delete timeline entry');
        console.error('Error deleting timeline entry:', error);
      }
    }
  };

  const BackButton = () => (
    <Link
      to="/wallofvictory"
      className="absolute top-8 right-8 z-10 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/20 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
    >
      Back to Projects
      <ArrowLeftIcon className="h-5 w-5 rotate-180" />
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <BackButton />
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Project not found</h2>
        <p className="text-gray-500">The project you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BackButton />

      {/* Project Header */}
      <div className="relative h-64 md:h-96 bg-gray-900">
        <img
          src={project.image_url}
          alt={project.title}
          className="w-full h-full object-cover opacity-50"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
            e.target.classList.add('opacity-30');
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
            {project.title}
          </h1>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Project Timeline
            </h2>
            {isAdminOrTeamLeader && (
              <button
                onClick={() => setShowEntryForm(true)}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <PlusIcon className="h-5 w-5" />
                Add Timeline Entry
              </button>
            )}
          </div>

          {project.timeline_entries && project.timeline_entries.length > 0 ? (
            <div className="relative">
              {/* Timeline central line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full hidden md:block"></div>
              
              {/* Mobile timeline line */}
              <div className="absolute left-8 h-full w-1 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full md:hidden"></div>

              {/* Timeline entries */}
              <div className="space-y-12">
                {project.timeline_entries.map((entry, index) => (
                  <div 
                    key={index} 
                    className={`relative flex ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col md:gap-8 group`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 z-10"></div>

                    {/* Content card */}
                    <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                      <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        {/* Date badge */}
                        <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold mb-4">
                          {entry.date}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {entry.title}
                        </h3>
                        
                        <p className="text-gray-600 leading-relaxed">
                          {entry.description}
                        </p>

                        {/* Admin/Team Leader Controls */}
                        {isAdminOrTeamLeader && (
                          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => setEditingEntry(entry)}
                              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry._id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white/50 rounded-xl backdrop-blur-sm">
              <div className="max-w-md mx-auto">
                <p className="text-gray-500 text-lg">
                  {isAdminOrTeamLeader 
                    ? "Start documenting your project's journey by adding your first timeline entry."
                    : "No timeline entries have been added to this project yet."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Entry Form Modal */}
      {(showEntryForm || editingEntry) && (
        <TimelineEntryForm
          entry={editingEntry}
          onSubmit={editingEntry ? handleEditEntry : handleCreateEntry}
          onClose={() => {
            setShowEntryForm(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
} 