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
      const response = await api.get(`/certificates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`인증서 단건 조회 실패 (ID: ${id}):`, error);
      throw error;
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
}

export default CertificateService;
