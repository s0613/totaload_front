"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { BarChart3 } from "lucide-react"
import Sidebar from "@/components/common/Sidebar"

export default function AnalyticsPage() {
  const { isLoggedIn } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
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
    </div>
  )
}
