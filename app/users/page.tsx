'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Activity {
  id: string;
  name: string;
  description: string;
  customFields: Record<string, { name: string; type: string; content: string }>;
  registrationEndDate: string;
}

export default function UsersPage() {
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        if (!response.ok) {
          throw new Error(`HTTP 錯誤！狀態：${response.status}`);
        }
        const data: Activity[] = await response.json();
        setActivities(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      } else {
        console.error('登出失敗');
      }
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-white p-6 sm:p-8 md:p-10 rounded-lg shadow-md text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">使用者頁面</h1>
        <p className="text-gray-600 mb-6 text-base sm:text-lg">歡迎，一般使用者！</p>

        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">現有活動</h2>
        {loading && <p className="text-gray-700">載入活動中...</p>}
        {error && <p className="text-red-500">載入活動失敗：{error}</p>}
        {!loading && !error && activities.length === 0 && <p className="text-gray-700">目前沒有可用的活動。</p>}
        {!loading && !error && activities.length > 0 && (
          <ul className="list-none p-0">
            {activities.map((activity) => (
              <li key={activity.id} className="border border-gray-300 rounded-md p-4 mb-4 text-left bg-gray-50 shadow-sm">
                <h3 className="text-lg sm:text-xl font-medium mb-2 text-blue-600">{activity.name}</h3>
                {activity.customFields && Object.keys(activity.customFields).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {Object.entries(activity.customFields).map(([key, customField]) => (
                      <div key={key} className="mb-1 text-gray-700 text-sm sm:text-base">
                        <strong>{customField.name}:</strong>
                        {customField.type === 'user_input' ? (
                          <input
                            type="text"
                            placeholder={`請輸入${customField.name}`}
                            className="ml-2 p-1 border border-gray-300 rounded-sm w-full sm:w-auto max-w-xs"
                          />
                        ) : (
                          <span> {customField.content}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-gray-600 text-xs sm:text-sm">報名截止日期: {new Date(activity.registrationEndDate).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 text-base sm:text-lg"
        >
          登出
        </button>
      </div>
    </div>
  );
}