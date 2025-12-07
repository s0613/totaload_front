import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 개발 모드에서는 항상 동일 오리진 프록시(`/api`)를 강제해
// 303 리다이렉트로 인한 교차 오리진 CORS 차단을 예방
const IS_DEV = process.env.NODE_ENV === 'development';
const CONFIGURED_API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL = IS_DEV ? '/api' : (CONFIGURED_API_URL || '/api');

console.log('API 설정:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment: IS_DEV,
});

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // 쿠키 전송
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // 백엔드가 XHR 요청임을 인지해 303 리다이렉트 대신 JSON 응답을 반환할 수 있도록 힌트
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use(
  (config) => {
    // localStorage에서 JWT 토큰을 가져와 Authorization 헤더에 추가
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials,
    });

    return config;
  },
  (error) => {
    console.error('요청 에러:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API 응답: ${response.status} ${response.config.url}`, {
      data: response.data,
      headers: response.headers,
      cookies: response.headers['set-cookie'],
    });
    
    // 응답 헤더에서 쿠키 정보 확인
    if (response.headers['set-cookie']) {
      console.log('응답에서 받은 쿠키:', response.headers['set-cookie']);
    }
    
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url || '');

    // 더 자세한 에러 정보 로깅
    console.group('🚨 API 응답 에러');
    console.error('기본 정보:', {
      status,
      statusText: error.response?.statusText,
      url,
      method: error.config?.method?.toUpperCase(),
      baseURL: error.config?.baseURL,
    });
    console.error('에러 메시지:', error.message);
    console.error('응답 데이터:', error.response?.data);
    console.error('요청 헤더:', error.config?.headers);
    console.error('응답 헤더:', error.response?.headers);
    console.error('전체 에러 객체:', error);
    console.groupEnd();

    // 401 시 전역 리다이렉트 (인증 엔드포인트는 예외)
    if (status === 401) {
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/me') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout');

      if (!isAuthEndpoint) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      '알 수 없는 오류가 발생했습니다.';

    return Promise.reject(new Error(errorMessage));
  }
);

// 인증서 관련 API 함수들
export const certificateAPI = {
  /**
   * 인증서 전체 조회
   */
  getAllCertificates: () => api.get('/certificates'),
  
  /**
   * ID로 인증서 단건 조회
   */
  getCertificateById: (id: number) => api.get(`/certificates/${id}`),
  
  /**
   * 인증서 PDF 다운로드
   */
  downloadCertificatePdf: (pdfFilePath: string) => 
    api.get(pdfFilePath, { responseType: 'blob' }),
};

export default api;
