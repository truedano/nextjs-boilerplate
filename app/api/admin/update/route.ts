import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // 身份驗證檢查：確保使用者已登入且具有管理員角色
    const role = request.cookies.get('role')?.value;
    if (!role || role !== 'admin') {
      return NextResponse.json({ message: '未經授權' }, { status: 403 });
    }

    if (action === 'updatePassword') {
      const { oldPassword, newPassword } = body;

      // 驗證輸入
      if (!oldPassword || !newPassword) {
        return NextResponse.json({ message: '缺少舊密碼或新密碼' }, { status: 400 });
      }

      // 找到 role 為 'admin' 的使用者
      const adminUser = await prisma.user.findFirst({
        where: { role: 'admin' },
      });

      if (!adminUser) {
        return NextResponse.json({ message: '找不到管理員使用者' }, { status: 404 });
      }

      // 驗證舊密碼
      const isPasswordCorrect = await bcrypt.compare(oldPassword, adminUser.passwordHash);
      if (!isPasswordCorrect) {
        return NextResponse.json({ message: '舊密碼不正確' }, { status: 401 });
      }

      // 對新密碼進行雜湊處理
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 使用 Prisma 更新資料庫，找到該管理員並更新其 passwordHash
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({ message: '管理員密碼更新成功' });

    } else if (action === 'createActivity') {
      const { activityFields, activityId } = body;

      if (!Array.isArray(activityFields)) {
        return NextResponse.json({ message: 'activityFields 必須是一個陣列' }, { status: 400 });
      }
      if (!activityId) {
        return NextResponse.json({ message: '缺少活動 ID' }, { status: 400 });
      }

      for (const field of activityFields) {
        if (
          typeof field.name !== 'string' ||
          typeof field.type !== 'string' ||
          typeof field.content !== 'string'
        ) {
          return NextResponse.json(
            { message: '每個活動欄位物件必須包含 name (字串), type (字串) 和 content (字串)' },
            { status: 400 }
          );
        }
      }

      try {
        const newActivity = await prisma.activity.create({
          data: {
            id: activityId,
            name: activityFields.find((f: any) => f.name === '活動名稱')?.content || '新活動',
            description: activityFields.find((f: any) => f.name === '活動描述')?.content || '這是透過活動管理頁面創建的新活動',
            date: new Date(activityFields.find((f: any) => f.name === '活動日期開始')?.content || new Date()),
            location: activityFields.find((f: any) => f.name === '活動地點')?.content || '線上',
            customFields: activityFields,
          },
        });
        console.log('新活動已創建:', newActivity);
        return NextResponse.json({ message: '活動創建成功', activity: newActivity });
      } catch (createError: any) {
        console.error('創建活動錯誤:', createError);
        return NextResponse.json({ message: '創建活動失敗' }, { status: 500 });
      }

    } else if (action === 'updateExistingActivity') {
      const { activityId, activityFields } = body;

      if (!activityId) {
        return NextResponse.json({ message: '缺少活動 ID' }, { status: 400 });
      }
      if (!Array.isArray(activityFields)) {
        return NextResponse.json({ message: 'activityFields 必須是一個陣列' }, { status: 400 });
      }

      for (const field of activityFields) {
        if (
          typeof field.name !== 'string' ||
          typeof field.type !== 'string' ||
          typeof field.content !== 'string'
        ) {
          return NextResponse.json(
            { message: '每個活動欄位物件必須包含 name (字串), type (字串) 和 content (字串)' },
            { status: 400 }
          );
        }
      }

      try {
        const updatedActivity = await prisma.activity.update({
          where: { id: activityId },
          data: {
            name: activityFields.find((f: any) => f.name === '活動名稱')?.content || '更新活動',
            description: activityFields.find((f: any) => f.name === '活動描述')?.content || '這是透過活動管理頁面更新的活動',
            date: new Date(activityFields.find((f: any) => f.name === '活動日期開始')?.content || new Date()),
            location: activityFields.find((f: any) => f.name === '活動地點')?.content || '線上',
            customFields: activityFields,
          },
        });
        console.log('活動已更新:', updatedActivity);
        return NextResponse.json({ message: '活動更新成功', activity: updatedActivity });
      } catch (updateError: any) {
        if (updateError.code === 'P2025') {
          return NextResponse.json({ message: '找不到要更新的活動' }, { status: 404 });
        }
        console.error('更新活動錯誤:', updateError);
        return NextResponse.json({ message: '更新活動失敗' }, { status: 500 });
      }

    } else if (action === 'deleteActivity') {
      const { activityId } = body;

      if (!activityId) {
        return NextResponse.json({ message: '缺少活動 ID' }, { status: 400 });
      }

      try {
        await prisma.activity.delete({
          where: { id: activityId },
        });
        return NextResponse.json({ message: '活動刪除成功' });
      } catch (deleteError: any) {
        if (deleteError.code === 'P2025') { // P2025 是 Prisma 找不到記錄時的錯誤碼
          return NextResponse.json({ message: '找不到要刪除的活動' }, { status: 404 });
        }
        console.error('刪除活動錯誤:', deleteError);
        return NextResponse.json({ message: '刪除活動失敗' }, { status: 500 });
      }

    } else {
      return NextResponse.json({ message: '無效的動作' }, { status: 400 });
    }

  } catch (error) {
    console.error('處理更新請求錯誤:', error);
    return NextResponse.json({ message: '伺服器錯誤，無法處理請求' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // 身份驗證檢查：確保使用者已登入且具有管理員角色
    const role = request.cookies.get('role')?.value;
    if (!role || role !== 'admin') {
      return NextResponse.json({ message: '未經授權' }, { status: 403 });
    }

    const activities = await prisma.activity.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('處理 GET 活動請求錯誤:', error);
    return NextResponse.json({ message: '伺服器錯誤，無法獲取活動' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}