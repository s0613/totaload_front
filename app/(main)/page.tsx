"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { toast } from "sonner"
import CertificateList from "@/features/certificate/CertificateList"

function OAuthErrorHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error(`로그인 실패: ${decodeURIComponent(error)}`);
      router.replace('/login');
    }
  }, [searchParams, router]);

  return null;
}

export default function ExportCertApp() {
  const router = useRouter();
  const { user, isLoggedIn, isHydrated, isAuthChecked } = useAuthStore();

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (isHydrated && isAuthChecked && !isLoggedIn) {
      router.push('/login');
    }
  }, [isHydrated, isAuthChecked, isLoggedIn, router]);

  // Hydration이 완료되지 않았거나 로딩 중일 때는 로딩 화면 표시
  if (!isHydrated || !isAuthChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 인증되지 않은 사용자는 로딩 화면 표시 (리다이렉트 중)
  if (!isLoggedIn || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <OAuthErrorHandler />
      </Suspense>
      <CertificateList />
    </>
  );
}
