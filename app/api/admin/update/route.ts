import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  try {
    // 身份驗證檢查：確保使用者已登入且具有管理員角色
    const role = request.cookies.get('role')?.value;

    if (!role || role !== 'admin') {
      return NextResponse.json({ message: '未經授權' }, { status: 403 });
    }

    // 對新密碼進行雜湊處理
    const hashedPassword = await bcrypt.hash(password, 10);

    // 找到 role 為 'admin' 的使用者
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!adminUser) {
      return NextResponse.json({ message: '找不到管理員使用者' }, { status: 404 });
    }

    // 使用 Prisma 更新資料庫，找到該管理員並更新其 passwordHash
    await prisma.user.update({
      where: { id: adminUser.id }, // 使用找到的管理員的 id 進行更新
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json({ message: '管理員密碼更新成功' });
  } catch (error) {
    console.error('更新管理員密碼錯誤:', error);
    return NextResponse.json({ message: '伺服器錯誤，無法更新密碼' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}