import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ProjectForm from '../components/projects/ProjectForm';
import * as projectService from '../services/projectService';
import { toast } from 'react-toastify';

export default function WallOfVictory() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAdminOrTeamLeader = user?.role === 'admin' || user?.role === 'team-leader';

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const fetchedProjects = await projectService.getAllProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectClick = (projectId, e) => {
    // Prevent navigation when clicking edit or delete buttons
    if (e?.target?.closest('button')) return;
    navigate(`/wallofvictory/${projectId}`);
  };

  const handleCreateProject = async (projectData) => {
    try {
      if (!isAdminOrTeamLeader) {
        toast.error('You must be an admin or team leader to create projects');
        return;
      }

      if (!user?.id) {
        toast.error('User information is missing');
        return;
      }

      // Validate URL format
      if (!isValidUrl(projectData.image_url)) {
        toast.error('Please enter a valid image URL');
        return;
      }

      // Create new project with empty timeline_entries and user reference
      const newProjectData = {
        title: projectData.title.trim(),
        image_url: projectData.image_url.trim(),
        timeline_entries: [],
        user: user.id
      };

      console.log('Sending project data:', newProjectData);

      const newProject = await projectService.createProject(newProjectData);
      setProjects(prevProjects => [newProject, ...prevProjects]); // Add new project to the beginning of the list
      setShowProjectForm(false);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Project creation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      console.error('Error details:', error.response?.data);
      toast.error(errorMessage);
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      // Update project basic info
      const updatedProject = await projectService.updateProject(projectData._id, {
        title: projectData.title,
        image_url: projectData.image_url
      });
      
      setProjects(projects.map(project =>
        project._id === updatedProject._id ? updatedProject : project
      ));
      setEditingProject(null);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(projects.filter(project => project._id !== projectId));
        toast.success('Project deleted successfully');
      } catch (error) {
        toast.error('Failed to delete project');
        console.error('Error deleting project:', error);
      }
    }
  };

  // Helper function to validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Banner Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="absolute inset-0">
          {/* Fireworks */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="firework"></div>
            <div className="firework"></div>
            <div className="firework"></div>
          </div>

          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full animate-pulse">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-400 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
          </div>
          
          {/* Decorative lines */}
          <div className="absolute inset-0 opacity-30">
            <div className="h-full w-full bg-[radial-gradient(circle_500px_at_50%_200px,#3B82F6,transparent)]"></div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6 tracking-tight drop-shadow-[0_0_25px_rgba(59,130,246,0.3)] [text-shadow:_2px_2px_15px_rgb(59_130_246_/_30%)]">
            WALL OF VICTORY
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Celebrating our team's remarkable achievements and milestones. Each victory here represents 
            our dedication, innovation, and relentless pursuit of excellence.
          </p>
        </div>
      </div>

      {/* Title and Add Project Button Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center">
        {isAdminOrTeamLeader && (
          <button
            onClick={() => setShowProjectForm(true)}
            className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Add Project
          </button>
        )}
      </div>

      {/* Projects Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">
              {isAdminOrTeamLeader 
                ? "No projects found. Add your first project to get started!"
                : "No projects have been added yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={(e) => handleProjectClick(project._id, e)}
                className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                      e.target.classList.add('opacity-50');
                    }}
                  />
                  {isAdminOrTeamLeader && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                        }}
                        className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project._id);
                        }}
                        className="p-2 text-white bg-red-600 rounded-full hover:bg-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      {(showProjectForm || editingProject) && (
        <ProjectForm
          project={editingProject}
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
} 