import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Ideas from './pages/Ideas';
import Chat from './pages/Chat';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';
import Resources from './pages/Resources';
import WallOfVictory from './pages/WallOfVictory';
import ProjectDetail from './pages/ProjectDetail';
import Favicon from './components/common/Favicon';
import { initializeAuth } from './store/slices/authSlice';
import TaskDetails from './pages/TaskDetails';

function PrivateRoute({ children, requireAdmin, requireTeamLeader }) {
  const { token, user } = useSelector((state) => state.auth);
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  if (requireTeamLeader && user?.role !== 'team-leader' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (

    
    <Router>
      <Favicon />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requireAdmin>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute requireAdmin>
              <MainLayout>
                <AdminUsers />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute requireAdmin>
              <MainLayout>
                <AdminReports />
              </MainLayout>
            </PrivateRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <MainLayout>
                <Tasks />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/ideas"
          element={
            <PrivateRoute>
              <MainLayout>
                <Ideas />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <MainLayout>
                <Chat />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <PrivateRoute>
              <MainLayout>
                <Resources />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/wallofvictory"
          element={
            <PrivateRoute>
              <MainLayout>
                <WallOfVictory />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/wallofvictory/:projectId"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProjectDetail />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/:taskId"
          element={
            <PrivateRoute>
              <MainLayout>
                <TaskDetails />
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 