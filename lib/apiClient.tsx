import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Next.js 프록시 설정을 사용하므로 상대 경로 사용
const API_BASE_URL = '/api';

console.log('API 설정:', {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === 'development'
});

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // 쿠키 전송
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials,
    });
    
    // 쿠키 디버깅 정보 추가
    if (typeof document !== 'undefined') {
      console.log('요청 시 쿠키 상태:', document.cookie);
    }
    
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

    console.error('응답 에러:', {
      status,
      data: error.response?.data,
      url,
      message: error.message,
      headers: error.response?.headers,
      cookies: error.response?.headers?.['set-cookie'],
    });

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
