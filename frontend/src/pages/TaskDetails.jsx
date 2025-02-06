import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeftIcon, 
  ArrowRightIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowLeftCircleIcon,
  ArrowPathIcon,
  DocumentIcon,
  CheckCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { fetchTaskDetails, updateTaskStage } from '../store/slices/taskSlice';
import axiosInstance from '../utils/axios';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '../styles/quill-custom.css';

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTask, loading, error } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const canUpdateStage = user?.role === 'admin' || user?.role === 'team-leader';
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editorInitialized, setEditorInitialized] = useState(false);
  const [completedViaArrow, setCompletedViaArrow] = useState(new Set());
  const [stageStatuses, setStageStatuses] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    if (taskId) {
      dispatch(fetchTaskDetails(taskId));
      fetchStageStatuses();
    }
  }, [taskId, dispatch]);

  useEffect(() => {
    if (currentTask && !selectedStage) {
      setSelectedStage(currentTask.stage);
    }
  }, [currentTask]);

  useEffect(() => {
    if (currentTask) {
      const width = ((currentTask.stages.indexOf(currentTask.stage) + 1) / currentTask.stages.length) * 100;
      setProgressWidth(width);
    }
  }, [currentTask]);

  useEffect(() => {
    // Cleanup previous Quill instance
    if (quillRef.current) {
      quillRef.current.off('text-change');
      quillRef.current = null;
    }

    if (!editorRef.current) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Write your notes here...',
        modules: {
          toolbar: {
            container: '#toolbar',
            handlers: {
              // Add any custom handlers here if needed
            }
          }
        }
      });

      // Enable editing
      quillRef.current.enable();
      setEditorInitialized(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current = null;
      }
    };
  }, [editorRef.current, taskId]); // Add taskId as dependency

  useEffect(() => {
    if (!editorInitialized || !selectedStage || !quillRef.current) return;

    const fetchStageContent = async () => {
      try {
        const response = await axiosInstance.get(`/tasks/${taskId}/stage-content/${selectedStage}`);
        if (response.data.content) {
          quillRef.current.root.innerHTML = response.data.content;
        } else {
          quillRef.current.root.innerHTML = '';
        }
      } catch (error) {
        console.error('Failed to fetch stage content:', error);
      }
    };

    fetchStageContent();

    return () => {
      if (quillRef.current) {
        const content = quillRef.current.root.innerHTML;
        if (content.trim()) {
          handleSave();
        }
      }
    };
  }, [selectedStage, taskId, editorInitialized]);

  const fetchStageStatuses = async () => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/stages`);
      const statusMap = {};
      response.data.forEach(stage => {
        statusMap[stage.stageName] = stage.is_completed;
      });
      setStageStatuses(statusMap);
    } catch (error) {
      console.error('Failed to fetch stage statuses:', error);
    }
  };

  const handleStageChange = async (direction) => {
    if (!canUpdateStage || !currentTask?.stages || isTransitioning) return;

    const currentIndex = currentTask.stages.indexOf(currentTask.stage);
    const newIndex = direction === 'next' 
      ? Math.min(currentIndex + 1, currentTask.stages.length - 1)
      : Math.max(currentIndex - 1, 0);
    
    if (newIndex !== currentIndex || 
        (direction === 'next' && currentIndex === currentTask.stages.length - 1) ||
        (direction === 'prev' && currentIndex === 0)) {
      try {
        setIsTransitioning(true);
        
        // Pre-calculate the new progress width for smooth animation
        const newWidth = ((newIndex + 1) / currentTask.stages.length) * 100;
        setProgressWidth(newWidth);

        // Save current content before changing stage
        await handleSave();

        // Update local state immediately for smooth UI transition
        if (direction === 'next' && currentIndex === currentTask.stages.length - 1) {
          // Handle last stage completion
          await dispatch(updateTaskStage({
            taskId: currentTask._id,
            stage: currentTask.stage,
            isLastStage: true
          })).unwrap();
        } 
        else if (direction === 'prev' && currentIndex === 0) {
          // Handle first stage uncomplete
          await dispatch(updateTaskStage({
            taskId: currentTask._id,
            stage: currentTask.stage,
            isFirstStage: true
          })).unwrap();
        }
        else {
          const nextStage = currentTask.stages[newIndex];
          setSelectedStage(nextStage);
          
          await dispatch(updateTaskStage({
            taskId: currentTask._id,
            stage: nextStage
          })).unwrap();
        }

        // Update backend state
        await Promise.all([
          dispatch(fetchTaskDetails(taskId)),
          fetchStageStatuses()
        ]);

      } catch (error) {
        console.error('Failed to update stage:', error);
      } finally {
        setIsTransitioning(false);
      }
    }
  };

  const handleSave = async () => {
    if (!quillRef.current || !selectedStage) return;

    setIsSaving(true);
    try {
      const content = quillRef.current.root.innerHTML;
      await axiosInstance.post('/tasks/stage-content', {
        taskId,
        stageName: selectedStage,
        content
      });
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedStage) return;

    setIsRefreshing(true);
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/stage-content/${selectedStage}`);
      if (quillRef.current && response.data.content) {
        quillRef.current.root.innerHTML = response.data.content;
      }
    } catch (error) {
      console.error('Failed to refresh content:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add this new component for the pulsing live indicator
  const LiveIndicator = () => (
    <span className="flex h-3 w-3 ml-2">
      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
    </span>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!currentTask) return null;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="h-full p-4">
        <div className="bg-white shadow-sm rounded-lg flex flex-col h-full">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900 truncate">
                {currentTask.title}
              </h1>
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <ArrowLeftCircleIcon className="h-5 w-5 mr-2" />
                Back to Tasks
              </button>
            </div>
            
            <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                <span>Created: {new Date(currentTask.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>Due: {new Date(currentTask.deadline).toLocaleDateString()}</span>
              </div>
              {currentTask.createdBy && (
                <div className="flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  <span>Created by: {currentTask.createdBy.name}</span>
                </div>
              )}
              {currentTask.teamLeader && (
                <div className="flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  <span>Team Lead: {currentTask.teamLeader.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main content area with flex layout */}
          <div className="flex-1 grid grid-cols-3 divide-x divide-gray-200 min-h-0 overflow-hidden">
            {/* Main Content */}
            <div className="col-span-2 p-6 overflow-y-auto">
              <div className="prose max-w-none mb-6">
                <p className="text-gray-600">
                  {currentTask.description}
                </p>
              </div>

              {/* Stage Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  {canUpdateStage ? (
                    <>
                      <button
                        onClick={() => handleStageChange('prev')}
                        disabled={isTransitioning}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-opacity duration-200 ${
                          isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <ArrowLeftIcon className="h-5 w-5" />
                      </button>
                      
                      <span className={`text-lg font-medium text-gray-900 transition-opacity duration-200 flex items-center ${
                        isTransitioning ? 'opacity-50' : ''
                      }`}>
                        {currentTask.stage}
                        <LiveIndicator />
                      </span>
                      
                      <button
                        onClick={() => handleStageChange('next')}
                        disabled={isTransitioning}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-opacity duration-200 ${
                          isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center">
                      <span className="text-lg font-medium text-gray-900 flex items-center justify-center">
                        {currentTask.stage}
                        <LiveIndicator />
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ 
                        width: `${progressWidth}%`,
                        transition: 'width 0.5s ease-in-out, background-color 0.3s ease'
                      }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        isTransitioning ? 'bg-primary-400' : 'bg-primary-600'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Stage Content Editor */}
              <div className={`mt-8 transition-opacity duration-200 ${
                isTransitioning ? 'opacity-50' : ''
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-500">Stage Content</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing || !editorInitialized}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md border border-gray-300"
                    >
                      <ArrowPathIcon className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !editorInitialized}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                    >
                      <DocumentIcon className="h-4 w-4 mr-1.5" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg">
                  <div id="toolbar" className="border-b border-gray-200">
                    <span className="ql-formats">
                      <button className="ql-bold"></button>
                      <button className="ql-italic"></button>
                      <button className="ql-underline"></button>
                      <button className="ql-strike"></button>
                    </span>
                    <span className="ql-formats">
                      <select className="ql-header">
                        <option value="">Normal</option>
                        <option value="1">Heading 1</option>
                        <option value="2">Heading 2</option>
                        <option value="3">Heading 3</option>
                      </select>
                    </span>
                    <span className="ql-formats">
                      <select className="ql-color"></select>
                      <select className="ql-background"></select>
                      <select className="ql-align"></select>
                    </span>
                    <span className="ql-formats">
                      <button className="ql-list" value="ordered"></button>
                      <button className="ql-list" value="bullet"></button>
                      <button className="ql-indent" value="-1"></button>
                      <button className="ql-indent" value="+1"></button>
                    </span>
                    <span className="ql-formats">
                      <button className="ql-link"></button>
                      <button className="ql-image"></button>
                    </span>
                  </div>
                  <div ref={editorRef} className="h-[400px] overflow-y-auto p-4"></div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="p-6 flex flex-col h-full">
              {/* Stages List */}
              <div className="mb-6 flex flex-col" style={{ height: '280px' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  Stages
                </h3>
                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                  <div className="space-y-2">
                    {currentTask.stages?.map((stage, index) => (
                      <button
                        key={stage}
                        onClick={() => !isTransitioning && setSelectedStage(stage)}
                        className={`w-full px-4 py-2.5 rounded-lg text-sm text-left flex items-center justify-between transition-all duration-200 ${
                          stage === selectedStage
                            ? 'bg-primary-50 text-primary-700 border border-primary-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                        } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center">
                          <span className="font-medium">{stage}</span>
                        </div>
                        {stageStatuses[stage] && (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assignees */}
              <div className="flex flex-col" style={{ height: '280px' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  Assignees
                </h3>
                <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                  <div className="space-y-2">
                    {currentTask.assignees?.map((assignee) => (
                      <div
                        key={assignee._id}
                        className="flex items-center space-x-3 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {assignee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {assignee.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {assignee.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this CSS to your global styles or component
const styles = `
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(203, 213, 225, 1) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(203, 213, 225, 1);
  border-radius: 2px;
}

/* Custom Quill toolbar styles */
#toolbar {
  border-bottom: 1px solid #e5e7eb;
  padding: 8px;
}

#toolbar .ql-formats {
  margin-right: 12px;
}

/* Fix heading selector styling */
#toolbar .ql-header {
  width: 120px;
  margin-right: 8px;
}

/* Style color and alignment pickers */
#toolbar .ql-picker.ql-color,
#toolbar .ql-picker.ql-background,
#toolbar .ql-picker.ql-align {
  width: 40px;
  margin-right: 8px;
}

/* Add icons to color and alignment pickers */
#toolbar .ql-picker.ql-color .ql-picker-label::before {
  content: "Color";
  font-size: 12px;
}

#toolbar .ql-picker.ql-background .ql-picker-label::before {
  content: "BG";
  font-size: 12px;
}

#toolbar .ql-picker.ql-align .ql-picker-label::before {
  content: "Align";
  font-size: 12px;
}

/* Hide default Quill icons for these pickers */
#toolbar .ql-picker.ql-color .ql-picker-label svg,
#toolbar .ql-picker.ql-background .ql-picker-label svg,
#toolbar .ql-picker.ql-align .ql-picker-label svg {
  display: none;
}
`;