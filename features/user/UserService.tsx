import { api } from '@/lib/apiClient';
import { 
  SignupRequest, 
  SignupResponse, 
  LoginRequest, 
  LoginResponse, 
  CurrentUserResponse,
  LogoutResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  Role
} from './types';

class UserService {
  /** 회원가입 */
  async signup(signupData: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await api.post<SignupResponse>('/auth/signup', signupData);
      return response.data;
    } catch (error: any) {
      console.error('회원가입 실패:', error);
      throw new Error(error.message || '회원가입에 실패했습니다.');
    }
  }

  /** 로그인 (일반 로그인) – XHR에서 303을 피하기 위해 상태 유연 처리 */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', loginData, {
        validateStatus: () => true, // 상태코드 상관없이 일단 통과
      });

      // 서버가 XHR을 감지하면 200 JSON을 돌려줌
      if (response.status === 200 && response.data && (response.data as any).success) {
        return response.data;
      }

      // 혹시 303/204 등이어도 쿠키는 이미 박혔을 수 있으니 /auth/me로 확인
      try {
        await api.get<CurrentUserResponse>('/auth/me');
        return { success: true, message: 'ok', redirectUrl: '/' } as LoginResponse;
      } catch (e: any) {
        const msg = response.data?.message || e?.message || '로그인 실패';
        throw new Error(msg);
      }
    } catch (postError: any) {
      // CORS 등으로 POST 자체가 네트워크 오류일 때도 /auth/me로 한 번 더 확인
      try {
        await api.get<CurrentUserResponse>('/auth/me');
        return { success: true, message: 'ok', redirectUrl: '/' } as LoginResponse;
      } catch (e: any) {
        throw new Error(postError?.message || '로그인 실패');
      }
    }
  }

  /** Google OAuth 로그인 시작 */
  startGoogleOAuth(): void {
    try {
      console.log("=== Google OAuth 시작 ===");
      // 프런트 프록시(`/api`)를 통해 동일 오리진(3000)에서 요청을 시작하여
      // 콜백에서도 동일 오리진으로 돌아오게 해 쿠키 스코프를 일치시킨다.
      window.location.href = '/api/auth/google';
    } catch (error) {
      console.error("Google 로그인 시작 실패:", error);
    }
  }

  /** OAuth 콜백 후 쿠키 상태 확인 */
  checkOAuthCookies(): void {
    console.log('=== OAuth 콜백 후 쿠키 상태 확인 ===');
    this.debugCookies();
    
    // 3초 후 사용자 정보 조회 시도
    setTimeout(async () => {
      console.log('=== 3초 후 사용자 정보 조회 시도 ===');
      try {
        const user = await this.getCurrentUser();
        console.log('사용자 정보 조회 결과:', user);
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      }
    }, 3000);
  }

  /** 현재 로그인된 사용자 정보 조회 */
  async getCurrentUser(): Promise<CurrentUserResponse | null> {
    try {
      // 디버깅: 요청 전 쿠키 상태 확인
      console.log('=== getCurrentUser 요청 전 쿠키 상태 ===');
      this.debugCookies();
      
      const response = await api.get<CurrentUserResponse>('/auth/me');
      console.log('=== getCurrentUser 성공 ===', response.data);
      return response.data;
    } catch (error: any) {
      console.error('현재 사용자 정보 조회 실패:', error);
      
      if (error.response?.status === 401) {
        console.log('=== 401 에러 발생 - 쿠키 상태 확인 ===');
        this.debugCookies();
        
        // 추가 디버깅: 브라우저 개발자 도구에서 확인할 수 있는 정보
        if (typeof document !== 'undefined') {
          console.log('현재 도메인:', window.location.hostname);
          console.log('현재 프로토콜:', window.location.protocol);
          console.log('현재 포트:', window.location.port);
        }
        
        return null;
      }
      throw new Error(error.message || '사용자 정보를 가져올 수 없습니다.');
    }
  }

  /** 사용자 역할 확인 */
  async getUserRole(): Promise<Role | null> {
    try {
      const user = await this.getCurrentUser();
      if (user && user.role) {
        // 문자열을 Role enum으로 변환
        const role = user.role.toUpperCase() as Role;
        console.log('=== 사용자 역할 확인 ===', role);
        return role;
      }
      return null;
    } catch (error) {
      console.error('사용자 역할 확인 실패:', error);
      return null;
    }
  }

  /** ADMIN 권한 확인 */
  async isAdmin(): Promise<boolean> {
    try {
      const role = await this.getUserRole();
      const isAdmin = role === Role.ADMIN;
      console.log('=== ADMIN 권한 확인 ===', isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('ADMIN 권한 확인 실패:', error);
      return false;
    }
  }

  /** USER 권한 확인 */
  async isUser(): Promise<boolean> {
    try {
      const role = await this.getUserRole();
      const isUser = role === Role.USER;
      console.log('=== USER 권한 확인 ===', isUser);
      return isUser;
    } catch (error) {
      console.error('USER 권한 확인 실패:', error);
      return false;
    }
  }

  /** 특정 역할 권한 확인 */
  async hasRole(targetRole: Role): Promise<boolean> {
    try {
      const role = await this.getUserRole();
      const hasRole = role === targetRole;
      console.log(`=== ${targetRole} 권한 확인 ===`, hasRole);
      return hasRole;
    } catch (error) {
      console.error(`${targetRole} 권한 확인 실패:`, error);
      return false;
    }
  }

  /** 로그아웃 */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await api.post<LogoutResponse>('/auth/logout');
      if (typeof document !== 'undefined') {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      }
      return response.data;
    } catch (error: any) {
      console.error('로그아웃 실패:', error);
      if (typeof document !== 'undefined') {
        document.cookie.split(";").forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos) : c;
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
      }
      throw new Error(error.message || '로그아웃에 실패했습니다.');
    }
  }

  /** 프로필 업데이트 */
  async updateProfile(userId: number, profileData: UpdateProfileRequest): Promise<void> {
    try {
      await api.put(`/users/${userId}/profile`, profileData);
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      throw new Error(error.message || '프로필 업데이트에 실패했습니다.');
    }
  }

  /** 비밀번호 변경 */
  async changePassword(userId: number, currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    try {
      const changePasswordData: ChangePasswordRequest = {
        currentPassword,
        newPassword,
        confirmPassword
      };
      await api.put(`/users/${userId}/password`, changePasswordData);
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error);
      throw new Error(error.message || '비밀번호 변경에 실패했습니다.');
    }
  }

  /** 토큰 갱신(선택) */
  async refreshToken(): Promise<void> {
    try {
      await api.post('/auth/refresh');
    } catch (error: any) {
      console.error('토큰 갱신 실패:', error);
      throw new Error(error.message || '토큰 갱신에 실패했습니다.');
    }
  }

  /** 디버그: 쿠키 확인 */
  debugCookies(): Record<string, string> {
    if (typeof document !== 'undefined') {
      console.log('=== 쿠키 디버그 정보 ===');
      console.log('현재 쿠키:', document.cookie);
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      console.log('파싱된 쿠키:', cookies);
      console.log('auth-token 존재:', 'auth-token' in cookies);
      console.log('userRole 존재:', 'userRole' in cookies);
      console.log('주의: HttpOnly 쿠키(auth-token)는 JS로 접근 불가');
      return cookies;
    }
    return {};
  }

  /** 디버그: 쿠키와 me 동시 확인 */
  async debugGetCurrentUser(): Promise<{ user: CurrentUserResponse | null, cookies: Record<string, string> }> {
    const cookies = this.debugCookies();
    try {
      const user = await this.getCurrentUser();
      console.log('=== 사용자 조회 결과 ===', user);
      return { user, cookies };
    } catch (error) {
      console.log('=== 사용자 조회 실패 ===', error);
      return { user: null, cookies };
    }
  }

  /** 디버그: 사용자 역할 정보 전체 확인 */
  async debugUserRoleInfo(): Promise<{ 
    user: CurrentUserResponse | null, 
    role: Role | null, 
    isAdmin: boolean, 
    isUser: boolean,
    cookies: Record<string, string> 
  }> {
    const cookies = this.debugCookies();
    try {
      const user = await this.getCurrentUser();
      const role = await this.getUserRole();
      const isAdmin = await this.isAdmin();
      const isUser = await this.isUser();
      
      console.log('=== 사용자 역할 정보 전체 확인 ===', {
        user,
        role,
        isAdmin,
        isUser,
        cookies
      });
      
      return { user, role, isAdmin, isUser, cookies };
    } catch (error) {
      console.log('=== 사용자 역할 정보 확인 실패 ===', error);
      return { user: null, role: null, isAdmin: false, isUser: false, cookies };
    }
  }
}

export const userService = new UserService();
export type { CurrentUserResponse } from './types';
