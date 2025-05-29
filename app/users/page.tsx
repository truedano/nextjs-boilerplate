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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' }}>
      <div style={{ padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff', width: '80%', maxWidth: '800px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>使用者頁面</h1>
        <p style={{ color: '#555', marginBottom: '30px' }}>歡迎，一般使用者！</p>

        <h2 style={{ marginBottom: '20px', color: '#333' }}>現有活動</h2>
        {loading && <p>載入活動中...</p>}
        {error && <p style={{ color: 'red' }}>載入活動失敗：{error}</p>}
        {!loading && !error && activities.length === 0 && <p>目前沒有可用的活動。</p>}
        {!loading && !error && activities.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {activities.map((activity) => (
              <li key={activity.id} style={{
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '15px',
                marginBottom: '15px',
                textAlign: 'left',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{activity.name}</h3>
                {activity.customFields && Object.keys(activity.customFields).length > 0 && (
                  <div style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    {Object.entries(activity.customFields).map(([key, customField]) => (
                      <div key={key} style={{ margin: '0 0 5px 0', color: '#777', fontSize: '0.9em' }}>
                        <strong>{customField.name}:</strong>
                        {customField.type === 'user_input' ? (
                          <input
                            type="text"
                            placeholder={`請輸入${customField.name}`}
                            style={{
                              marginLeft: '10px',
                              padding: '5px',
                              borderRadius: '3px',
                              border: '1px solid #ccc',
                              width: 'calc(100% - 120px)'
                            }}
                          />
                        ) : (
                          <span> {customField.content}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ margin: '10px 0 0 0', color: '#888', fontSize: '0.9em' }}>報名截止日期: {new Date(activity.registrationEndDate).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={handleLogout}
          style={{
            marginTop: '30px',
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          登出
        </button>
      </div>
    </div>
  );
}