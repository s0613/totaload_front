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
  country: string;
  pdfFilePath: string;
  issuerUserIds?: number[]; // 발급자 ID 리스트 추가
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
   * 인증서 발급 요청 - 발급자 ID가 리스트에 자동 추가됨
   */
  static async issueCertificateRequest(id: number): Promise<Certificate> {
    try {
      console.log(`인증서 발급 요청 시작: ID=${id}`);
      
      const response = await api.post(`/certificates/${id}/issue`);
      console.log(`인증서 발급 완료: ID=${id}`, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`인증서 발급 실패 (ID: ${id}):`, error);
      
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        
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
        }
      }
      
      throw new Error('인증서 발급 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 특정 인증서의 발급자 ID 리스트 조회
   */
  static async getCertificateIssuers(certificateId: number): Promise<number[]> {
    try {
      console.log(`인증서 발급자 조회 시작: 인증서 ID=${certificateId}`);
      
      const response = await api.get(`/certificates/${certificateId}/issuers`);
      console.log(`인증서 발급자 조회 완료: 인증서 ID=${certificateId}`, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`인증서 발급자 조회 실패 (인증서 ID: ${certificateId}):`, error);
      
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        
        if (apiError.response?.status === 404) {
          throw new Error(`ID ${certificateId}인 인증서를 찾을 수 없습니다.`);
        } else if (apiError.response?.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (apiError.response?.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        }
      }
      
      throw new Error('인증서 발급자 조회 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 현재 로그인된 사용자가 발급한 인증서 조회
   */
  static async getMyIssuedCertificates(): Promise<Certificate[]> {
    try {
      console.log('내가 발급한 인증서 조회 시작');
      
      const response = await api.get('/certificates/my-issued');
      console.log(`내가 발급한 인증서 조회 완료: 인증서 수=${response.data.length}`);
      
      return response.data;
    } catch (error) {
      console.error('내가 발급한 인증서 조회 실패:', error);
      
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        
        if (apiError.response?.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (apiError.response?.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        }
      }
      
      throw new Error('내가 발급한 인증서 조회 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 현재 로그인된 사용자가 발급받은 인증서 조회
   * 임시로 발급한 인증서 API를 사용 (서버에 발급받은 인증서 API가 없음)
   */
  static async getMyCertificates(): Promise<Certificate[]> {
    try {
      console.log('내가 발급받은 인증서 조회 시작 (임시로 발급한 인증서 사용)');
      
      const response = await api.get('/certificates/my-issued');
      console.log(`내가 발급받은 인증서 조회 완료: 인증서 수=${response.data.length}`);
      
      return response.data;
    } catch (error) {
      console.error('내가 발급받은 인증서 조회 실패:', error);
      
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        
        if (apiError.response?.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (apiError.response?.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        }
      }
      
      throw new Error('내가 발급받은 인증서 조회 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 인증서 PDF 열기 (새 탭에서)
   */
  static async openCertificatePdf(pdfFilePath: string): Promise<void> {
    try {
      // pdfFilePath가 상대 경로인 경우 절대 경로로 변환
      let pdfUrl = pdfFilePath;
      
      if (!pdfFilePath.startsWith('http://') && !pdfFilePath.startsWith('https://')) {
        // 상대 경로인 경우 API 기본 URL과 결합
        const baseURL = api.defaults.baseURL || '';
        pdfUrl = `${baseURL}${pdfFilePath.startsWith('/') ? pdfFilePath : `/${pdfFilePath}`}`;
      }
      
      console.log('PDF 열기 URL:', pdfUrl);
      
      // 새 탭에서 PDF 열기
      window.open(pdfUrl, '_blank');
      
      console.log('PDF 새 탭에서 열기 완료');
    } catch (error) {
      console.error('인증서 PDF 열기 실패:', error);
      
      // 에러 타입별 처리
      if (error instanceof Error) {
        throw new Error(`PDF 열기 실패: ${error.message}`);
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        if (apiError.response?.status === 404) {
          throw new Error('PDF 파일을 찾을 수 없습니다.');
        } else if (apiError.response?.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (apiError.response?.status === 403) {
          throw new Error('해당 PDF 파일에 접근할 권한이 없습니다.');
        } else if (apiError.response?.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      throw new Error('PDF 열기 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 인증서 검색 (키워드 기반)
   */
  static async searchCertificates(keyword: string, options?: {
    country?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Certificate[]> {
    try {
      console.log(`[CertificateService] 인증서 검색 시작:`, {
        keyword,
        options,
        timestamp: new Date().toISOString()
      });
      
      // 검색 파라미터 구성
      const params = new URLSearchParams();
      if (keyword.trim()) {
        params.append('q', keyword.trim());
      }
      if (options?.country) {
        params.append('country', options.country);
      }
      if (options?.status) {
        params.append('status', options.status);
      }
      if (options?.dateFrom) {
        params.append('dateFrom', options.dateFrom);
      }
      if (options?.dateTo) {
        params.append('dateTo', options.dateTo);
      }

      const url = `/certificates/search${params.toString() ? `?${params.toString()}` : ''}`;
      console.log(`[CertificateService] 검색 URL: ${api.defaults.baseURL}${url}`);
      
      const response = await api.get(url);
      console.log(`[CertificateService] 검색 성공:`, {
        resultCount: response.data?.length || 0,
        status: response.status,
        statusText: response.statusText
      });
      
      return response.data || [];
    } catch (error) {
      console.info('[CertificateService] 서버 검색 실패 - 로컬 검색으로 폴백');
      
      if (error instanceof Error) {
        // 일반적인 에러 메시지만 기록
        console.info(`[CertificateService] 에러: ${error.message}`);
        throw new Error('서버 검색 불가');
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        const status = apiError.response?.status;
        
        console.info(`[CertificateService] API 에러: ${status} ${apiError.response?.statusText || ''}`);
        
        if (status === 400) {
          throw new Error('잘못된 검색 조건');
        } else if (status === 401) {
          throw new Error('인증 필요');
        } else if (status === 404) {
          throw new Error('검색 API 미구현');
        } else if (status >= 500) {
          throw new Error('서버 내부 오류');
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        }
      }
      
      throw new Error('서버 검색 불가');
    }
  }

  /**
   * 고급 검색 (여러 조건)
   */
  static async advancedSearch(params: {
    certNumber?: string;
    manufacturer?: string;
    modelName?: string;
    vin?: string;
    country?: string;
    status?: string;
    issueDateFrom?: string;
    issueDateTo?: string;
    expireDateFrom?: string;
    expireDateTo?: string;
    inspectorName?: string;
  }): Promise<Certificate[]> {
    try {
      console.log('고급 검색 시작:', params);
      
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value && value.trim()) {
          searchParams.append(key, value.trim());
        }
      });

      const url = `/certificates/advanced-search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      console.log(`고급 검색 URL: ${url}`);
      
      const response = await api.get(url);
      console.log(`고급 검색 완료: ${response.data.length}개 결과`);
      
      return response.data;
    } catch (error) {
      console.error('고급 검색 실패:', error);
      
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        
        if (apiError.response?.status === 400) {
          throw new Error('검색 조건을 확인해주세요.');
        } else if (apiError.response?.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (apiError.response?.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        }
      }
      
      throw new Error('고급 검색 중 알 수 없는 오류가 발생했습니다.');
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

  /**
   * 인증서 재발급 요청
   */
  static async reissueCertificate(certificateId: number): Promise<Certificate> {
    try {
      console.log(`인증서 재발급 요청 시작: ID=${certificateId}`);
      
      const response = await api.post(`/certificates/${certificateId}/reissue`);
      console.log(`인증서 재발급 완료: ID=${certificateId}`, response.data);
      
      return response.data;
    } catch (error) {
      console.error(`인증서 재발급 실패 (ID: ${certificateId}):`, error);
      
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        
        if (apiError.response?.status === 404) {
          throw new Error(`ID ${certificateId}인 인증서를 찾을 수 없습니다.`);
        } else if (apiError.response?.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (apiError.response?.status === 403) {
          throw new Error('해당 인증서에 접근할 권한이 없습니다.');
        } else if (apiError.response?.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        }
      }
      
      throw new Error('인증서 재발급 중 알 수 없는 오류가 발생했습니다.');
    }
  }

  /**
   * 인증서 취소 요청
   */
  static async revokeCertificate(certificateId: number, reason: string): Promise<void> {
    try {
      console.log(`인증서 취소 요청 시작: ID=${certificateId}, 사유=${reason}`);
      
      const response = await api.post(`/certificates/${certificateId}/revoke`, {
        reason: reason
      });
      console.log(`인증서 취소 완료: ID=${certificateId}`, response.data);
      
    } catch (error) {
      console.error(`인증서 취소 실패 (ID: ${certificateId}):`, error);
      
      if (error instanceof Error) {
        throw error;
      } else if (typeof error === 'object' && error !== null) {
        const apiError = error as any;
        
        if (apiError.response?.status === 404) {
          throw new Error(`ID ${certificateId}인 인증서를 찾을 수 없습니다.`);
        } else if (apiError.response?.status === 401) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (apiError.response?.status === 403) {
          throw new Error('해당 인증서에 접근할 권한이 없습니다.');
        } else if (apiError.response?.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (apiError.response?.data?.message) {
          throw new Error(apiError.response.data.message);
        }
      }
      
      throw new Error('인증서 취소 중 알 수 없는 오류가 발생했습니다.');
    }
  }
}

export default CertificateService;
