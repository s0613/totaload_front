"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { ArrowLeft, Calendar, CreditCard, Download, Eye, Filter, Search, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

interface PaymentHistory {
  id: string
  orderId: string
  amount: number
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'PENDING'
  paymentMethod: string
  createdAt: string
  certificateId?: string
  manufacturer?: string
  modelName?: string
  orderName: string
  customerName: string
  customerEmail: string
}

export default function PaymentHistoryPage() {
  const { isLoggedIn, isHydrated, user } = useAuthStore()
  const router = useRouter()
  const [payments, setPayments] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [filteredPayments, setFilteredPayments] = useState<PaymentHistory[]>([])

  useEffect(() => {
    // 인증 상태가 하이드레이션된 후에만 체크
    if (isHydrated && !isLoggedIn) {
      router.push("/login")
      return
    }

    if (isHydrated && isLoggedIn) {
      fetchPaymentHistory()
    }
  }, [isHydrated, isLoggedIn, router])

  useEffect(() => {
    // 검색 및 필터링 로직
    let filtered = payments

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.orderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.modelName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 상태 필터링
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    // 결제 방법 필터링
    if (methodFilter !== "all") {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter)
    }

    setFilteredPayments(filtered)
  }, [payments, searchTerm, statusFilter, methodFilter])

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true)
      
      // 실제 API 호출 대신 목업 데이터 사용
      const mockPayments: PaymentHistory[] = [
        {
          id: "1",
          orderId: "order_1703123456789_abc123def",
          amount: 70000,
          status: 'SUCCESS',
          paymentMethod: '카드',
          createdAt: '2024-01-15T10:30:00Z',
          certificateId: '123',
          manufacturer: '현대',
          modelName: '아반떼',
          orderName: '현대 아반떼 인증서 발급',
          customerName: user?.name || '김토스',
          customerEmail: user?.email || 'customer@example.com'
        },
        {
          id: "2",
          orderId: "order_1703123456790_def456ghi",
          amount: 70000,
          status: 'SUCCESS',
          paymentMethod: '카드',
          createdAt: '2024-01-10T14:20:00Z',
          certificateId: '124',
          manufacturer: '기아',
          modelName: 'K5',
          orderName: '기아 K5 인증서 발급',
          customerName: user?.name || '김토스',
          customerEmail: user?.email || 'customer@example.com'
        },
        {
          id: "3",
          orderId: "order_1703123456791_ghi789jkl",
          amount: 70000,
          status: 'FAILED',
          paymentMethod: '카드',
          createdAt: '2024-01-08T16:45:00Z',
          certificateId: '125',
          manufacturer: '쉐보레',
          modelName: '말리부',
          orderName: '쉐보레 말리부 인증서 발급',
          customerName: user?.name || '김토스',
          customerEmail: user?.email || 'customer@example.com'
        }
      ]

      setPayments(mockPayments)
    } catch (error) {
      console.error('결제 내역 조회 실패:', error)
      toast.error('결제 내역을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 인증 상태가 확인되지 않았으면 로딩 상태 표시
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3182F6]"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800">결제완료</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">결제실패</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">결제취소</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">결제대기</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">알 수 없음</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewCertificate = (certificateId: string) => {
    router.push(`/certificates/${certificateId}`)
  }

  const handleDownloadReceipt = (paymentId: string) => {
    toast.info('영수증 다운로드 기능은 준비 중입니다.')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">결제 내역</h1>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {filteredPayments
                  .filter(p => p.status === 'SUCCESS')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()}원
              </div>
              <div className="text-sm text-gray-500">총 결제 금액</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {filteredPayments.filter(p => p.status === 'SUCCESS').length}건
              </div>
              <div className="text-sm text-gray-500">결제 완료 건수</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {filteredPayments
                  .filter(p => p.status === 'SUCCESS')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">이번 달 결제 대금</div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="날짜, 결제 ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="전체 상태" />
              <ChevronDown className="w-4 h-4 ml-auto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="SUCCESS">결제완료</SelectItem>
              <SelectItem value="FAILED">결제실패</SelectItem>
              <SelectItem value="CANCELLED">결제취소</SelectItem>
              <SelectItem value="PENDING">결제대기</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="전체 방법" />
              <ChevronDown className="w-4 h-4 ml-auto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 방법</SelectItem>
              <SelectItem value="카드">카드</SelectItem>
              <SelectItem value="계좌이체">계좌이체</SelectItem>
              <SelectItem value="간편결제">간편결제</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 데이터 테이블 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">결제ID</TableHead>
                  <TableHead className="w-[140px]">날짜</TableHead>
                  <TableHead className="w-[120px]">금액</TableHead>
                  <TableHead className="w-[100px]">결제방법</TableHead>
                  <TableHead className="w-[100px]">상태</TableHead>
                  <TableHead className="w-[120px]">액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3182F6] mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      결제 내역이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.orderId.slice(-8)}
                      </TableCell>
                      <TableCell>
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell>
                        {payment.amount.toLocaleString()}원
                      </TableCell>
                      <TableCell>
                        {payment.paymentMethod}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {payment.certificateId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCertificate(payment.certificateId!)}
                              className="text-xs"
                            >
                              보기
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(payment.id)}
                            className="text-xs"
                          >
                            다운로드
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
