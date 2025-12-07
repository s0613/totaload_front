"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, type User } from "@/lib/auth"
import { userService } from "@/features/user/UserService"
import { toast } from "sonner"

export default function AuthInitializer() {
  const { isLoggedIn, login, user, isHydrated, logout, isAuthChecked, setAuthChecked, resetAuthChecked } = useAuthStore()
  const router = useRouter()
  const initializedRef = useRef(false)

  useEffect(() => {
    // OAuth fragment 처리 (#access_token=xxx&refresh_token=xxx)
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken) {
        console.log("=== OAuth fragment 토큰 감지 ===")
        localStorage.setItem('jwt-token', accessToken)
        if (refreshToken) {
          localStorage.setItem('refresh-token', refreshToken)
        }
        // OAuth 토큰이 감지되면 인증 체크 상태 리셋 (다시 API 호출 필요)
        resetAuthChecked()
        initializedRef.current = false
        // URL에서 fragment 제거
        window.history.replaceState(null, '', window.location.pathname)
      }
    }

    // Zustand가 hydrate되지 않았거나 이미 초기화되었거나 로그인 상태이면 스킵
    if (!isHydrated || initializedRef.current || (isLoggedIn && user)) {
      // 이미 앱 상태에 로그인 정보가 있을 때도 인증 체크 완료로 표시하여
      // 초기 화면에서 무한 로딩이 발생하지 않도록 처리
      if (!initializedRef.current) {
        initializedRef.current = true
      }
      if (!isAuthChecked) {
        setAuthChecked()
      }
      return
    }

    // 이미 인증 체크가 끝났고 로그아웃 상태라면 스킵
    if (isAuthChecked && isLoggedIn === false && user === null) {
      initializedRef.current = true
      return
    }

    // 로그인 페이지에 있을 때는 인증 상태 복원을 시도하지 않음
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      initializedRef.current = true
      return
    }

    // JWT 토큰이 없고 로컬 스토리지에 인증 데이터가 없으면 로그아웃 상태로 설정
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('jwt-token')
      const authStorage = localStorage.getItem('auth-storage')
      if (!jwtToken && (!authStorage || authStorage === '{"state":{"user":null,"isLoggedIn":false,"isHydrated":false},"version":0}')) {
        logout()
        initializedRef.current = true
        return
      }
    }

    const initializeAuth = async () => {
      // OAuth로 방금 토큰을 받았는지 확인
      const isOAuthCallback = localStorage.getItem('jwt-token') && !user

      try {
        // 서버에 현재 사용자 확인 시도 (JWT 토큰 기반)
        const currentUser = await userService.getCurrentUser()

        if (currentUser) {
          const userData: User = {
            email: currentUser.email,
            name: currentUser.name || currentUser.email.split("@")[0],
            userId: currentUser.userId,
            role: currentUser.role,
          }

          login(userData)
          console.log("✅ 로그인 상태 복원 완료:", userData)

          // OAuth 콜백에서 왔다면 환영 메시지 표시
          if (isOAuthCallback) {
            toast.success(`${userData.name}님, 환영합니다!`)
          }
        } else {
          console.log("❌ 로그인 상태가 아님")
          // JWT 토큰이 있지만 유효하지 않으면 삭제
          localStorage.removeItem('jwt-token')
          localStorage.removeItem('refresh-token')
          logout()
        }
      } catch (error) {
        console.error("❌ 인증 초기화 실패:", error)
        // 인증 실패 시 토큰 삭제 및 로그아웃
        localStorage.removeItem('jwt-token')
        localStorage.removeItem('refresh-token')
        logout()
      } finally {
        initializedRef.current = true
        setAuthChecked()
      }
    }

    initializeAuth()
  }, [isLoggedIn, user, login, logout, router, isHydrated, isAuthChecked, setAuthChecked, resetAuthChecked])

  return null // 렌더링할 내용 없음
}
