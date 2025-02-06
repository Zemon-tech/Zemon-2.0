import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/slices/adminSlice';
import StatsCards from '../../components/admin/StatsCards';
import RecentActivity from '../../components/admin/RecentActivity';
import UsersList from '../../components/admin/UsersList';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <StatsCards />
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <RecentActivity />
            <UsersList users={users} loading={loading} error={error} />
          </div>
        </div>
      </div>
    </div>
  );
} 