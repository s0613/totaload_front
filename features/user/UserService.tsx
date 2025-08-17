import { api } from '@/lib/apiClient';
import { 
  SignupRequest, 
  SignupResponse, 
  LoginRequest, 
  LoginResponse, 
  CurrentUserResponse,
  LogoutResponse 
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
  }

  /** Google OAuth 로그인 시작 */
  startGoogleOAuth(): void {
    try {
      console.log('=== Google OAuth 시작 ===');
      console.log('현재 도메인:', window.location.hostname);
      console.log('현재 프로토콜:', window.location.protocol);
      console.log('현재 포트:', window.location.port);
      
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace(/\/+$/, '');
      // 서버 oauth2Login().authorizationEndpoint().baseUri("/oauth2/authorization")
      // -> 시작 URL은 보통 /oauth2/authorization/google
      const serverBase = apiBase.replace(/\/api$/, '');
      const oauthUrl = `${serverBase}/oauth2/authorization/google`;
      
      console.log('OAuth URL:', oauthUrl);
      console.log('API Base:', apiBase);
      console.log('Server Base:', serverBase);
      
      window.location.href = oauthUrl;
    } catch (error) {
      console.error("Google 로그인 시작 실패:", error);
      // toast.error("Google 로그인 시작에 실패했습니다. 잠시 후 다시 시도해주세요."); // toast 라이브러리가 없으므로 주석 처리
      // setIsLoading(false); // setIsLoading이 정의되지 않아 주석 처리
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
}

export const userService = new UserService();
export type { CurrentUserResponse } from './types';
