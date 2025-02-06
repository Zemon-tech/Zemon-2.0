import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import TaskTimeline from '../../components/ui/TaskTimeline';
import axios from 'axios';

// Create axios instance with base URL from environment variable
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  timeout: 5000, // 5 seconds timeout
});

export default function Reports() {
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatusHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await api.get('/tasks/status-history', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        console.log('Status history response:', response.data);
        setStatusHistory(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching status history:', error);
        let errorMessage = 'Failed to load status history. ';
        
        if (error.code === 'ERR_NETWORK') {
          errorMessage += 'Please check if the backend server is running on port 5002.';
        } else if (error.response) {
          errorMessage += error.response.data.error || error.response.data.message || error.message;
        } else {
          errorMessage += error.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStatusHistory();
  }, []);

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <p className="mt-2 text-sm text-gray-700">
              View task history, resources, and achievements
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <Tabs variant="line" colorScheme="blue">
                <TabList>
                  <Tab>Tasks</Tab>
                  <Tab>Resources</Tab>
                  <Tab>Wall of Victory</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    {loading ? (
                      <p>Loading...</p>
                    ) : error ? (
                      <Alert status="error" mt={4}>
                        <AlertIcon />
                        {error}
                      </Alert>
                    ) : (
                      <TaskTimeline 
                        events={statusHistory} 
                        onError={(err) => {
                          console.error('TaskTimeline error:', err);
                          setError('Error displaying timeline: ' + err.message);
                        }}
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    <div className="bg-white">
                      <div className="mx-auto max-w-7xl">
                        <div className="px-4 py-6 sm:px-6 lg:px-8">
                          <h2 className="text-xl font-semibold text-gray-900">Resources</h2>
                          <p className="mt-1 text-sm text-gray-500">
                            Track and manage team resources
                          </p>
                          {/* Resources content will go here */}
                          <div className="mt-6">
                            <p>Resources report content</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel>
                    <div className="bg-white">
                      <div className="mx-auto max-w-7xl">
                        <div className="px-4 py-6 sm:px-6 lg:px-8">
                          <h2 className="text-xl font-semibold text-gray-900">Wall of Victory</h2>
                          <p className="mt-1 text-sm text-gray-500">
                            Celebrate team achievements and milestones
                          </p>
                          {/* Wall of Victory content will go here */}
                          <div className="mt-6">
                            <p>Wall of Victory content</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 