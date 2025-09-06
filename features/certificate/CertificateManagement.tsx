"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import CertificateService, { type Certificate } from "@/features/certificate/CertificateService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Search,
  FileText,
  Eye,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

// PDF 뷰어 모달 컴포넌트
interface PDFViewerModalProps {
  certificate: Certificate
  onClose: () => void
}

function PDFViewerModal({ certificate, onClose }: PDFViewerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-semibold truncate">인증서 미리보기</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{certificate.certNumber}</p>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={() => {
                toast.success("인증서가 다운로드되었습니다.")
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">다운로드</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* PDF 뷰어 영역 */}
        <div className="h-[60vh] sm:h-[70vh] bg-gray-100 flex items-center justify-center p-4">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">PDF 미리보기</h4>
            <p className="text-sm text-gray-500 mb-4">실제 환경에서는 여기에 PDF 뷰어가 표시됩니다.</p>
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md mx-auto shadow-sm">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">인증서 번호:</span>
                  <span className="font-medium truncate ml-2">{certificate.certNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">차량:</span>
                  <span className="font-medium truncate ml-2">
                    {certificate.manufacturer} {certificate.modelName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">발급일:</span>
                  <span className="font-medium truncate ml-2">{certificate.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">만료일:</span>
                  <span className="font-medium truncate ml-2">{certificate.expireDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">발급기관:</span>
                  <span className="font-medium text-xs truncate ml-2">{certificate.issuedBy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 재발급 확인 모달
interface ReissueModalProps {
  certificate: Certificate
  onClose: () => void
  onConfirm: () => void
}

function ReissueModal({ certificate, onClose, onConfirm }: ReissueModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await CertificateService.reissueCertificate(certificate.id)
      onConfirm()
      toast.success("인증서 재발급 신청이 완료되었습니다.")
      onClose()
    } catch (error) {
      console.error("재발급 신청 실패:", error)
      toast.error(error instanceof Error ? error.message : "재발급 신청에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-4 sm:p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">인증서 재발급</h3>
          <p className="text-gray-600 text-sm">기존 인증서를 무효화하고 새로운 인증서를 발급합니다.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">인증서 번호:</span>
              <span className="font-medium truncate ml-2">{certificate.certNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">차량:</span>
              <span className="font-medium truncate ml-2">
                {certificate.manufacturer} {certificate.modelName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">발급일:</span>
              <span className="font-medium truncate ml-2">{certificate.issueDate}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium mb-1">주의사항</p>
              <ul className="space-y-1">
                <li>• 기존 인증서는 즉시 무효화됩니다</li>
                <li>• 재발급 처리에 3-5 영업일이 소요됩니다</li>
                <li>• 재발급 수수료가 부과될 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isLoading}>
            취소
          </Button>
          <Button onClick={handleConfirm} className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">처리 중...</span>
                <span className="sm:hidden">처리중</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">재발급 신청</span>
                <span className="sm:hidden">재발급</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// 취소 확인 모달
interface RevokeModalProps {
  certificate: Certificate
  onClose: () => void
  onConfirm: () => void
}

function RevokeModal({ certificate, onClose, onConfirm }: RevokeModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState("")

  const handleConfirm = async () => {
    if (!reason.trim()) {
      toast.error("취소 사유를 입력해주세요.")
      return
    }

    setIsLoading(true)
    try {
      await CertificateService.revokeCertificate(certificate.id, reason)
      onConfirm()
      toast.success("인증서가 취소되었습니다.")
      onClose()
    } catch (error) {
      console.error("인증서 취소 실패:", error)
      toast.error(error instanceof Error ? error.message : "인증서 취소에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-4 sm:p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">인증서 취소</h3>
          <p className="text-gray-600 text-sm">인증서를 영구적으로 취소합니다. 이 작업은 되돌릴 수 없습니다.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">인증서 번호:</span>
              <span className="font-medium truncate ml-2">{certificate.certNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">차량:</span>
              <span className="font-medium truncate ml-2">
                {certificate.manufacturer} {certificate.modelName}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            취소 사유 *
          </label>
          <textarea
            id="reason"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="인증서를 취소하는 사유를 입력해주세요..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-red-800">
              <p className="font-medium mb-1">경고</p>
              <ul className="space-y-1">
                <li>• 취소된 인증서는 복구할 수 없습니다</li>
                <li>• 모든 관련 서비스가 즉시 중단됩니다</li>
                <li>• 새로운 인증서가 필요한 경우 재신청해야 합니다</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isLoading}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleConfirm} className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span className="hidden sm:inline">처리 중...</span>
                <span className="sm:hidden">처리중</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">인증서 취소</span>
                <span className="sm:hidden">취소</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CertificatesPage() {
  const { isLoggedIn, user, isHydrated } = useAuthStore()
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<any>({ country: "", status: "", dateFrom: "", dateTo: "" })

  // 모달 상태
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const [showReissueModal, setShowReissueModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)

  useEffect(() => {
    // 인증 상태가 하이드레이션된 후에만 체크
    if (isHydrated && !isLoggedIn) {
      router.push("/login")
      return
    }

    // 인증 상태가 확인된 후에만 데이터 로드
    if (isHydrated && isLoggedIn) {
      loadCertificates()
    }
  }, [isHydrated, isLoggedIn, router])

  useEffect(() => {
    if (user?.userId) {
      loadCertificates()
    }
  }, [user])

  // 검색 및 필터링 로직
  const filteredCertificates = certificates.filter((certificate) => {
    // 검색어 필터
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = 
        certificate.certNumber.toLowerCase().includes(searchTerm) ||
        certificate.vin.toLowerCase().includes(searchTerm) ||
        certificate.manufacturer.toLowerCase().includes(searchTerm) ||
        certificate.modelName.toLowerCase().includes(searchTerm)
      
      if (!matchesSearch) return false
    }

    // 상태 필터
    if (filters.status) {
      const isValid = CertificateService.isCertificateValid(certificate)
      if (filters.status === "active" && !isValid) return false
      if (filters.status === "expired" && isValid) return false
      if (filters.status === "revoked") return false // 취소된 인증서는 별도 처리 필요
    }

    // 국가 필터
    if (filters.country && certificate.country !== filters.country) {
      return false
    }

    return true
  })

  const loadCertificates = async () => {
    if (!user?.userId) return

    try {
      setIsLoading(true)
      // 로그인된 사용자가 발급받은 인증서 조회
      const certificatesData = await CertificateService.getMyCertificates()
      setCertificates(certificatesData)
    } catch (error) {
      console.error("인증서 목록 로드 실패:", error)
      toast.error("인증서 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (certificateId: number, certNumber: string) => {
    try {
      await CertificateService.openCertificatePdf(`/certificates/${certificateId}/pdf`)
      toast.success(`인증서 ${certNumber}가 열렸습니다.`)
    } catch (error) {
      console.error("인증서 열기 실패:", error)
      toast.error("인증서를 열 수 없습니다.")
    }
  }

  const handleViewPDF = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setShowPDFViewer(true)
  }

  const handleReissue = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setShowReissueModal(true)
  }

  const handleRevoke = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setShowRevokeModal(true)
  }

  const handleReissueConfirm = () => {
    loadCertificates()
  }

  const handleRevokeConfirm = () => {
    loadCertificates()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-600 text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">활성</span>
            <span className="sm:hidden">활성</span>
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">만료</span>
            <span className="sm:hidden">만료</span>
          </Badge>
        )
      case "revoked":
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">취소</span>
            <span className="sm:hidden">취소</span>
          </Badge>
        )
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }


  if (!isLoggedIn) {
    return null
  }

  return (
    <main className="flex-1 p-3 sm:p-6">
      {/* 헤더 */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">인증서 관리</h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* 검색 및 필터 섹션 */}
          <div className="bg-white border rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* 검색 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="차대번호, 인증서 번호 등"
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 text-sm"
                />
              </div>

              {/* 전체 상태 필터 */}
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}
              >
                <SelectTrigger className="w-full sm:w-40 text-sm">
                  <SelectValue placeholder="전체 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="expired">만료</SelectItem>
                  <SelectItem value="revoked">취소</SelectItem>
                </SelectContent>
              </Select>

              {/* 국가 필터 */}
              <Select
                value={filters.country || "all"}
                onValueChange={(value) => setFilters({ ...filters, country: value === "all" ? "" : value })}
              >
                <SelectTrigger className="w-full sm:w-40 text-sm">
                  <SelectValue placeholder="국가" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">국가</SelectItem>
                  <SelectItem value="Republic of Korea">한국</SelectItem>
                  <SelectItem value="Japan">일본</SelectItem>
                  <SelectItem value="Germany">독일</SelectItem>
                  <SelectItem value="USA">미국</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 인증서 테이블 */}
          <div className="bg-white border rounded-lg overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="border-b">
              <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-50">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  인증서번호
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  차량정보
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  국가
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  발급일
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  만료일
                </div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </div>
              </div>
            </div>

            {/* 테이블 내용 */}
            {filteredCertificates.length === 0 ? (
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">발급받은 인증서가 없습니다</p>
                  <p className="text-sm text-gray-400 mt-2">새로운 인증서를 신청해보세요</p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {filteredCertificates.map((certificate) => (
                  <div key={certificate.id} className="grid grid-cols-7 gap-4 px-4 py-3 hover:bg-gray-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {certificate.certNumber}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {certificate.manufacturer} {certificate.modelName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">VIN: {certificate.vin}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 truncate">{certificate.country}</p>
                    </div>
                    <div className="min-w-0">
                      {getStatusBadge(CertificateService.isCertificateValid(certificate) ? "active" : "expired")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900">{certificate.issueDate}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900">{certificate.expireDate}</p>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPDF(certificate)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(certificate.id, certificate.certNumber)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {CertificateService.isCertificateValid(certificate) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReissue(certificate)}
                              className="h-8 w-8 p-0"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevoke(certificate)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 모달들 */}
      {showPDFViewer && selectedCertificate && (
        <PDFViewerModal
          certificate={selectedCertificate}
          onClose={() => {
            setShowPDFViewer(false)
            setSelectedCertificate(null)
          }}
        />
      )}

      {showReissueModal && selectedCertificate && (
        <ReissueModal
          certificate={selectedCertificate}
          onClose={() => {
            setShowReissueModal(false)
            setSelectedCertificate(null)
          }}
          onConfirm={handleReissueConfirm}
        />
      )}

      {showRevokeModal && selectedCertificate && (
        <RevokeModal
          certificate={selectedCertificate}
          onClose={() => {
            setShowRevokeModal(false)
            setSelectedCertificate(null)
          }}
          onConfirm={handleRevokeConfirm}
        />
      )}
    </main>
  )
}
