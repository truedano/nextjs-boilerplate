'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface ActivityField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'datetime_range' | 'user_input';
  content: string;
}

interface Activity {
  id: string;
  name: string;
  registrationEndDate: string; // 新增活動報名截止日
  customFields: ActivityField[];
}

export default function ActivityManagementPage() {
  const [newActivityFields, setNewActivityFields] = useState<ActivityField[]>([]);
  const [newActivityName, setNewActivityName] = useState<string>(''); // 新增活動名稱狀態
  const [newActivityRegistrationEndDate, setNewActivityRegistrationEndDate] = useState<string>(''); // 新增活動報名截止日狀態
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingActivityFields, setEditingActivityFields] = useState<ActivityField[]>([]);
  const [editingActivityName, setEditingActivityName] = useState<string>(''); // 編輯活動名稱狀態
  const [editingActivityRegistrationEndDate, setEditingActivityRegistrationEndDate] = useState<string>(''); // 編輯活動報名截止日狀態

  const addNewField = () => {
    setNewActivityFields([
      ...newActivityFields,
      {
        id: `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}-${uuidv4()}`,
        name: '',
        type: 'string',
        content: '',
      },
    ]);
  };

  const updateNewField = (id: string, key: keyof ActivityField, value: string) => {
    setNewActivityFields(
      newActivityFields.map((field) => (field.id === id ? { ...field, [key]: value } : field))
    );
  };

  const removeNewField = (id: string) => {
    setNewActivityFields(newActivityFields.filter((field) => field.id !== id));
  };

  const moveNewField = (fromIndex: number, toIndex: number) => {
    const updatedFields = [...newActivityFields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    setNewActivityFields(updatedFields);
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/admin/update', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setActivities(data || []); // 後端直接返回活動陣列
    } catch (err) {
      console.error('獲取活動資料時發生錯誤:', err);
      setError('無法載入活動資料。');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setEditingActivityName(activity.name); // 設定編輯活動名稱
    setEditingActivityRegistrationEndDate(formatDateTimeLocal(new Date(activity.registrationEndDate))); // 設定編輯活動報名截止日
    setEditingActivityFields([...activity.customFields]);
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setEditingActivityName('');
    setEditingActivityRegistrationEndDate('');
    setEditingActivityFields([]);
  };

  const updateEditingField = (id: string, key: keyof ActivityField, value: string) => {
    setEditingActivityFields(
      editingActivityFields.map((field) => (field.id === id ? { ...field, [key]: value } : field))
    );
  };

  const removeEditingField = (id: string) => {
    setEditingActivityFields(editingActivityFields.filter((field) => field.id !== id));
  };

  const moveEditingField = (fromIndex: number, toIndex: number) => {
    const updatedFields = [...editingActivityFields];
    const [movedField] = updatedFields.splice(fromIndex, 1);
    updatedFields.splice(toIndex, 0, movedField);
    setEditingActivityFields(updatedFields);
  };

  const addEditingField = () => {
    setEditingActivityFields([
      ...editingActivityFields,
      {
        id: `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}-${uuidv4()}`,
        name: '',
        type: 'string',
        content: '',
      },
    ]);
  };

  const handleCreateActivity = async () => {
    try {
      const response = await fetch('/api/admin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createActivity',
          activityId: uuidv4(), // 為新活動生成一個唯一的 ID
          name: newActivityName, // 新增活動名稱
          registrationEndDate: newActivityRegistrationEndDate, // 新增活動報名截止日
          customFields: newActivityFields,
        }),
      });

      if (response.ok) {
        alert('新活動已成功創建！');
        setNewActivityName(''); // 清空活動名稱
        setNewActivityRegistrationEndDate(''); // 清空活動報名截止日
        setNewActivityFields([]); // 清空欄位以便新增
        fetchActivities(); // 重新載入活動列表
      } else {
        const errorData = await response.json();
        alert(`創建失敗: ${errorData.message || response.statusText}`);
        console.error('創建失敗:', errorData);
      }
    } catch (error) {
      console.error('創建新活動時發生錯誤:', error);
      alert('創建新活動時發生錯誤。');
    }
  };

  const handleUpdateActivity = async (activityId: string) => {
    try {
      const response = await fetch('/api/admin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateExistingActivity',
          activityId: activityId,
          name: editingActivityName, // 更新活動名稱
          registrationEndDate: editingActivityRegistrationEndDate, // 更新活動報名截止日
          customFields: editingActivityFields,
        }),
      });

      if (response.ok) {
        alert('活動已成功更新！');
        setEditingActivity(null);
        setEditingActivityFields([]);
        fetchActivities(); // 重新載入活動列表
      } else {
        const errorData = await response.json();
        alert(`更新失敗: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('更新活動時發生錯誤:', error);
      alert('更新活動時發生錯誤。');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('確定要刪除此活動嗎？')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteActivity',
          activityId: activityId, // 將屬性名稱改為 activityId
        }),
      });

      if (response.ok) {
        alert('活動已成功刪除！');
        fetchActivities(); // 重新載入活動列表
      } else {
        const errorData = await response.json();
        alert(`刪除失敗: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('刪除活動時發生錯誤:', error);
      alert('刪除活動時發生錯誤。');
    }
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">活動管理頁面</h1>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">新增活動</h2>
      <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <div className="mb-4">
          <label htmlFor="new-activity-name" className="block text-sm font-medium text-gray-700 mb-1">
            活動名稱:
          </label>
          <input
            type="text"
            id="new-activity-name"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="輸入活動名稱"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="new-activity-registration-end-date" className="block text-sm font-medium text-gray-700 mb-1">
            報名截止日:
          </label>
          <input
            type="datetime-local"
            id="new-activity-registration-end-date"
            value={newActivityRegistrationEndDate}
            onChange={(e) => setNewActivityRegistrationEndDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={addNewField}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          新增欄位
        </button>
      </div>

      <div className="space-y-6">
        {newActivityFields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border border-gray-200 rounded-md bg-gray-50 relative"
          >
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={() => moveNewField(index, index - 1)}
                disabled={index === 0}
                className="p-1 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50"
                title="上移"
              >
                ⬆️
              </button>
              <button
                onClick={() => moveNewField(index, index + 1)}
                disabled={index === newActivityFields.length - 1}
                className="p-1 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50"
                title="下移"
              >
                ⬇️
              </button>
              <button
                onClick={() => removeNewField(field.id)}
                className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                title="移除"
              >
                ❌
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div>
                <label htmlFor={`new-name-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  欄位名稱:
                </label>
                <input
                  type="text"
                  id={`new-name-${field.id}`}
                  value={field.name}
                  onChange={(e) => updateNewField(field.id, 'name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入欄位名稱"
                />
              </div>

              <div>
                <label htmlFor={`new-type-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  欄位類型:
                </label>
                <select
                  id={`new-type-${field.id}`}
                  value={field.type}
                  onChange={(e) =>
                    updateNewField(field.id, 'type', e.target.value as ActivityField['type'])
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="string">字串</option>
                  <option value="number">數字</option>
                  <option value="datetime_range">日期時間區間</option>
                  <option value="user_input">使用者輸入</option>
                </select>
              </div>

              <div>
                <label htmlFor={`new-content-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  欄位內容:
                </label>
                <input
                  type={field.type === 'datetime_range' ? 'datetime-local' : 'text'}
                  id={`new-content-${field.id}`}
                  value={field.content}
                  onChange={(e) => updateNewField(field.id, 'content', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    field.type === 'datetime_range'
                      ? '選擇日期時間'
                      : '輸入欄位內容'
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {(newActivityName || newActivityFields.length > 0) && (
        <button
          onClick={handleCreateActivity}
          className="mt-8 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 w-full"
        >
          創建新活動
        </button>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4">現有活動列表</h2>
      {loading && <p className="text-gray-600">載入中...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && activities.length === 0 && (
        <p className="text-gray-600">目前沒有活動。</p>
      )}
      {!loading && !error && activities.length > 0 && (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">活動名稱: {activity.name}</h3>
                  <p className="text-gray-600">報名截止日: {new Date(activity.registrationEndDate).toLocaleString()}</p>
                  {activity.customFields && activity.customFields.length > 0 && (
                    <div className="mt-2 text-gray-600">
                      <ul className="list-disc list-inside ml-4">
                        {activity.customFields.map((field, idx) => (
                          <li key={idx}>
                            {field.name}: {field.content}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditActivity(activity)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                  >
                    刪除
                  </button>
                </div>
              </div>

              {editingActivity?.id === activity.id && (
                <div className="mt-6 p-4 border border-blue-300 rounded-md bg-blue-50">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4">編輯活動: {activity.name}</h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor={`edit-activity-name-${activity.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        活動名稱:
                      </label>
                      <input
                        type="text"
                        id={`edit-activity-name-${activity.id}`}
                        value={editingActivityName}
                        onChange={(e) => setEditingActivityName(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-activity-registration-end-date-${activity.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                        報名截止日:
                      </label>
                      <input
                        type="datetime-local"
                        id={`edit-activity-registration-end-date-${activity.id}`}
                        value={editingActivityRegistrationEndDate}
                        onChange={(e) => setEditingActivityRegistrationEndDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {editingActivityFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 relative p-4 border border-gray-200 rounded-md bg-gray-50">
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => moveEditingField(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50"
                            title="上移"
                          >
                            ⬆️
                          </button>
                          <button
                            onClick={() => moveEditingField(index, index + 1)}
                            disabled={index === editingActivityFields.length - 1}
                            className="p-1 bg-gray-300 rounded-full hover:bg-gray-400 disabled:opacity-50"
                            title="下移"
                          >
                            ⬇️
                          </button>
                          <button
                            onClick={() => removeEditingField(field.id)}
                            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            title="移除"
                          >
                            ❌
                          </button>
                        </div>
                        <div>
                          <label htmlFor={`edit-field-name-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            欄位名稱:
                          </label>
                          <input
                            type="text"
                            id={`edit-field-name-${field.id}`}
                            value={field.name}
                            onChange={(e) => updateEditingField(field.id, 'name', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor={`edit-field-type-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            欄位類型:
                          </label>
                          <select
                            id={`edit-field-type-${field.id}`}
                            value={field.type}
                            onChange={(e) => updateEditingField(field.id, 'type', e.target.value as ActivityField['type'])}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="string">字串</option>
                            <option value="number">數字</option>
                            <option value="datetime_range">日期時間區間</option>
                            <option value="user_input">使用者輸入</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`edit-field-content-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                            欄位內容:
                          </label>
                          <input
                            type={field.type === 'datetime_range' ? 'datetime-local' : 'text'}
                            id={`edit-field-content-${field.id}`}
                            value={field.content}
                            onChange={(e) => updateEditingField(field.id, 'content', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addEditingField}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    新增欄位
                  </button>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => handleUpdateActivity(activity.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                    >
                      保存
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition duration-200"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}