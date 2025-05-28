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

    } else if (action === 'updateActivityFields') {
      const { activityFields } = body;

      // 資料驗證
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

      // 將活動欄位資料儲存到資料庫
      // 這裡假設我們只有一個活動，或者我們總是更新/創建一個預設的活動
      // 如果前端傳送了活動 ID，則可以根據 ID 更新
      // 為了簡化，如果沒有提供活動 ID，我們將創建一個新的活動
      // 或者更新一個預設的活動（例如 ID 為 1 的活動）

      const { activityId } = body; // 從前端獲取活動 ID

      let activity;
      if (activityId) {
        // 如果提供了活動 ID，則更新現有活動
        activity = await prisma.activity.update({
          where: { id: activityId },
          data: {
            customFields: activityFields,
          },
        });
      } else {
        // 如果沒有提供活動 ID，則創建一個新的活動
        activity = await prisma.activity.create({
          data: {
            id: activityId, // 使用前端傳遞的 activityId 作為 id
            name: '新活動', // 為新活動提供一個預設名稱
            description: '這是透過活動管理頁面創建的新活動',
            date: new Date(), // 預設為當前日期時間
            location: '線上',
            customFields: activityFields,
          },
        });
      }

      console.log('活動欄位資料已儲存/更新:', activity);

      return NextResponse.json({ message: '活動欄位資料更新成功', activity });

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

    const activities = await prisma.activity.findMany();
    return NextResponse.json(activities);
  } catch (error) {
    console.error('處理 GET 活動請求錯誤:', error);
    return NextResponse.json({ message: '伺服器錯誤，無法獲取活動' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}