"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { toast } from "sonner";

function OAuth2RedirectHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      try {
        // URL 파라미터에서 토큰과 사용자 정보 추출
        const token = searchParams.get("token");
        const email = searchParams.get("email");
        const name = searchParams.get("name");

        console.log("=== OAuth2 Redirect 처리 ===");
        console.log("Token:", token);
        console.log("Email:", email);
        console.log("Name:", name);

        if (!token || !email || !name) {
          throw new Error("OAuth2 인증 정보가 누락되었습니다.");
        }

        // JWT 토큰을 localStorage에 저장 (선택사항)
        if (typeof window !== "undefined") {
          localStorage.setItem("jwt-token", token);
        }

        // Zustand store에 사용자 정보 저장
        // userId는 백엔드에서 /api/auth/me를 호출하여 가져와야 하지만
        // 일단 임시로 0으로 설정
        login({
          email,
          name,
          userId: 0, // 임시값
          role: "USER",
        });

        toast.success(`${name}님, 환영합니다!`);

        // 메인 페이지로 리다이렉트
        router.replace("/");
      } catch (error: any) {
        console.error("OAuth2 리다이렉트 처리 실패:", error);
        toast.error(error.message || "로그인 처리 중 오류가 발생했습니다.");
        router.replace("/login");
      }
    };

    handleOAuth2Redirect();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">로그인 처리 중...</h2>
        <p className="text-gray-500 mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}

export default function OAuth2RedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">로딩 중...</h2>
          </div>
        </div>
      }
    >
      <OAuth2RedirectHandler />
    </Suspense>
  );
}
