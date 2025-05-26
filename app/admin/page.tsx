'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminClientPage from './AdminClientPage';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // 這裡可以實作檢查使用者是否為管理員的邏輯
    // 如果不是，則導向登入頁面
    // 為了簡化，目前假設已通過 API 路由驗證
  }, []);

  return <AdminClientPage />;
}