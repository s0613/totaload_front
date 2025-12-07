import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // 프로덕션: 환경변수 사용, 개발: 프록시(/api) 사용
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (isDev ? '/api' : ''),
  },
  async rewrites() {
    // 개발 환경에서만 로컬 백엔드로 프록시
    if (!isDev) return [];
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
  // 개발 환경에서 CORS 문제 해결을 위한 설정
  async headers() {
    if (!isDev) return [];
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
