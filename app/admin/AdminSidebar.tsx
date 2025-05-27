'use client';

import React from 'react';

interface AdminSidebarProps {
  onMenuItemClick: (item: 'activity' | 'settings') => void;
  activeItem: 'activity' | 'settings';
}

export default function AdminSidebar({ onMenuItemClick, activeItem }: AdminSidebarProps) {
  return (
    <div style={{ width: '200px', backgroundColor: '#333', padding: '20px', color: '#fff', height: '100vh', position: 'fixed', left: 0, top: 0 }}>
      <h2 style={{ marginBottom: '30px', color: '#fff' }}>管理選單</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '15px' }}>
          <a
            href="#"
            onClick={() => onMenuItemClick('activity')}
            style={{
              color: activeItem === 'activity' ? '#61dafb' : '#fff',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: activeItem === 'activity' ? 'bold' : 'normal',
            }}
          >
            活動管理
          </a>
        </li>
        <li style={{ marginBottom: '15px' }}>
          <a
            href="#"
            onClick={() => onMenuItemClick('settings')}
            style={{
              color: activeItem === 'settings' ? '#61dafb' : '#fff',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: activeItem === 'settings' ? 'bold' : 'normal',
            }}
          >
            設定
          </a>
        </li>
      </ul>
    </div>
  );
}