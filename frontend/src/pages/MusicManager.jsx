import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axios';
import MainLayout from '../components/layout/MainLayout';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MusicalNoteIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function MusicManager() {
  const [music, setMusic] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMusic, setEditingMusic] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    embedCode: ''
  });

  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      const response = await axiosInstance.get('/music');
      setMusic(response.data);
    } catch (error) {
      toast.error('Failed to fetch music');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMusic) {
        await axiosInstance.put(`/music/${editingMusic._id}`, formData);
        toast.success('Music updated successfully');
      } else {
        await axiosInstance.post('/music', formData);
        toast.success('Music added successfully');
      }
      setShowAddModal(false);
      setEditingMusic(null);
      setFormData({ title: '', embedCode: '' });
      fetchMusic();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this music?')) {
      try {
        await axiosInstance.delete(`/music/${id}`);
        toast.success('Music deleted successfully');
        fetchMusic();
      } catch (error) {
        toast.error('Failed to delete music');
      }
    }
  };

  if (user?.role !== 'admin') {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">Access denied. Admin only area.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MusicalNoteIcon className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Music Manager</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Music
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Manage your SoundCloud music collection. Add, edit, or remove tracks.
          </p>
        </div>

        {/* Music Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {music.map((item) => (
            <div 
              key={item._id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100"
            >
              <div className="p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3 overflow-hidden">
                    <p className="text-sm text-gray-600 truncate">
                      Embed code: {item.embedCode.substring(0, 50)}...
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Added by: {item.addedBy?.name || 'Admin'}
                  </p>
                </div>
                <div className="flex justify-end items-center space-x-3 pt-3 border-t">
                  <button
                    onClick={() => {
                      setEditingMusic(item);
                      setFormData({
                        title: item.title,
                        embedCode: item.embedCode
                      });
                      setShowAddModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md m-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingMusic ? 'Edit Music' : 'Add Music'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMusic(null);
                    setFormData({ title: '', embedCode: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SoundCloud Embed Code
                  </label>
                  <textarea
                    value={formData.embedCode}
                    onChange={(e) => setFormData({ ...formData, embedCode: e.target.value })}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    rows="4"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Paste the iframe code from SoundCloud's embed option
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMusic(null);
                      setFormData({ title: '', embedCode: '' });
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    {editingMusic ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 