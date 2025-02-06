import { format } from 'date-fns';
import { HandThumbUpIcon, ChatBubbleLeftIcon, LinkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { voteIdea, addComment, deleteIdea } from '../../store/slices/ideaSlice';

export default function IdeaList({ ideas }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);

  const handleVote = (ideaId) => {
    dispatch(voteIdea(ideaId));
  };

  const handleDelete = async (ideaId) => {
    if (window.confirm('Are you sure you want to delete this idea?')) {
      try {
        await dispatch(deleteIdea(ideaId)).unwrap();
      } catch (error) {
        console.error('Failed to delete idea:', error);
      }
    }
  };

  const handleComment = (ideaId) => {
    if (commentText.trim()) {
      dispatch(addComment({ id: ideaId, comment: commentText.trim() }));
      setCommentText('');
      setActiveCommentId(null);
    }
  };

  const getUserInitial = (user) => {
    return user?.name ? user.name.charAt(0) : '?';
  };

  const getUserName = (user) => {
    return user?.name || 'Unknown User';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {ideas.map((idea) => (
        <div key={idea._id} className="bg-white shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {idea.title}
              </h3>
              <div className="flex items-center space-x-4 ml-4">
                <button
                  onClick={() => handleVote(idea._id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {idea.votes?.includes(currentUser?._id) ? (
                    <HandThumbUpSolidIcon className="h-5 w-5 text-primary-600" />
                  ) : (
                    <HandThumbUpIcon className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{idea.votes?.length || 0}</span>
                </button>
                <button
                  onClick={() => setActiveCommentId(activeCommentId === idea._id ? null : idea._id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">{idea.comments?.length || 0}</span>
                </button>
              </div>
            </div>

            <div className="text-gray-600 text-sm mb-4 line-clamp-3">
              {idea.description}
            </div>

            {idea.resourceLink && (
              <a
                href={idea.resourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 mb-4"
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                Resource Link
              </a>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {getUserInitial(idea.createdBy)}
                  </span>
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {getUserName(idea.createdBy)}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {format(new Date(idea.createdAt), 'MMM d, yyyy')}
                </span>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(idea._id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Delete idea"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {activeCommentId === idea._id && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {idea.comments.map((comment) => (
                    <div key={comment._id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {comment.userId.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {comment.userId.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex space-x-3">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Add a comment..."
                  />
                  <button
                    onClick={() => handleComment(idea._id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 