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
  company?: string
}

// 로그인 요청 타입
export interface LoginRequest {
  usernameOrEmail: string
  password: string
}

// 백엔드 AuthResponse와 일치하는 회원가입 응답 타입
// 백엔드는 회원가입 성공 시 JWT 토큰과 함께 AuthResponse를 반환
export interface SignupResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: number
  email: string
  name: string
  role: string
  company?: string
}

// 로그인 응답 타입 (백엔드 AuthResponse와 일치)
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userId: number
  email: string
  name: string
  role: string
}

// 현재 사용자 정보 응답 타입 (/api/auth/me)
// 백엔드 AuthResponse와 일치 (userId 필드 사용)
export interface CurrentUserResponse {
  userId: number
  email: string
  name: string
  role: string
  company?: string
  tokenType?: string
}

// 프로필 업데이트 요청 타입 (백엔드와 일치)
export interface UpdateProfileRequest {
  name?: string
  email?: string
  phoneNumber?: string
  company?: string
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
