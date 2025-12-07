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
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  Download,
  Calendar,
  Filter,
  Eye
} from "lucide-react"

interface ActivityLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  details: string
  ipAddress: string
  userAgent: string
}

interface Statistics {
  period: string
  newUsers: number
  certificatesIssued: number
  downloads: number
  revenue: number
}

export function AnalyticsManagement() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "1",
      timestamp: "2024-01-15 14:30:25",
      userId: "user001",
      userName: "김철수",
      action: "로그인",
      details: "성공적인 로그인",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome/120.0.0.0"
    },
    {
      id: "2",
      timestamp: "2024-01-15 14:35:12",
      userId: "user001",
      userName: "김철수",
      action: "인증서 발급",
      details: "CERT-2024-001 발급 완료",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome/120.0.0.0"
    },
    {
      id: "3",
      timestamp: "2024-01-15 15:20:45",
      userId: "user002",
      userName: "이영희",
      action: "인증서 다운로드",
      details: "CERT-2024-002 다운로드",
      ipAddress: "203.241.50.123",
      userAgent: "Safari/17.2"
    }
  ])

  const [statistics, setStatistics] = useState<Statistics[]>([
    {
      period: "2024-01",
      newUsers: 45,
      certificatesIssued: 128,
      downloads: 342,
      revenue: 2500000
    },
    {
      period: "2024-02",
      newUsers: 52,
      certificatesIssued: 156,
      downloads: 398,
      revenue: 3100000
    },
    {
      period: "2024-03",
      newUsers: 38,
      certificatesIssued: 142,
      downloads: 367,
      revenue: 2800000
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesDate = dateFilter === "all" || log.timestamp.startsWith(dateFilter)
    
    return matchesSearch && matchesAction && matchesDate
  })

  const getActionBadge = (action: string) => {
    switch (action) {
      case '로그인':
        return <Badge variant="default">로그인</Badge>
      case '인증서 발급':
        return <Badge variant="outline" className="border-green-500 text-green-700">발급</Badge>
      case '인증서 다운로드':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">다운로드</Badge>
      case '회원가입':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">가입</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  const exportLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "시간,사용자ID,사용자명,액션,상세내용,IP주소,사용자에이전트\n" +
      filteredLogs.map(log => 
        `${log.timestamp},${log.userId},${log.userName},${log.action},${log.details},${log.ipAddress},${log.userAgent}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "활동로그.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalUsers = statistics.reduce((sum, stat) => sum + stat.newUsers, 0)
  const totalCertificates = statistics.reduce((sum, stat) => sum + stat.certificatesIssued, 0)
  const totalDownloads = statistics.reduce((sum, stat) => sum + stat.downloads, 0)
  const totalRevenue = statistics.reduce((sum, stat) => sum + stat.revenue, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">로그/통계 분석</h1>
          <p className="text-muted-foreground">
            사용자 활동 로그와 발급/다운로드 통계를 분석할 수 있습니다.
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          로그 내보내기
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 신규 사용자</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">전체 기간</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 인증서 발급</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertificates}</div>
            <p className="text-xs text-muted-foreground">전체 기간</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 다운로드</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-xs text-muted-foreground">전체 기간</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">전체 기간</p>
          </CardContent>
        </Card>
      </div>

      {/* 월별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>월별 통계</CardTitle>
          <CardDescription>
            월별 신규 사용자, 인증서 발급, 다운로드, 매출 현황을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>기간</TableHead>
                <TableHead>신규 사용자</TableHead>
                <TableHead>인증서 발급</TableHead>
                <TableHead>다운로드</TableHead>
                <TableHead>매출</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.map((stat) => (
                <TableRow key={stat.period}>
                  <TableCell className="font-medium">{stat.period}</TableCell>
                  <TableCell>{stat.newUsers}명</TableCell>
                  <TableCell>{stat.certificatesIssued}건</TableCell>
                  <TableCell>{stat.downloads}건</TableCell>
                  <TableCell className="font-medium">{formatCurrency(stat.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 활동 로그 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>활동 로그 검색 및 필터</CardTitle>
          <CardDescription>
            사용자명, 액션, 상세내용으로 검색하고 액션과 날짜로 필터링할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="사용자명, 액션, 상세내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="액션 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 액션</SelectItem>
                <SelectItem value="로그인">로그인</SelectItem>
                <SelectItem value="인증서 발급">인증서 발급</SelectItem>
                <SelectItem value="인증서 다운로드">인증서 다운로드</SelectItem>
                <SelectItem value="회원가입">회원가입</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="날짜 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 날짜</SelectItem>
                <SelectItem value="2024-01">2024년 1월</SelectItem>
                <SelectItem value="2024-02">2024년 2월</SelectItem>
                <SelectItem value="2024-03">2024년 3월</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 활동 로그 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>활동 로그</CardTitle>
          <CardDescription>
            총 {filteredLogs.length}건의 활동 로그가 검색되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시간</TableHead>
                <TableHead>사용자명</TableHead>
                <TableHead>액션</TableHead>
                <TableHead>상세 내용</TableHead>
                <TableHead>IP 주소</TableHead>
                <TableHead>사용자 에이전트</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.timestamp}</TableCell>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {log.userAgent}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 차트 영역 (향후 Chart.js 등으로 구현 가능) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>사용자 활동 트렌드</CardTitle>
            <CardDescription>
              일별 사용자 활동 추이를 시각화합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>차트 영역</p>
                <p className="text-sm">Chart.js 또는 Recharts로 구현 예정</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>인증서 발급 현황</CardTitle>
            <CardDescription>
              국가별 인증서 발급 현황을 시각화합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>차트 영역</p>
                <p className="text-sm">Chart.js 또는 Recharts로 구현 예정</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
