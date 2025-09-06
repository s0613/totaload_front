"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { userService } from "@/features/user/UserService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Shield, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function ChangePasswordPage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
  }, [isLoggedIn, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const validateForm = () => {
    if (!formData.currentPassword) {
      toast.error("현재 비밀번호를 입력해주세요.")
      return false
    }

    if (!formData.newPassword) {
      toast.error("새 비밀번호를 입력해주세요.")
      return false
    }

    if (formData.newPassword.length < 6) {
      toast.error("새 비밀번호는 최소 6자 이상이어야 합니다.")
      return false
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다.")
      return false
    }

    if (formData.currentPassword === formData.newPassword) {
      toast.error("새 비밀번호는 현재 비밀번호와 달라야 합니다.")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!user?.userId) {
      toast.error("사용자 정보를 찾을 수 없습니다.")
      return
    }

    setIsLoading(true)

    try {
      await userService.changePassword(user.userId, formData.currentPassword, formData.newPassword, formData.confirmPassword)

      toast.success("비밀번호가 성공적으로 변경되었습니다!")

      // 폼 초기화
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      router.push("/profile")
    } catch (error) {
      console.error("비밀번호 변경 실패:", error)
      let errorMessage = "비밀번호 변경에 실패했습니다."
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
              <h1 className="text-3xl font-bold text-gray-900">비밀번호 변경</h1>
              <p className="text-gray-600">계정 보안을 위해 비밀번호를 변경하세요</p>
            </div>
          </div>

          {/* 비밀번호 변경 폼 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                비밀번호 변경
              </CardTitle>
              <CardDescription>보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 현재 비밀번호 */}
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                    현재 비밀번호 *
                  </label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      placeholder="현재 비밀번호를 입력하세요"
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("current")}
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 새 비밀번호 */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    새 비밀번호 *
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("new")}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 새 비밀번호 확인 */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    새 비밀번호 확인 *
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility("confirm")}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 비밀번호 안전성 가이드 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">안전한 비밀번호 만들기</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• 최소 6자 이상 사용</li>
                    <li>• 영문 대소문자, 숫자, 특수문자 조합 권장</li>
                    <li>• 개인정보(이름, 생일 등)는 사용하지 마세요</li>
                    <li>• 다른 사이트와 다른 비밀번호를 사용하세요</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    취소
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        변경 중...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        비밀번호 변경
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
