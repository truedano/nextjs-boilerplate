import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('role')?.value;

  // 如果是登入頁面，則直接放行
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 保護 /admin 路由
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 保護 /users 路由
  if (pathname.startsWith('/users')) {
    if (role !== 'user' && role !== 'admin') { // 管理員也可以訪問使用者頁面
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 處理根路徑的導向邏輯
  if (pathname === '/') {
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (role === 'user') {
      return NextResponse.redirect(new URL('/users', request.url));
    } else { // 如果沒有任何角色 cookie，表示未登入
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/users/:path*'],
};