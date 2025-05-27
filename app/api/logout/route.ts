import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const response = NextResponse.json({ message: '登出成功' }, { status: 200 });
    response.cookies.set('sessionToken', '', { expires: new Date(0), path: '/' });
    response.cookies.set('role', '', { expires: new Date(0), path: '/' });
    return response;
    return NextResponse.json({ message: '登出成功' }, { status: 200 });
  } catch (error) {
    console.error('登出失敗:', error);
    return NextResponse.json({ message: '登出失敗' }, { status: 500 });
  }
}