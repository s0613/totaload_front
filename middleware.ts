import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function checkUserAuth(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const cookieHeader = request.headers.get('cookie') || '';
    if (!cookieHeader) return { isAuthenticated: false };

    const response = await fetch(
      `${backendUrl}/auth/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookieHeader,
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      return { isAuthenticated: false };
    }

    const data = await response.json();
    // ← 여기서 반드시 isAuthenticated: true 를 붙여줍니다
    return { isAuthenticated: true, ...data };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false };
  }
}


export async function middleware(request: NextRequest) {
  // admin 페이지 경로 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authData = await checkUserAuth(request);

    if (!authData.isAuthenticated || authData.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // my 페이지 경로 체크 - 로그인 필요
  if (request.nextUrl.pathname.startsWith('/my')) {
    const authData = await checkUserAuth(request);

    if (!authData.isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }


  return NextResponse.next()
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: ['/admin/:path*', '/my/:path*']
}
