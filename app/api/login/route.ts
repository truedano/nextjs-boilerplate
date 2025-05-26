import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const adminPath = path.join(process.cwd(), 'data', 'admin.json');
  const usersPath = path.join(process.cwd(), 'data', 'users.json');

  try {
    const adminData = JSON.parse(fs.readFileSync(adminPath, 'utf-8'));
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

    // 驗證管理員
    if (username === adminData.username && password === adminData.password) {
      const response = NextResponse.json({ message: '管理員登入成功', redirect: '/admin' });
      response.cookies.set('role', 'admin', { path: '/', httpOnly: true });
      return response;
    }

    // 驗證一般使用者
    const user = usersData.find((u: any) => u.username === username && u.password === password);
    if (user) {
      const response = NextResponse.json({ message: '使用者登入成功', redirect: '/users' });
      response.cookies.set('role', 'user', { path: '/', httpOnly: true });
      return response;
    }

    return NextResponse.json({ message: '無效的使用者名稱或密碼' }, { status: 401 });
  } catch (error) {
    console.error('登入錯誤:', error);
    return NextResponse.json({ message: '伺服器錯誤' }, { status: 500 });
  }
}