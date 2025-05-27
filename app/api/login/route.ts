import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const failedAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  try {
    // 速率限制檢查
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('X-Real-IP');
    if (ip) {
      const attempt = failedAttempts.get(ip);
      if (attempt && attempt.count >= MAX_ATTEMPTS && (Date.now() - attempt.lastAttempt) < LOCKOUT_TIME) {
        return NextResponse.json({ message: '登入嘗試過多，請稍後再試' }, { status: 429 });
      }
    }

    // 從資料庫查詢使用者
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      // 登入失敗，增加失敗嘗試次數
      if (ip) {
        const attempt = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
        attempt.count++;
        attempt.lastAttempt = Date.now();
        failedAttempts.set(ip, attempt);
      }
      return NextResponse.json({ message: '登入憑證無效' }, { status: 401 });
    }

    // 驗證密碼
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (passwordMatch) {
      const response = NextResponse.json({ message: '登入成功', role: user.role, redirect: user.role === 'admin' ? '/admin' : '/users' });
      response.cookies.set('role', user.role, { path: '/', httpOnly: true });
      if (ip) failedAttempts.delete(ip); // 成功登入，清除失敗記錄
      return response;
    } else {
      // 登入失敗，增加失敗嘗試次數
      if (ip) {
        const attempt = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
        attempt.count++;
        attempt.lastAttempt = Date.now();
        failedAttempts.set(ip, attempt);
      }
      return NextResponse.json({ message: '登入憑證無效' }, { status: 401 });
    }
  } catch (error) {
    console.error('登入錯誤:', error);
    return NextResponse.json({ message: '伺服器錯誤' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}