'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import ActivityManagementPage from './ActivityManagementPage';
import { FaBars } from 'react-icons/fa'; // 引入漢堡菜單圖標

export default function AdminClientPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [activeContent, setActiveContent] = useState<'activity' | 'settings'>('settings'); // 預設顯示設定頁面
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 控制側邊欄顯示/隱藏
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

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('所有密碼欄位都必須填寫');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('新密碼與確認密碼不一致');
      return;
    }

    const res = await fetch('/api/admin/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage(data.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage(data.message || '更新失敗');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 漢堡菜單按鈕 - 只在小螢幕顯示 */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <FaBars />
      </button>

      <AdminSidebar
        onMenuItemClick={setActiveContent}
        activeItem={activeContent}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className={`flex-1 p-5 transition-all duration-300 ${isSidebarOpen ? 'md:ml-48 ml-48' : 'md:ml-48 ml-0'}`}>
        {activeContent === 'activity' && <ActivityManagementPage />}
        {activeContent === 'settings' && (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-40px)] bg-gray-100">
            <div className="p-10 rounded-lg shadow-md bg-white w-full max-w-md text-center">
              <h1 className="mb-5 text-3xl font-bold text-gray-800">管理員頁面</h1>
              <p className="mb-8 text-gray-600">歡迎，管理員！您可以在此修改管理員憑證。</p>

              <form onSubmit={handleUpdateAdmin} className="flex flex-col gap-4">
                <label htmlFor="oldPassword" className="sr-only">舊密碼:</label>
                <input
                  type="password"
                  id="oldPassword"
                  placeholder="舊密碼"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="p-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <label htmlFor="newPassword" className="sr-only">新密碼:</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="新密碼"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="p-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <label htmlFor="confirmNewPassword" className="sr-only">確認新密碼:</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  placeholder="確認新密碼"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="p-3 rounded-md border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="p-3 rounded-md border-none bg-green-600 text-white text-base cursor-pointer hover:bg-green-700 transition duration-200"
                >
                  更新管理員憑證
                </button>
              </form>
              {message && <p className={`mt-4 ${message.includes('失敗') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>}
              <button
                onClick={handleLogout}
                className="p-3 rounded-md border-none bg-red-600 text-white text-base cursor-pointer hover:bg-red-700 transition duration-200 mt-5 w-full"
              >
                登出
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}