"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { userService } from "@/features/user/UserService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { isLoggedIn, user, logout } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
  }, [isLoggedIn, router])

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("비밀번호를 입력해주세요.")
      return
    }

    if (!user?.userId) {
      toast.error("사용자 정보를 찾을 수 없습니다.")
      return
    }

    setIsLoading(true)

    try {
      await userService.deleteAccount(user.userId, deletePassword)
      toast.success("계정이 성공적으로 삭제되었습니다.")
      logout()
      router.push("/login")
    } catch (error) {
      console.error("계정 삭제 실패:", error)
      let errorMessage = "계정 삭제에 실패했습니다."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">계정 설정</h1>
              <p className="text-gray-600">계정 관련 설정을 관리하세요</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 계정 관리 */}
            <Card>
              <CardHeader>
                <CardTitle>계정 관리</CardTitle>
                <CardDescription>계정과 관련된 설정을 관리할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">프로필 수정</h4>
                    <p className="text-sm text-gray-500">이름, 회사명 등 기본 정보 수정</p>
                  </div>
                  <Button variant="outline" onClick={() => router.push("/profile/edit")}>
                    수정
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">비밀번호 변경</h4>
                    <p className="text-sm text-gray-500">계정 보안을 위해 비밀번호 변경</p>
                  </div>
                  <Button variant="outline" onClick={() => router.push("/profile/password")}>
                    변경
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 위험한 작업 */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  위험한 작업
                </CardTitle>
                <CardDescription>이 작업들은 되돌릴 수 없습니다. 신중하게 진행해주세요.</CardDescription>
              </CardHeader>
              <CardContent>
                {!showDeleteConfirm ? (
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-medium text-red-800">계정 삭제</h4>
                      <p className="text-sm text-red-600">계정과 모든 데이터가 영구적으로 삭제됩니다</p>
                    </div>
                    <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      계정 삭제
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="text-center">
                      <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h4 className="font-bold text-red-800 mb-2">정말로 계정을 삭제하시겠습니까?</h4>
                      <p className="text-sm text-red-600 mb-4">
                        이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="deletePassword" className="text-sm font-medium text-red-700">
                        확인을 위해 현재 비밀번호를 입력하세요
                      </label>
                      <Input
                        id="deletePassword"
                        type="password"
                        placeholder="현재 비밀번호"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="border-red-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeletePassword("")
                        }}
                        className="flex-1"
                      >
                        취소
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isLoading || !deletePassword}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            삭제 중...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            계정 삭제
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
