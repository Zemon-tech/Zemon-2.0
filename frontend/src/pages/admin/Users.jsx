import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/slices/adminSlice';
import UsersList from '../../components/admin/UsersList';

export default function Users() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        await dispatch(fetchUsers()).unwrap();
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    loadUsers();
  }, [dispatch]);

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Team Members</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your team members and their roles
            </p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <UsersList users={users} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
} 