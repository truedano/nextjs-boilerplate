'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();

  useEffect(() => {
    // 這裡可以實作檢查使用者是否為一般使用者的邏輯
    // 如果不是，則導向登入頁面
    // 為了簡化，目前假設已通過 API 路由驗證
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ padding: '40px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff', width: '300px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>使用者頁面</h1>
        <p style={{ color: '#555' }}>歡迎，一般使用者！</p>
      </div>
    </div>
  );
}