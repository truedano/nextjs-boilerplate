import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const adminPath = path.join(process.cwd(), 'data', 'admin.json');

  try {
    // 這裡可以實作身份驗證，確保只有已登入的管理員才能更新
    // 為了簡化，目前假設請求來自已驗證的管理員頁面

    const newAdminData = { username, password };
    fs.writeFileSync(adminPath, JSON.stringify(newAdminData, null, 2), 'utf-8');

    return NextResponse.json({ message: '管理員憑證更新成功' });
  } catch (error) {
    console.error('更新管理員憑證錯誤:', error);
    return NextResponse.json({ message: '伺服器錯誤，無法更新憑證' }, { status: 500 });
  }
}