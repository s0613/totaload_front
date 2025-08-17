"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { userService } from "@/features/user/UserService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Settings, Shield } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()
  const [userDetails, setUserDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    loadUserDetails()
  }, [isLoggedIn, router, user])

  const loadUserDetails = async () => {
    if (!user?.userId) return

    try {
      setIsLoading(true)
      const details = await userService.getUserDetails(user.userId)
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "USER":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (!isLoggedIn) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">프로필</h1>
              <p className="text-gray-600">계정 정보 및 설정을 관리하세요</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 프로필 카드 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg" alt={userDetails?.name || "User"} />
                      <AvatarFallback className="text-2xl">
                        {userDetails?.name?.charAt(0).toUpperCase() ||
                          userDetails?.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{userDetails?.name}</CardTitle>
                  <CardDescription>{userDetails?.email}</CardDescription>
                  <div className="flex justify-center mt-2">
                    <Badge variant={getRoleBadgeVariant(userDetails?.role)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {getRoleDisplayName(userDetails?.role)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" onClick={() => router.push("/profile/edit")}>
                    <Edit className="w-4 h-4 mr-2" />
                    프로필 수정
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => router.push("/profile/settings")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    계정 설정
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* 상세 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                  <CardDescription>계정의 기본 정보입니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">이름</label>
                      <p className="text-lg font-semibold">{userDetails?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">이메일</label>
                      <p className="text-lg font-semibold">{userDetails?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">회사명</label>
                      <p className="text-lg font-semibold">{userDetails?.company}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">사업자 등록번호</label>
                      <p className="text-lg font-semibold">{userDetails?.businessNumber || "등록되지 않음"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 계정 상태 */}
              <Card>
                <CardHeader>
                  <CardTitle>계정 상태</CardTitle>
                  <CardDescription>계정의 현재 상태입니다</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">이메일 인증</label>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            userDetails?.emailVerified ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <span className={`text-sm ${userDetails?.emailVerified ? "text-green-600" : "text-red-600"}`}>
                          {userDetails?.emailVerified ? "인증 완료" : "인증 필요"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">계정 권한</label>
                      <p className="text-sm text-gray-600 mt-1">{getRoleDisplayName(userDetails?.role)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">가입일</label>
                      <p className="text-sm text-gray-600 mt-1">{new Date().toLocaleDateString("ko-KR")}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">마지막 로그인</label>
                      <p className="text-sm text-gray-600 mt-1">방금 전</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 빠른 작업 */}
              <Card>
                <CardHeader>
                  <CardTitle>빠른 작업</CardTitle>
                  <CardDescription>자주 사용하는 기능들입니다</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start bg-transparent"
                      onClick={() => router.push("/profile/edit")}
                    >
                      <Edit className="w-5 h-5 mb-2" />
                      <div className="text-left">
                        <p className="font-semibold">프로필 수정</p>
                        <p className="text-sm text-gray-500">이름, 회사명 등 수정</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start bg-transparent"
                      onClick={() => router.push("/profile/password")}
                    >
                      <Shield className="w-5 h-5 mb-2" />
                      <div className="text-left">
                        <p className="font-semibold">비밀번호 변경</p>
                        <p className="text-sm text-gray-500">보안을 위해 정기적으로 변경</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
