'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminClientPage() {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/logout', {
      method: 'POST',
    });

    if (res.ok) {
      router.push('/login');
    } else {
      setMessage('登出失敗');
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const res = await fetch('/api/admin/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: newUsername, password: newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(data.message);
    } else {
      setMessage(data.message || '更新失敗');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff', width: '400px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>管理員頁面</h1>
        <p style={{ marginBottom: '30px', color: '#555' }}>歡迎，管理員！您可以在此修改管理員憑證。</p>

        <form onSubmit={handleUpdateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="新使用者名稱"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
            required
          />
          <input
            type="password"
            placeholder="新密碼"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
            required
          />
          <button
            type="submit"
            style={{ padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#28a745', color: '#fff', fontSize: '16px', cursor: 'pointer' }}
          >
            更新管理員憑證
          </button>
        </form>
        {message && <p style={{ marginTop: '15px', color: message.includes('失敗') ? 'red' : 'green' }}>{message}</p>}
        <button
          onClick={handleLogout}
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#dc3545',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px',
            width: '100%'
          }}
        >
          登出
        </button>
      </div>
    </div>
  );
}