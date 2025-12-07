"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { userService } from "@/features/user/UserService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"


export default function ProfilePage() {
  const { isLoggedIn, user, isHydrated } = useAuthStore()
  const router = useRouter()
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 인증 상태가 하이드레이션된 후에만 체크
    if (isHydrated && !isLoggedIn) {
      router.push("/login")
      return
    }

    // 인증 상태가 확인된 후에만 사용자 정보 로드
    if (isHydrated && isLoggedIn) {
      loadUserDetails()
    }
  }, [isHydrated, isLoggedIn, router, user])

  const loadUserDetails = async () => {
    if (!user?.userId) return

    try {
      setIsLoading(true)
      const details = await userService.getCurrentUser()
      setUserDetails(details)
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error)
      toast.error("사용자 정보를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case "ADMIN":
        return "관리자"
      case "USER":
        return "일반 사용자"
      default:
        return role
    }
  }


  if (!isLoggedIn) {
    return null
  }

  if (isLoading) {
    return (
      <main className="flex-1 p-3 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">사용자 정보를 불러오는 중...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-3 sm:p-6 lg:p-8">
      <div className="max-w-4xl">
        {/* 헤더 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">프로필</h1>
          <p className="text-sm sm:text-base text-gray-600">계정 정보 및 설정을 관리하세요</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">기본 정보</CardTitle>
              <CardDescription className="text-sm">계정의 기본 정보입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">이름</label>
                  <p className="text-lg font-semibold text-gray-900">{userDetails?.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">이메일</label>
                  <p className="text-lg font-semibold text-gray-900">{userDetails?.email}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">회사명</label>
                  <p className="text-lg font-semibold text-gray-900">{userDetails?.company}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">사업자 등록번호</label>
                  <p className="text-lg font-semibold text-gray-900">{userDetails?.businessNumber || "등록되지 않음"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계정 상태 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">계정 상태</CardTitle>
              <CardDescription className="text-sm">계정의 현재 상태입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">이메일 인증</label>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        userDetails?.emailVerified ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className={`text-sm font-medium ${userDetails?.emailVerified ? "text-green-600" : "text-red-600"}`}>
                      {userDetails?.emailVerified ? "인증 완료" : "인증 필요"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">계정 권한</label>
                  <p className="text-sm text-gray-900">{getRoleDisplayName(userDetails?.role)}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">가입일</label>
                  <p className="text-sm text-gray-900">{new Date().toLocaleDateString("ko-KR")}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">마지막 로그인</label>
                  <p className="text-sm text-gray-900">방금 전</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  )
}
