'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  Globe, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Edit,
  Save,
  X,
  Plus,
  Download
} from "lucide-react"

interface CountryRegulation {
  id: string
  countryCode: string
  countryName: string
  regulationBody: string
  regulationCode: string
  status: 'active' | 'inactive' | 'pending'
  lastUpdated: string
  certificateFormat: string
  requirements: string
  notes: string
}

export function CountryManagement() {
  const [regulations, setRegulations] = useState<CountryRegulation[]>([
    {
      id: "1",
      countryCode: "JO",
      countryName: "요르단",
      regulationBody: "JSMO",
      regulationCode: "JSMO-2024-001",
      status: "active",
      lastUpdated: "2024-01-15",
      certificateFormat: "PDF",
      requirements: "차량 등록증, 소유자 신분증, 기술검사증",
      notes: "JSMO 최신 규제 기준 반영 완료"
    },
    {
      id: "2",
      countryCode: "SA",
      countryName: "사우디아라비아",
      regulationBody: "GSO",
      regulationCode: "GSO-2024-002",
      status: "active",
      lastUpdated: "2024-01-10",
      certificateFormat: "PDF",
      requirements: "차량 등록증, 소유자 신분증, 기술검사증, 보험증",
      notes: "GSO 2024년 신규 규제 기준 적용"
    },
    {
      id: "3",
      countryCode: "AE",
      countryName: "아랍에미리트",
      regulationBody: "ESMA",
      regulationCode: "ESMA-2024-003",
      status: "pending",
      lastUpdated: "2024-01-20",
      certificateFormat: "PDF",
      requirements: "차량 등록증, 소유자 신분증",
      notes: "ESMA 규제 기준 검토 중"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [bodyFilter, setBodyFilter] = useState<string>("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<CountryRegulation>>({})

  const filteredRegulations = regulations.filter(regulation => {
    const matchesSearch = regulation.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         regulation.regulationBody.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         regulation.regulationCode.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || regulation.status === statusFilter
    const matchesBody = bodyFilter === "all" || regulation.regulationBody === bodyFilter
    
    return matchesSearch && matchesStatus && matchesBody
  })

  const handleEdit = (regulation: CountryRegulation) => {
    setEditingId(regulation.id)
    setEditingData(regulation)
  }

  const handleSave = () => {
    if (editingId) {
      setRegulations(regulations.map(regulation => 
        regulation.id === editingId 
          ? { ...regulation, ...editingData, lastUpdated: new Date().toISOString().split('T')[0] }
          : regulation
      ))
      setEditingId(null)
      setEditingData({})
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingData({})
  }

  const handleStatusChange = (regulationId: string, newStatus: string) => {
    setRegulations(regulations.map(regulation => 
      regulation.id === regulationId 
        ? { ...regulation, status: newStatus as any, lastUpdated: new Date().toISOString().split('T')[0] }
        : regulation
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">활성</Badge>
      case 'inactive':
        return <Badge variant="secondary">비활성</Badge>
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">검토 중</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  const getBodyBadge = (body: string) => {
    switch (body) {
      case 'JSMO':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">JSMO</Badge>
      case 'GSO':
        return <Badge variant="outline" className="border-green-500 text-green-700">GSO</Badge>
      case 'ESMA':
        return <Badge variant="outline" className="border-purple-500 text-purple-700">ESMA</Badge>
      default:
        return <Badge variant="outline">{body}</Badge>
    }
  }

  const exportRegulations = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "국가코드,국가명,규제기관,규제코드,상태,최종업데이트,인증서포맷,요구사항,비고\n" +
      filteredRegulations.map(regulation => 
        `${regulation.countryCode},${regulation.countryName},${regulation.regulationBody},${regulation.regulationCode},${regulation.status},${regulation.lastUpdated},${regulation.certificateFormat},${regulation.requirements},${regulation.notes}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "국가별규제.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const activeCount = regulations.filter(r => r.status === 'active').length
  const pendingCount = regulations.filter(r => r.status === 'pending').length
  const totalCountries = regulations.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">국가별 규제 관리</h1>
          <p className="text-muted-foreground">
            JSMO(요르단), GSO(사우디) 등 국가별 규제 기준을 관리하고 인증 포맷을 업데이트할 수 있습니다.
          </p>
        </div>
        <Button onClick={exportRegulations} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          내보내기
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 국가</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCountries}</div>
            <p className="text-xs text-muted-foreground">등록된 국가 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 규제</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">활성화된 규제</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">검토 대기</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">검토 대기 중인 규제</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>규제 검색 및 필터</CardTitle>
          <CardDescription>
            국가명, 규제기관, 규제코드로 검색하고 상태와 규제기관으로 필터링할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="국가명, 규제기관, 규제코드로 검색..."
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
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
                <SelectItem value="pending">검토 중</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bodyFilter} onValueChange={setBodyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="규제기관 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기관</SelectItem>
                <SelectItem value="JSMO">JSMO (요르단)</SelectItem>
                <SelectItem value="GSO">GSO (사우디)</SelectItem>
                <SelectItem value="ESMA">ESMA (UAE)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 규제 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>국가별 규제 목록</CardTitle>
          <CardDescription>
            총 {filteredRegulations.length}건의 규제가 검색되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>국가</TableHead>
                <TableHead>규제기관</TableHead>
                <TableHead>규제코드</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>최종 업데이트</TableHead>
                <TableHead>인증서 포맷</TableHead>
                <TableHead>요구사항</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegulations.map((regulation) => (
                <TableRow key={regulation.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{regulation.countryName}</div>
                      <div className="text-sm text-muted-foreground">{regulation.countryCode}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getBodyBadge(regulation.regulationBody)}</TableCell>
                  <TableCell className="font-medium">{regulation.regulationCode}</TableCell>
                  <TableCell>{getStatusBadge(regulation.status)}</TableCell>
                  <TableCell>{regulation.lastUpdated}</TableCell>
                  <TableCell>{regulation.certificateFormat}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={regulation.requirements}>
                    {regulation.requirements}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingId === regulation.id ? (
                        <>
                          <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                            <Save className="h-3 w-3 mr-1" />
                            저장
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-3 w-3 mr-1" />
                            취소
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(regulation)}>
                            <Edit className="h-3 w-3 mr-1" />
                            편집
                          </Button>
                          <Select 
                            value={regulation.status} 
                            onValueChange={(value) => handleStatusChange(regulation.id, value)}
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">활성</SelectItem>
                              <SelectItem value="inactive">비활성</SelectItem>
                              <SelectItem value="pending">검토 중</SelectItem>
                            </SelectContent>
                          </Select>
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

      {/* 규제 편집 모달 (인라인 편집) */}
      {editingId && (
        <Card>
          <CardHeader>
            <CardTitle>규제 정보 편집</CardTitle>
            <CardDescription>
              선택된 규제의 정보를 수정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">국가명</label>
                <Input
                  value={editingData.countryName || ''}
                  onChange={(e) => setEditingData({...editingData, countryName: e.target.value})}
                  placeholder="국가명을 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium">국가 코드</label>
                <Input
                  value={editingData.countryCode || ''}
                  onChange={(e) => setEditingData({...editingData, countryCode: e.target.value})}
                  placeholder="국가 코드를 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium">규제기관</label>
                <Input
                  value={editingData.regulationBody || ''}
                  onChange={(e) => setEditingData({...editingData, regulationBody: e.target.value})}
                  placeholder="규제기관을 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium">규제코드</label>
                <Input
                  value={editingData.regulationCode || ''}
                  onChange={(e) => setEditingData({...editingData, regulationCode: e.target.value})}
                  placeholder="규제코드를 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium">인증서 포맷</label>
                <Select 
                  value={editingData.certificateFormat || ''} 
                  onValueChange={(value) => setEditingData({...editingData, certificateFormat: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="포맷을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="XML">XML</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">상태</label>
                <Select 
                  value={editingData.status || ''} 
                  onValueChange={(value) => setEditingData({...editingData, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                    <SelectItem value="pending">검토 중</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">요구사항</label>
              <Textarea
                value={editingData.requirements || ''}
                onChange={(e) => setEditingData({...editingData, requirements: e.target.value})}
                placeholder="인증서 발급에 필요한 요구사항을 입력하세요"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">비고</label>
              <Textarea
                value={editingData.notes || ''}
                onChange={(e) => setEditingData({...editingData, notes: e.target.value})}
                placeholder="추가적인 비고사항을 입력하세요"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 규제 업데이트 히스토리 */}
      <Card>
        <CardHeader>
          <CardTitle>규제 업데이트 히스토리</CardTitle>
          <CardDescription>
            최근 규제 기준 업데이트 내역을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>JSMO 2024년 신규 규제 기준 반영</span>
              </div>
              <span className="text-sm text-muted-foreground">2024-01-15</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-green-600" />
                <span>GSO 2024년 차량 인증 규정 업데이트</span>
              </div>
              <span className="text-sm text-muted-foreground">2024-01-10</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>ESMA 규제 기준 검토 진행 중</span>
              </div>
              <span className="text-sm text-muted-foreground">2024-01-20</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
