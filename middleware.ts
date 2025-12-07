import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function checkUserAuth(request: NextRequest) {
  try {
    // Next.js 프록시를 통해 동일 오리진으로 API 호출
    const authUrl = '/api/auth/me';
    
    const cookieHeader = request.headers.get('cookie') || '';
    if (!cookieHeader) return { isAuthenticated: false };

    console.log('=== 백엔드 API 호출 시도 ===', authUrl);
    console.log('=== 쿠키 헤더 ===', cookieHeader);

    // withCredentials: true와 동일한 효과를 위해 쿠키를 자동으로 전달
    const response = await fetch(
      new URL(authUrl, request.url),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cookie': cookieHeader, // 쿠키를 명시적으로 전달
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      console.log('=== 백엔드 API 응답 실패 ===', response.status, response.statusText);
      console.log('=== 응답 헤더 ===', Object.fromEntries(response.headers.entries()));
      return { isAuthenticated: false, role: null };
    }

    const data = await response.json();
    console.log('=== 백엔드 API 응답 성공 ===', data);
    console.log('=== 응답 헤더 ===', Object.fromEntries(response.headers.entries()));
    
    return { 
      isAuthenticated: true, 
      role: data.role || null,
      ...data 
    };
  } catch (error) {
    console.error('Error checking authentication:', error);
    return { isAuthenticated: false, role: null };
  }
}


export async function middleware(request: NextRequest) {
  // admin 페이지 경로 체크
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('=== ADMIN 페이지 접근 시도 ===');
    const authData = await checkUserAuth(request);
    console.log('=== 인증 데이터 ===', authData);

    if (!authData.isAuthenticated) {
      console.log('인증되지 않음 - 로그인 페이지로 리다이렉트');
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // ADMIN 역할 확인
    if (authData.role !== 'ADMIN') {
      console.log('ADMIN 권한 없음 - 역할:', authData.role, '타입:', typeof authData.role);
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    console.log('ADMIN 권한 확인됨:', authData.role);
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
