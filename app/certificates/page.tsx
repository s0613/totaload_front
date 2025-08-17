"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import {
  vehicleService,
  type Certificate,
  type CertificateStats,
  type CertificateFilters,
} from "@/features/car/VehicleService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Search,
  Filter,
  Calendar,
  FileText,
  TrendingUp,
  Eye,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/common/Sidebar"

// PDF 뷰어 모달 컴포넌트
interface PDFViewerModalProps {
  certificate: Certificate
  onClose: () => void
}

function PDFViewerModal({ certificate, onClose }: PDFViewerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h3 className="text-lg font-semibold">인증서 미리보기</h3>
            <p className="text-sm text-gray-600">{certificate.certificateNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // 다운로드 로직
                toast.success("인증서가 다운로드되었습니다.")
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              다운로드
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* PDF 뷰어 영역 */}
        <div className="h-[70vh] bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">PDF 미리보기</h4>
            <p className="text-gray-500 mb-4">실제 환경에서는 여기에 PDF 뷰어가 표시됩니다.</p>
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-sm">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">인증서 번호:</span>
                  <span className="font-medium">{certificate.certificateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">차량:</span>
                  <span className="font-medium">
                    {certificate.vehicleMake} {certificate.vehicleModel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">발급일:</span>
                  <span className="font-medium">{certificate.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">만료일:</span>
                  <span className="font-medium">{certificate.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">발급기관:</span>
                  <span className="font-medium text-xs">{certificate.issuingAuthority}</span>
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
      await new Promise((resolve) => setTimeout(resolve, 2000)) // 더미 지연
      onConfirm()
      toast.success("인증서 재발급 신청이 완료되었습니다.")
      onClose()
    } catch (error) {
      toast.error("재발급 신청에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">인증서 재발급</h3>
          <p className="text-gray-600 text-sm">기존 인증서를 무효화하고 새로운 인증서를 발급합니다.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">인증서 번호:</span>
              <span className="font-medium">{certificate.certificateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">차량:</span>
              <span className="font-medium">
                {certificate.vehicleMake} {certificate.vehicleModel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">발급일:</span>
              <span className="font-medium">{certificate.issueDate}</span>
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
                처리 중...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                재발급 신청
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
      await new Promise((resolve) => setTimeout(resolve, 2000)) // 더미 지연
      onConfirm()
      toast.success("인증서가 취소되었습니다.")
      onClose()
    } catch (error) {
      toast.error("인증서 취소에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">인증서 취소</h3>
          <p className="text-gray-600 text-sm">인증서를 영구적으로 취소합니다. 이 작업은 되돌릴 수 없습니다.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">인증서 번호:</span>
              <span className="font-medium">{certificate.certificateNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">차량:</span>
              <span className="font-medium">
                {certificate.vehicleMake} {certificate.vehicleModel}
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
                처리 중...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                인증서 취소
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function CertificatesPage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([])
  const [stats, setStats] = useState<CertificateStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<CertificateFilters>({ country: "", status: "", dateFrom: "", dateTo: "" })

  // 모달 상태
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const [showReissueModal, setShowReissueModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    loadData()
  }, [isLoggedIn, router, user])

  useEffect(() => {
    if (user?.userId) {
      loadCertificates()
    }
  }, [filters, user])

  const loadData = async () => {
    if (!user?.userId) return

    try {
      setIsLoading(true)
      const [certificatesData, statsData, recentData] = await Promise.all([
        vehicleService.getUserCertificates(user.userId, filters),
        vehicleService.getCertificateStats(user.userId),
        vehicleService.getRecentCertificates(user.userId, 5),
      ])

      setCertificates(certificatesData)
      setStats(statsData)
      setRecentCertificates(recentData)
    } catch (error) {
      console.error("데이터 로드 실패:", error)
      toast.error("데이터를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const loadCertificates = async () => {
    if (!user?.userId) return

    try {
      const certificatesData = await vehicleService.getUserCertificates(user.userId, filters)
      setCertificates(certificatesData)
    } catch (error) {
      console.error("인증서 목록 로드 실패:", error)
      toast.error("인증서 목록을 불러오는데 실패했습니다.")
    }
  }

  const handleDownload = async (certificateId: string, certificateNumber: string) => {
    try {
      await vehicleService.downloadCertificate(certificateId)
      toast.success(`인증서 ${certificateNumber}가 다운로드되었습니다.`)
      // 다운로드 후 데이터 새로고침
      loadData()
    } catch (error) {
      console.error("인증서 다운로드 실패:", error)
      toast.error("인증서 다운로드에 실패했습니다.")
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
    // 재발급 로직 (실제로는 API 호출)
    loadData() // 데이터 새로고침
  }

  const handleRevokeConfirm = () => {
    // 취소 로직 (실제로는 API 호출)
    loadData() // 데이터 새로고침
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            활성
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            만료
          </Badge>
        )
      case "revoked":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            취소
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const clearFilters = () => {
    setFilters({ country: "", status: "", dateFrom: "", dateTo: "" })
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">인증서 관리</h1>
          <p className="text-gray-600">발급된 인증서를 관리하고 다운로드하세요</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI 카드 */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">총 인증서</CardTitle>
                    <Award className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">발급된 인증서</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">활성 인증서</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <p className="text-xs text-muted-foreground">사용 가능한 인증서</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">만료된 인증서</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.expired}</div>
                    <p className="text-xs text-muted-foreground">갱신이 필요한 인증서</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">처리 중</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{stats.pending + stats.processing}</div>
                    <p className="text-xs text-muted-foreground">대기 + 처리 중</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 최근 발급 이력 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  최근 발급 이력
                </CardTitle>
                <CardDescription>최근에 발급된 인증서 목록입니다</CardDescription>
              </CardHeader>
              <CardContent>
                {recentCertificates.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">최근 발급된 인증서가 없습니다.</p>
                ) : (
                  <div className="space-y-4">
                    {recentCertificates.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Award className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{cert.certificateNumber}</p>
                            <p className="text-sm text-gray-600">
                              {cert.vehicleMake} {cert.vehicleModel} ({cert.vehicleYear}) - {cert.targetCountry}
                            </p>
                            <p className="text-xs text-gray-500">발급일: {cert.issueDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(cert.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(cert.id, cert.certificateNumber)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            다운로드
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 필터 및 검색 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  인증서 목록
                </CardTitle>
                <CardDescription>필터를 사용하여 원하는 인증서를 찾아보세요</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  {/* 검색 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="인증서 번호, VIN 검색..."
                      value={filters.search || ""}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10"
                    />
                  </div>

                  {/* 국가 필터 */}
                  <Select
                    value={filters.country || "all"}
                    onValueChange={(value) => setFilters({ ...filters, country: value === "all" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="국가 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 국가</SelectItem>
                      <SelectItem value="Republic of Korea">한국</SelectItem>
                      <SelectItem value="Japan">일본</SelectItem>
                      <SelectItem value="Germany">독일</SelectItem>
                      <SelectItem value="USA">미국</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 상태 필터 */}
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 상태</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="expired">만료</SelectItem>
                      <SelectItem value="revoked">취소</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 시작 날짜 */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="date"
                      placeholder="시작 날짜"
                      value={filters.dateFrom || ""}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="pl-10"
                    />
                  </div>

                  {/* 종료 날짜 */}
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="date"
                      placeholder="종료 날짜"
                      value={filters.dateTo || ""}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">총 {certificates.length}개의 인증서가 있습니다.</p>
                  <Button variant="outline" onClick={clearFilters} size="sm">
                    필터 초기화
                  </Button>
                </div>

                {/* 인증서 테이블 */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            인증서 번호
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            차량 정보
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            국가
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            상태
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            발급일
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            만료일
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            다운로드
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            작업
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {certificates.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                              조건에 맞는 인증서가 없습니다.
                            </td>
                          </tr>
                        ) : (
                          certificates.map((cert) => (
                            <tr key={cert.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{cert.certificateNumber}</div>
                                <div className="text-sm text-gray-500 font-mono">{cert.vehicleVin}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {cert.vehicleMake} {cert.vehicleModel}
                                </div>
                                <div className="text-sm text-gray-500">{cert.vehicleYear}년</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{cert.targetCountry}</div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(cert.status)}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{cert.issueDate}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{cert.expiryDate}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                {cert.downloadCount}회
                                {cert.lastDownloaded && <div className="text-xs">최근: {cert.lastDownloaded}</div>}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewPDF(cert)}
                                    title="PDF 미리보기"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownload(cert.id, cert.certificateNumber)}
                                    title="다운로드"
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  {cert.status === "active" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleReissue(cert)}
                                        title="재발급"
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        <RefreshCw className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRevoke(cert)}
                                        title="취소"
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
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
    </div>
  )
}
