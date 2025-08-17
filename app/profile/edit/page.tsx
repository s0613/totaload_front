"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { userService } from "@/features/user/UserService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

export default function EditProfilePage() {
  const { isLoggedIn, user, login } = useAuthStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    businessNumber: "",
  })

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
      const details = await userService.getUserDetails(user.userId)
      setFormData({
        name: details.name || "",
        company: details.company || "",
        businessNumber: details.businessNumber || "",
      })
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error)
      toast.error("사용자 정보를 불러오는데 실패했습니다.")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("이름을 입력해주세요.")
      return false
    }

    if (!formData.company.trim()) {
      toast.error("회사명을 입력해주세요.")
      return false
    }

    // 사업자 등록번호 형식 검증 (선택사항이므로 값이 있을 때만)
    if (formData.businessNumber.trim()) {
      const businessNumberRegex = /^\d{3}-\d{2}-\d{5}$/
      if (!businessNumberRegex.test(formData.businessNumber)) {
        toast.error("사업자 등록번호는 000-00-00000 형식으로 입력해주세요.")
        return false
      }
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
      await userService.updateProfile(user.userId, {
        name: formData.name.trim(),
        company: formData.company.trim(),
        businessNumber: formData.businessNumber.trim() || undefined,
      })

      // Zustand store 업데이트
      login({
        ...user,
        name: formData.name.trim(),
      })

      toast.success("프로필이 성공적으로 업데이트되었습니다!")
      router.push("/profile")
    } catch (error) {
      console.error("프로필 업데이트 실패:", error)
      let errorMessage = "프로필 업데이트에 실패했습니다."
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
              <h1 className="text-3xl font-bold text-gray-900">프로필 수정</h1>
              <p className="text-gray-600">개인 정보를 수정하세요</p>
            </div>
          </div>

          {/* 수정 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보 수정</CardTitle>
              <CardDescription>이름, 회사명, 사업자 등록번호를 수정할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    이름 *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="이름을 입력하세요"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium text-gray-700">
                    회사명 *
                  </label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="회사명을 입력하세요"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="businessNumber" className="text-sm font-medium text-gray-700">
                    사업자 등록번호 (선택사항)
                  </label>
                  <Input
                    id="businessNumber"
                    type="text"
                    placeholder="000-00-00000"
                    value={formData.businessNumber}
                    onChange={(e) => handleInputChange("businessNumber", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">사업자 등록번호는 000-00-00000 형식으로 입력해주세요.</p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    취소
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        저장
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
