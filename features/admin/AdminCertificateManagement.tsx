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
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Eye,
  Ban,
  Filter
} from "lucide-react"

interface Certificate {
  id: string
  certificateNumber: string
  userName: string
  userCompany: string
  vehicleType: string
  country: string
  status: 'pending' | 'approved' | 'rejected' | 'invalid'
  issueDate: string
  expiryDate: string
  downloadCount: number
  lastDownload: string
}

export function CertificateManagement() {
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "1",
      certificateNumber: "CERT-2024-001",
      userName: "김철수",
      userCompany: "ABC 기업",
      vehicleType: "승용차",
      country: "요르단 (JSMO)",
      status: "pending",
      issueDate: "2024-01-15",
      expiryDate: "2025-01-15",
      downloadCount: 0,
      lastDownload: "-"
    },
    {
      id: "2",
      certificateNumber: "CERT-2024-002",
      userName: "이영희",
      userCompany: "XYZ 기업",
      vehicleType: "화물차",
      country: "사우디 (GSO)",
      status: "approved",
      issueDate: "2024-01-10",
      expiryDate: "2025-01-10",
      downloadCount: 3,
      lastDownload: "2024-01-14"
    },
    {
      id: "3",
      certificateNumber: "CERT-2024-003",
      userName: "박민수",
      userCompany: "DEF 기업",
      vehicleType: "승용차",
      country: "요르단 (JSMO)",
      status: "approved",
      issueDate: "2024-01-05",
      expiryDate: "2025-01-05",
      downloadCount: 1,
      lastDownload: "2024-01-12"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [countryFilter, setCountryFilter] = useState<string>("all")

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.userCompany.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter
    const matchesCountry = countryFilter === "all" || cert.country === countryFilter
    
    return matchesSearch && matchesStatus && matchesCountry
  })

  const handleStatusChange = (certId: string, newStatus: string) => {
    setCertificates(certificates.map(cert => 
      cert.id === certId ? { ...cert, status: newStatus as any } : cert
    ))
  }

  const handleInvalidate = (certId: string) => {
    setCertificates(certificates.map(cert => 
      cert.id === certId ? { ...cert, status: 'invalid' } : cert
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">승인 대기</Badge>
      case 'approved':
        return <Badge variant="default">승인됨</Badge>
      case 'rejected':
        return <Badge variant="destructive">반려됨</Badge>
      case 'invalid':
        return <Badge variant="destructive" className="bg-red-700">무효</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  const getCountryBadge = (country: string) => {
    if (country.includes('JSMO')) {
      return <Badge variant="outline" className="border-blue-500 text-blue-700">JSMO</Badge>
    } else if (country.includes('GSO')) {
      return <Badge variant="outline" className="border-green-500 text-green-700">GSO</Badge>
    }
    return <Badge variant="outline">{country}</Badge>
  }

  const exportCertificates = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "인증서번호,사용자명,회사,차량유형,국가,상태,발급일,만료일,다운로드수,마지막다운로드\n" +
      filteredCertificates.map(cert => 
        `${cert.certificateNumber},${cert.userName},${cert.userCompany},${cert.vehicleType},${cert.country},${cert.status},${cert.issueDate},${cert.expiryDate},${cert.downloadCount},${cert.lastDownload}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "인증서목록.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const pendingCount = certificates.filter(c => c.status === 'pending').length
  const approvedCount = certificates.filter(c => c.status === 'approved').length
  const invalidCount = certificates.filter(c => c.status === 'invalid').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">인증서 관리</h1>
          <p className="text-muted-foreground">
            발급된 인증서의 상태를 관리하고 위조/오류 인증서를 무효 처리할 수 있습니다.
          </p>
        </div>
        <Button onClick={exportCertificates} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          내보내기
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 인증서</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">전체 발급된 인증서</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">승인 대기 중인 인증서</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인됨</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">승인된 인증서</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">무효</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invalidCount}</div>
            <p className="text-xs text-muted-foreground">무효 처리된 인증서</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>인증서 검색 및 필터</CardTitle>
          <CardDescription>
            인증서 번호, 사용자명, 회사명으로 검색하고 상태와 국가로 필터링할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="인증서 번호, 사용자명, 회사명으로 검색..."
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
                <SelectItem value="pending">승인 대기</SelectItem>
                <SelectItem value="approved">승인됨</SelectItem>
                <SelectItem value="rejected">반려됨</SelectItem>
                <SelectItem value="invalid">무효</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="국가 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 국가</SelectItem>
                <SelectItem value="요르단 (JSMO)">요르단 (JSMO)</SelectItem>
                <SelectItem value="사우디 (GSO)">사우디 (GSO)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 인증서 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>인증서 목록</CardTitle>
          <CardDescription>
            총 {filteredCertificates.length}건의 인증서가 검색되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>인증서 번호</TableHead>
                <TableHead>사용자명</TableHead>
                <TableHead>회사</TableHead>
                <TableHead>차량 유형</TableHead>
                <TableHead>국가</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>발급일</TableHead>
                <TableHead>만료일</TableHead>
                <TableHead>다운로드</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCertificates.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{cert.certificateNumber}</TableCell>
                  <TableCell>{cert.userName}</TableCell>
                  <TableCell>{cert.userCompany}</TableCell>
                  <TableCell>{cert.vehicleType}</TableCell>
                  <TableCell>{getCountryBadge(cert.country)}</TableCell>
                  <TableCell>{getStatusBadge(cert.status)}</TableCell>
                  <TableCell>{cert.issueDate}</TableCell>
                  <TableCell>{cert.expiryDate}</TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-medium">{cert.downloadCount}</div>
                      <div className="text-xs text-muted-foreground">{cert.lastDownload}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        보기
                      </Button>
                      {cert.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(cert.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(cert.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            반려
                          </Button>
                        </>
                      )}
                      {cert.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleInvalidate(cert.id)}
                        >
                          <Ban className="h-3 w-3 mr-1" />
                          무효 처리
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
