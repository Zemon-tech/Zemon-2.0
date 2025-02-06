import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityLogs } from '../../store/slices/adminSlice';
import { format } from 'date-fns';

export default function RecentActivity() {
  const dispatch = useDispatch();
  const activityLogs = useSelector((state) => state.admin.activityLogs);

  useEffect(() => {
    dispatch(fetchActivityLogs());
  }, [dispatch]);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
        <div className="mt-4 flow-root">
          <ul role="list" className="-mb-8">
            {activityLogs.map((log, idx) => (
              <li key={log._id}>
                <div className="relative pb-8">
                  {idx !== activityLogs.length - 1 && (
                    <span
                      className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      <span className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                        {log.user.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">{log.user.name}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{log.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 