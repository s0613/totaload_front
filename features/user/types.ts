// Role enum matching the Spring Boot backend
export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

// User interface matching backend User entity
export interface User {
  id: number
  email: string
  name: string
  company: string
  businessNumber?: string
  role: Role
  emailVerified?: boolean
  createdAt?: string
  updatedAt?: string
}

// 백엔드 AuthRequest와 일치하는 회원가입 요청 타입
export interface SignupRequest {
  email: string
  password: string
  name: string
  company: string
  role: Role
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string
  password: string
}

// 백엔드 AuthResponse.SignupResponse와 일치하는 응답 타입
export interface SignupResponse {
  message: string
  userId?: number
}

// 로그인 응답 타입
export interface LoginResponse {
  message: string
  success?: boolean
  token?: string
  redirectUrl?: string
  user?: {
    id: number
    email: string
    name: string
    role: string
  }
}

// 현재 사용자 정보 응답 타입 (/api/auth/me)
export interface CurrentUserResponse {
  email: string
  id: number
  role: string
}

// 프로필 업데이트 요청 타입
export interface UpdateProfileRequest {
  name?: string
  company?: string
  businessNumber?: string
}

// 비밀번호 변경 요청 타입
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// 이메일 인증 요청 타입
export interface EmailVerificationRequest {
  email: string
  code: string
}

// 로그아웃 응답 타입
export interface LogoutResponse {
  message: string
}
