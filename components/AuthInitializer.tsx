"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, type User } from "@/lib/auth"
import { userService } from "@/features/user/UserService"
import { toast } from "sonner"

export default function AuthInitializer() {
  const { isLoggedIn, login, user, isHydrated, logout } = useAuthStore()
  const router = useRouter()
  const initializedRef = useRef(false)

  useEffect(() => {
    // Zustand가 hydrate되지 않았거나 이미 초기화되었거나 로그인 상태이면 스킵
    if (!isHydrated || initializedRef.current || (isLoggedIn && user)) {
      return
    }

    // 로그아웃 상태에서 새로고침 시 불필요한 인증 확인 방지
    if (isLoggedIn === false && user === null) {
      initializedRef.current = true
      return
    }

    // 로그인 페이지에 있을 때는 인증 상태 복원을 시도하지 않음
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      initializedRef.current = true
      return
    }

    // 로컬 스토리지에 인증 데이터가 없으면 로그아웃 상태로 설정
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage')
      if (!authStorage || authStorage === '{"state":{"user":null,"isLoggedIn":false,"isHydrated":false},"version":0}') {
        logout()
        initializedRef.current = true
        return
      }
    }

    const initializeAuth = async () => {
      try {
        // 서버에 현재 사용자 확인 시도 (쿠키 기반)
        const currentUser = await userService.getCurrentUser()
        
        if (currentUser) {
          const userData: User = {
            email: currentUser.email,
            name: currentUser.email.split("@")[0],
            userId: currentUser.id,
            role: currentUser.role,
          }
          
          login(userData)
          console.log("✅ 로그인 상태 복원 완료:", userData)
          
          // OAuth 성공 처리
          const urlParams = new URLSearchParams(window.location.search)
          if (urlParams.get('success') === 'true') {
            toast.success(`${userData.name}님, 환영합니다!`)
            router.replace('/') // URL 파라미터 정리
          }
        } else {
          console.log("❌ 로그인 상태가 아님")
          // 명시적으로 로그아웃 상태로 설정
          logout()
        }
      } catch (error) {
        console.error("❌ 인증 초기화 실패:", error)
        // 인증 실패 시 로그아웃 상태로 설정
        logout()
      } finally {
        initializedRef.current = true
      }
    }

    initializeAuth()
  }, [isLoggedIn, user, login, logout, router, isHydrated])

  return null // 렌더링할 내용 없음
}
