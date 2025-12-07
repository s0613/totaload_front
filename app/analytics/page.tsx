"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { BarChart3 } from "lucide-react"


export default function AnalyticsPage() {
  const { isLoggedIn, isHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // 인증 상태가 하이드레이션된 후에만 체크
    if (isHydrated && !isLoggedIn) {
      router.push("/login")
      return
    }
  }, [isHydrated, isLoggedIn, router])

  // 인증 상태가 확인되지 않았으면 로딩 상태 표시
  if (!isHydrated) {
    return (
      <main className="flex-1 px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </main>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <main className="flex-1 px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">통계</h1>
          <p className="text-gray-600">인증서 발급 통계 및 분석 데이터를 확인하세요</p>
        </div>

        <div className="text-center py-16">
          <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">통계 페이지 준비 중</h3>
          <p className="text-gray-600">곧 상세한 통계 데이터를 제공할 예정입니다.</p>
        </div>
      </main>
  )
}
