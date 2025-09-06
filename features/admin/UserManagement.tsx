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
  UserCheck, 
  Shield, 
  ShieldOff,
  Filter,
  Download
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  company: string
  status: 'pending' | 'approved' | 'rejected'
  role: 'user' | 'admin'
  joinDate: string
  lastLogin: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "김철수",
      email: "kim@example.com",
      company: "ABC 기업",
      status: "pending",
      role: "user",
      joinDate: "2024-01-15",
      lastLogin: "2024-01-15"
    },
    {
      id: "2",
      name: "이영희",
      email: "lee@example.com",
      company: "XYZ 기업",
      status: "approved",
      role: "user",
      joinDate: "2024-01-10",
      lastLogin: "2024-01-14"
    },
    {
      id: "3",
      name: "박민수",
      email: "park@example.com",
      company: "DEF 기업",
      status: "approved",
      role: "admin",
      joinDate: "2024-01-05",
      lastLogin: "2024-01-15"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  // 승인/거절 흐름 제거됨

  const handleToggleAdmin = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: user.role === 'admin' ? 'user' : 'admin' } : user
    ))
  }

  // 상태 배지 제거됨

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? 
      <Badge variant="default" className="bg-purple-600">관리자</Badge> :
      <Badge variant="outline">일반 사용자</Badge>
  }

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "이름,이메일,회사,상태,권한,가입일,마지막 로그인\n" +
      filteredUsers.map(user => 
        `${user.name},${user.email},${user.company},${user.status},${user.role},${user.joinDate},${user.lastLogin}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "사용자목록.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const adminCount = users.filter(u => u.role === 'admin').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
          <p className="text-muted-foreground">
            신규 가입자 승인 및 관리자 권한을 관리할 수 있습니다.
          </p>
        </div>
        <Button onClick={exportUsers} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          내보내기
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">전체 등록된 사용자</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">관리자</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-xs text-muted-foreground">관리자 권한 보유자</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 검색 및 필터</CardTitle>
          <CardDescription>
            이름, 이메일, 회사명으로 검색하고 상태와 권한으로 필터링할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="이름, 이메일, 회사명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="권한 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 권한</SelectItem>
                <SelectItem value="user">일반 사용자</SelectItem>
                <SelectItem value="admin">관리자</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>
            총 {filteredUsers.length}명의 사용자가 검색되었습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>회사</TableHead>
                <TableHead>권한</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead>마지막 로그인</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.company}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={user.role === 'admin' ? 'destructive' : 'default'}
                        onClick={() => handleToggleAdmin(user.id)}
                      >
                        {user.role === 'admin' ? (
                          <>
                            <ShieldOff className="h-3 w-3 mr-1" />
                            권한 회수
                          </>
                        ) : (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            관리자 지정
                          </>
                        )}
                      </Button>
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
