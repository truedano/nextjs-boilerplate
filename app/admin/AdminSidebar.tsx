'use client';

import React from 'react';

import { Dispatch, SetStateAction } from 'react';

interface AdminSidebarProps {
  onMenuItemClick: (item: 'activity' | 'settings') => void;
  activeItem: 'activity' | 'settings';
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export default function AdminSidebar({ onMenuItemClick, activeItem, isSidebarOpen, setIsSidebarOpen }: AdminSidebarProps) {
  return (
    <div
      className={`w-48 bg-gray-800 p-5 text-white h-screen fixed top-0 transition-all duration-300 z-40 ${
        isSidebarOpen ? 'left-0' : '-left-48'
      } md:left-0 md:block`}
    >
      {/* 關閉按鈕 - 只在小螢幕顯示 */}
      <button
        className="md:hidden absolute top-4 right-4 text-white text-xl"
        onClick={() => setIsSidebarOpen(false)}
      >
        &times;
      </button>
      <h2 className="mb-8 text-2xl font-semibold text-white">管理選單</h2>
      <ul className="list-none p-0">
        <li className="mb-4">
          <a
            href="#"
            onClick={() => onMenuItemClick('activity')}
            className={`block text-lg no-underline transition-colors duration-200 ${
              activeItem === 'activity' ? 'text-blue-400 font-bold' : 'text-white hover:text-blue-200'
            }`}
          >
            活動管理
          </a>
        </li>
        <li className="mb-4">
          <a
            href="#"
            onClick={() => onMenuItemClick('settings')}
            className={`block text-lg no-underline transition-colors duration-200 ${
              activeItem === 'settings' ? 'text-blue-400 font-bold' : 'text-white hover:text-blue-200'
            }`}
          >
            設定
          </a>
        </li>
      </ul>
    </div>
  );
}