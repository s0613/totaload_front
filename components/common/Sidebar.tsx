"use client"

import { Home, LogIn, LogOut, FileText, Award, BarChart3 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"


import { Separator } from "@/components/ui/separator"
import { useAuthStore, type User } from "@/lib/auth"
import { userService } from "@/features/user/UserService"
import { toast } from "sonner"

export default function CarSidebar() {
  const { isLoggedIn, logout, user, isHydrated, isAuthChecked, setAuthChecked } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // 컴포넌트 마운트 시 인증 상태 체크
  useEffect(() => {
    if (isHydrated && !isAuthChecked) {
      // 인증 상태가 하이드레이션된 후 한 번만 체크
      setAuthChecked()
    }
  }, [isHydrated, isAuthChecked, setAuthChecked])

  const handleLogout = async () => {
    if (isLoggingOut) return // 중복 실행 방지
    
    setIsLoggingOut(true)
    
    try {
      // 백엔드 로그아웃 API 호출 (쿠키 삭제)
      await userService.logout()
      
      // 프론트엔드 상태 초기화
      logout()
      
      // 로컬 스토리지 완전 정리
      localStorage.removeItem('auth-storage')
      sessionStorage.clear()
      
      toast.success("로그아웃되었습니다")
      
      // 로그인 페이지로 이동하고 현재 페이지 히스토리 정리
      router.replace("/login")
    } catch (error) {
      console.error("로그아웃 실패:", error)
      toast.error("로그아웃 중 오류가 발생했습니다")
      
      // 백엔드 호출 실패해도 프론트엔드 상태는 초기화
      logout()
      
      // 로컬 스토리지 완전 정리
      localStorage.removeItem('auth-storage')
      sessionStorage.clear()
      
      // 로그인 페이지로 이동하고 현재 페이지 히스토리 정리
      router.replace("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const menuItems = [
    {
      href: "/",
      icon: Home,
      label: "대시보드",
      description: "Dashboard",
    },
    {
      href: "/certificates",
      icon: Award,
      label: "인증서 관리",
      description: "Certificate Management",
    },
    {
      href: "/payments/history",
      icon: FileText,
      label: "결제내역",
      description: "Payment History",
    },
    {
      href: "/analytics",
      icon: BarChart3,
      label: "통계",
      description: "Analytics",
    },
  ]

  // 인증 상태가 하이드레이션되지 않았으면 로딩 상태 표시
  if (!isHydrated) {
    return (
      <aside className="w-64 h-full border-r px-6 py-8 flex flex-col bg-white overflow-hidden flex-shrink-0 z-10">
        <div className="flex items-center gap-3 mb-8">
          <Image src="/Totaro_logo.svg" alt="Totaro Logo" width={40} height={40} />
          <div>
            <h1 className="text-lg font-bold text-gray-900">Totaro</h1>
            <p className="text-xs text-gray-500">Certificate System</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-64 h-full border-r px-6 py-8 flex flex-col bg-white overflow-hidden flex-shrink-0 z-10">
      <div className="flex items-center gap-3 mb-8">
        <Image src="/Totaro_logo.svg" alt="Totaro Logo" width={40} height={40} />
        <div>
          <h1 className="text-lg font-bold text-gray-900">Totaro</h1>
          <p className="text-xs text-gray-500">Certificate System</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-gray-500">{item.description}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <Separator className="mx-4 mb-4" />

      {isLoggedIn ? (
        <div className="px-4 pb-4 space-y-3">
          {/* 사용자 정보 */}
          <Link 
            href="/profile" 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              pathname === "/profile" || pathname.startsWith("/profile/")
                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                pathname === "/profile" || pathname.startsWith("/profile/")
                  ? "text-blue-700"
                  : "text-gray-900 group-hover:text-blue-600"
              }`}>
                {user?.name || "사용자"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 text-red-600 hover:text-red-700 w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</span>
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <button
            onClick={() => {
              console.log("로그인 버튼 클릭됨 - /login으로 이동")
              router.push("/login")
            }}
            className="flex items-center gap-3 text-blue-600 hover:text-blue-700 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-blue-200 hover:border-blue-300 w-full text-left"
          >
            <LogIn className="w-5 h-5" />
            <span className="text-sm font-medium">로그인</span>
          </button>
        </div>
      )}
    </aside>
  )
}
