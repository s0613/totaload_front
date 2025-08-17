"use client"

import { Home, LogIn, LogOut, FileText, Award, BarChart3 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuthStore, type User } from "@/lib/auth"
import { userService } from "@/features/user/UserService"
import { toast } from "sonner"

export default function CarSidebar() {
  const { isLoggedIn, logout, user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
      href: "/applications",
      icon: FileText,
      label: "신청내역",
      description: "Application History",
    },
    {
      href: "/analytics",
      icon: BarChart3,
      label: "통계",
      description: "Analytics",
    },
  ]

  return (
    <aside className="w-64 border-r px-6 py-8 flex flex-col bg-white">
      <div className="flex items-center gap-3 mb-8">
        <Image src="/Totaro_logo.svg" alt="Totaro Logo" width={40} height={40} />
        <div>
          <h1 className="text-lg font-bold text-gray-900">Totaro</h1>
          <p className="text-xs text-gray-500">Certificate System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
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

      <Separator className="my-4" />

      {isLoggedIn ? (
        <div className="space-y-4">
          {/* 사용자 정보 */}
          <Link 
            href="/profile" 
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt={user?.name || "User"} />
              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                {user?.name || "사용자"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 text-red-500 hover:text-red-600 w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent"></div>
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span className="text-sm">{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            console.log("로그인 버튼 클릭됨 - /login으로 이동")
            router.push("/login")
          }}
          className="flex items-center gap-3 text-blue-500 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border border-blue-200 hover:border-blue-300 w-full text-left"
        >
          <LogIn className="w-5 h-5" />
          <span className="text-sm font-medium">Login</span>
        </button>
      )}
    </aside>
  )
}
