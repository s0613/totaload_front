import { api } from '@/lib/apiClient';

export interface Certificate {
  id: number;
  certNumber: string;
  issueDate: string;
  expireDate: string;
  inspectDate: string;
  manufacturer: string;
  modelName: string;
  vin: string;
  manufactureYear: number;
  firstRegisterDate: string;
  mileage: number;
  inspectorCode: string;
  inspectorName: string;
  issuedBy: string;
  pdfFilePath: string;
}

export class CertificateService {
  /**
   * 인증서 전체 조회
   */
  static async getAllCertificates(): Promise<Certificate[]> {
    try {
      const response = await api.get('/certificates');
      return response.data;
    } catch (error) {
      console.error('인증서 전체 조회 실패:', error);
      throw error;
    }
  }

  /**
   * ID로 인증서 단건 조회
   */
  static async getCertificateById(id: number): Promise<Certificate> {
    try {
      console.log(`인증서 단건 조회 시작: ID=${id}`);
      console.log('API 설정 정보:', {
        baseURL: api.defaults.baseURL,
        timeout: api.defaults.timeout,
        withCredentials: api.defaults.withCredentials
      });
      
      if (!id || isNaN(id)) {
        throw new Error('유효하지 않은 인증서 ID입니다.');
      }

      const url = `/certificates/${id}`;
      console.log(`요청 URL: ${url}`);
      console.log(`전체 URL: ${api.defaults.baseURL}${url}`);
      
      const response = await api.get(url);
      console.log(`인증서 단건 조회 성공: ID=${id}`, {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      // 응답 데이터 검증
      if (!response.data) {
        throw new Error('인증서 데이터가 없습니다.');
      }

      // 필수 필드 검증
      const requiredFields = ['id', 'certNumber', 'issueDate', 'expireDate'];
      const missingFields = requiredFields.filter(field => !response.data[field]);
      
      if (missingFields.length > 0) {
        console.warn(`인증서 데이터에 누락된 필드: ${missingFields.join(', ')}`);
      }

      return response.data;
    } catch (error) {
      console.error(`인증서 단건 조회 실패 (ID: ${id}):`, error);
      
      // 에러 타입별 처리
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        
        console.error('API 에러 상세 정보:', {
          response: apiError.response,
          request: apiError.request,
          message: apiError.message,
          code: apiError.code
        });
        
        if (apiError.response?.status === 404) {
          throw new Error(`ID ${id}인 인증서를 찾을 수 없습니다.`);
        } else if (apiError.response?.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (apiError.response?.status === 403) {
          throw new Error('해당 인증서에 접근할 권한이 없습니다.');
        } else if (apiError.response?.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        } else if (apiError.message) {
          throw new Error(apiError.message);
        }
      }
      
      throw new Error('인증서 조회 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 인증서 PDF 다운로드
   */
  static async downloadCertificatePdf(pdfFilePath: string, fileName?: string): Promise<void> {
    try {
      const response = await api.get(pdfFilePath, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'certificate.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('인증서 PDF 다운로드 실패:', error);
      throw error;
    }
  }

  /**
   * 인증서 검색 (키워드 기반)
   */
  static async searchCertificates(keyword: string): Promise<Certificate[]> {
    try {
      const response = await api.get(`/certificates/search?q=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      console.error('인증서 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 발급기관별 인증서 조회
   */
  static async getCertificatesByIssuer(issuer: string): Promise<Certificate[]> {
    try {
      const response = await api.get(`/certificates/issuer/${encodeURIComponent(issuer)}`);
      return response.data;
    } catch (error) {
      console.error('발급기관별 인증서 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 인증서 상태 확인 (유효/만료)
   */
  static isCertificateValid(certificate: Certificate): boolean {
    const now = new Date();
    const expireDate = new Date(certificate.expireDate);
    return expireDate > now;
  }

  /**
   * 인증서 만료일까지 남은 일수 계산
   */
  static getDaysUntilExpiry(certificate: Certificate): number {
    const now = new Date();
    const expireDate = new Date(certificate.expireDate);
    const diffTime = expireDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export default CertificateService;
