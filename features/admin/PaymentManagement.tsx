'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Download,
  Eye,
  RotateCcw,
  XCircle,
  CheckCircle
} from "lucide-react"

interface Payment {
  id: string
  paymentNumber: string
  userName: string
  userCompany: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled'
  paymentMethod: string
  paymentDate: string
  subscriptionType: string
  nextBillingDate: string
}

export function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: "1",
      paymentNumber: "PAY-2024-001",
      userName: "김철수",
      userCompany: "ABC 기업",
      amount: 50000,
      currency: "KRW",
      status: "completed",
      paymentMethod: "신용카드",
      paymentDate: "2024-01-15",
      subscriptionType: "월간 구독",
      nextBillingDate: "2024-02-15"
    },
    {
      id: "2",
      paymentNumber: "PAY-2024-002",
      userName: "이영희",
      userCompany: "XYZ 기업",
      amount: 150000,
      currency: "KRW",
      status: "completed",
      paymentMethod: "계좌이체",
      paymentDate: "2024-01-10",
      subscriptionType: "연간 구독",
      nextBillingDate: "2025-01-10"
    },
    {
      id: "3",
      paymentNumber: "PAY-2024-003",
      userName: "박민수",
      userCompany: "DEF 기업",
      amount: 50000,
      currency: "KRW",
      status: "pending",
      paymentMethod: "신용카드",
      paymentDate: "2024-01-20",
      subscriptionType: "월간 구독",
      nextBillingDate: "2024-02-20"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all")

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.userCompany.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesSubscription = subscriptionFilter === "all" || payment.subscriptionType === subscriptionFilter
    
    return matchesSearch && matchesStatus && matchesSubscription
  })

  const handleRefund = (paymentId: string) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId ? { ...payment, status: 'refunded' } : payment
    ))
  }

  const handleCancel = (paymentId: string) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId ? { ...payment, status: 'cancelled' } : payment
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">완료</Badge>
      case 'pending':
        return <Badge variant="secondary">처리 중</Badge>
      case 'failed':
        return <Badge variant="destructive">실패</Badge>
      case 'refunded':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">환불됨</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="bg-gray-600">취소됨</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  const getSubscriptionBadge = (type: string) => {
    if (type.includes('연간')) {
      return <Badge variant="outline" className="border-blue-500 text-blue-700">연간</Badge>
    } else if (type.includes('월간')) {
      return <Badge variant="outline" className="border-green-500 text-green-700">월간</Badge>
    }
    return <Badge variant="outline">{type}</Badge>
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency === 'KRW' ? 'KRW' : 'USD'
    }).format(amount)
  }

  const exportPayments = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "결제번호,사용자명,회사,금액,상태,결제수단,결제일,구독유형,다음결제일\n" +
      filteredPayments.map(payment => 
        `${payment.paymentNumber},${payment.userName},${payment.userCompany},${formatCurrency(payment.amount, payment.currency)},${payment.status},${payment.paymentMethod},${payment.paymentDate},${payment.subscriptionType},${payment.nextBillingDate}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "결제내역.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const activeSubscriptions = payments.filter(p => p.status === 'completed' && p.subscriptionType.includes('구독')).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">결제/구독 관리</h1>
          <p className="text-muted-foreground">
            결제 내역을 조회하고 환불/취소를 처리하며 구독 현황을 모니터링할 수 있습니다.
          </p>
        </div>
        <Button onClick={exportPayments} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          내보내기
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue, 'KRW')}</div>
            <p className="text-xs text-muted-foreground">완료된 결제 기준</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">처리 대기</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">처리 대기 중인 결제</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 구독</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">현재 활성 구독</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 검색 및 필터</CardTitle>
          <CardDescription>
            결제 번호, 사용자명, 회사명으로 검색하고 상태와 구독 유형으로 필터링할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="결제 번호, 사용자명, 회사명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="pending">처리 중</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
                <SelectItem value="refunded">환불됨</SelectItem>
                <SelectItem value="cancelled">취소됨</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="구독 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                <SelectItem value="월간 구독">월간 구독</SelectItem>
                <SelectItem value="연간 구독">연간 구독</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 결제 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 내역</CardTitle>
          <CardDescription>
            총 {filteredPayments.length}건의 결제가 검색되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>결제 번호</TableHead>
                <TableHead>사용자명</TableHead>
                <TableHead>회사</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>결제 수단</TableHead>
                <TableHead>결제일</TableHead>
                <TableHead>구독 유형</TableHead>
                <TableHead>다음 결제일</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                  <TableCell>{payment.userName}</TableCell>
                  <TableCell>{payment.userCompany}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{payment.paymentDate}</TableCell>
                  <TableCell>{getSubscriptionBadge(payment.subscriptionType)}</TableCell>
                  <TableCell>{payment.nextBillingDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        보기
                      </Button>
                      {payment.status === 'completed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefund(payment.id)}
                            className="border-orange-500 text-orange-700 hover:bg-orange-50"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            환불
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(payment.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            취소
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 구독 현황 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>구독 현황 요약</CardTitle>
          <CardDescription>
            현재 활성 구독과 만료 예정 구독 현황을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">월간 구독</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>활성 구독</span>
                  <span className="font-medium">{payments.filter(p => p.status === 'completed' && p.subscriptionType === '월간 구독').length}건</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>월 매출</span>
                  <span className="font-medium">{formatCurrency(payments.filter(p => p.status === 'completed' && p.subscriptionType === '월간 구독').reduce((sum, p) => sum + p.amount, 0), 'KRW')}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">연간 구독</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>활성 구독</span>
                  <span className="font-medium">{payments.filter(p => p.status === 'completed' && p.subscriptionType === '연간 구독').length}건</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>연 매출</span>
                  <span className="font-medium">{formatCurrency(payments.filter(p => p.status === 'completed' && p.subscriptionType === '연간 구독').reduce((sum, p) => sum + p.amount, 0), 'KRW')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
