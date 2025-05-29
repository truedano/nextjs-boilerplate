import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('查詢活動時發生錯誤:', error);
    return NextResponse.json({ message: '無法查詢活動' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}