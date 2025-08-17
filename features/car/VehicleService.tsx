export interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  mileage: number
  country: string
  image?: string
  finalGrade?: string
  finalScore?: number
  registrationDate?: string
  manufactureYear?: number
  fuelType?: string
  displacement?: string
  inspectionNation?: string
  inspectionCenter?: string
  evaluatorNo?: string
  evaluatorName?: string
  inspectionDate?: string
  issueNumber?: string
  issueDate?: string
  validityPeriod?: string
  issuingAuthority?: string
  rentalUse?: boolean
  fuelMod?: boolean
  commercialUse?: boolean
  seatMod?: boolean
  officialUse?: boolean
  mufflerMod?: boolean
  tireStatus?: string
  boltLoose?: boolean
  evaluatorComment?: string
}

export interface CertificateApplication {
  id: string
  vehicleVin: string
  targetCountry: string
  status: "pending" | "processing" | "completed" | "rejected"
  applicationDate: string
  completionDate?: string
  certificateNumber?: string
  applicantId: number
}

export interface Certificate {
  id: string
  certificateNumber: string
  vehicleVin: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  targetCountry: string
  status: "active" | "expired" | "revoked"
  issueDate: string
  expiryDate: string
  issuingAuthority: string
  applicantId: number
  downloadCount: number
  lastDownloaded?: string
}

export interface CertificateStats {
  total: number
  active: number
  expired: number
  revoked: number
  pending: number
  processing: number
  completed: number
  rejected: number
}

export interface CertificateFilters {
  country?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// 차량 서비스 클래스
export class VehicleService {
  // VIN으로 차량 정보 조회
  async getVehicleByVin(vin: string): Promise<Vehicle | null> {
    console.log("🔍 VIN으로 차량 조회:", vin)
    
    // TODO: 실제 API 호출로 대체
    throw new Error("API 연동이 필요합니다. VIN으로 차량을 조회할 수 없습니다.")
  }

  // 모든 차량 목록 조회
  async getAllVehicles(): Promise<Vehicle[]> {
    // TODO: 실제 API 호출로 대체
    throw new Error("API 연동이 필요합니다. 차량 목록을 조회할 수 없습니다.")
  }

  // 국가별 인증서 템플릿 정보 조회
  getCertificateTemplate(country: string) {
    // TODO: 실제 API 호출로 대체
    return null
  }

  // 인증서 발급 신청
  async applyCertificate(
    vehicleVin: string,
    targetCountry: string,
    applicantId: number,
  ): Promise<CertificateApplication> {
    console.log("✅ 인증서 발급 신청:", { vehicleVin, targetCountry, applicantId })
    
    // TODO: 실제 API 호출로 대체
    throw new Error("API 연동이 필요합니다. 인증서 발급 신청을 할 수 없습니다.")
  }

  // 사용자의 인증서 신청 내역 조회
  async getUserApplications(userId: number): Promise<CertificateApplication[]> {
    // TODO: 실제 API 호출로 대체
    throw new Error("API 연동이 필요합니다. 인증서 신청 내역을 조회할 수 없습니다.")
  }

  // 사용자의 인증서 목록 조회
  async getUserCertificates(userId: number, filters?: CertificateFilters): Promise<Certificate[]> {
    // TODO: 실제 API 호출로 대체
    throw new Error("API 연동이 필요합니다. 인증서 목록을 조회할 수 없습니다.")
  }

  // 인증서 통계 조회
  async getCertificateStats(userId: number): Promise<CertificateStats> {
    // TODO: 실제 API 호출로 대체
    throw new Error("API 연동이 필요합니다. 인증서 통계를 조회할 수 없습니다.")
  }

  // 최근 발급 이력 조회
  async getRecentCertificates(userId: number, limit = 5): Promise<Certificate[]> {
    // TODO: 실제 API 호출로 대체
    throw new Error("API 연동이 필요합니다. 최근 발급 이력을 조회할 수 없습니다.")
  }

  // 인증서 다운로드
  async downloadCertificate(certificateId: string): Promise<void> {
    console.log("📥 인증서 다운로드:", certificateId)
    
    // TODO: 실제 API 호출로 대체
    throw new Error("API 연동이 필요합니다. 인증서를 다운로드할 수 없습니다.")
  }
}

// 인증서 템플릿 데이터
export const CERTIFICATE_TEMPLATES = {
  "USA": {
    name: "미국 수출용 인증서",
    description: "미국 수출을 위한 차량 인증서",
    requirements: ["VIN 확인", "배출가스 검사", "안전 검사"],
    processingTime: "7-10 영업일",
    validityPeriod: "6개월"
  },
  "EU": {
    name: "유럽연합 수출용 인증서", 
    description: "EU 수출을 위한 차량 인증서",
    requirements: ["CE 마킹", "배출가스 검사", "안전 기준 검사"],
    processingTime: "10-14 영업일",
    validityPeriod: "12개월"
  },
  "CHINA": {
    name: "중국 수출용 인증서",
    description: "중국 수출을 위한 차량 인증서", 
    requirements: ["CCC 인증", "환경 검사", "품질 검사"],
    processingTime: "14-21 영업일",
    validityPeriod: "6개월"
  },
  "JAPAN": {
    name: "일본 수출용 인증서",
    description: "일본 수출을 위한 차량 인증서",
    requirements: ["JIS 표준", "배출가스 검사", "안전 검사"],
    processingTime: "5-7 영업일", 
    validityPeriod: "12개월"
  }
};

// 싱글톤 인스턴스
export const vehicleService = new VehicleService()
