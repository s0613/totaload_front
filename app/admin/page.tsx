'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Globe,
  UserCheck,
  AlertTriangle,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const stats = [
    {
      title: "총 사용자",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "대기 중인 승인",
      value: "23",
      change: "+5",
      icon: UserCheck,
      color: "text-yellow-600"
    },
    {
      title: "발급된 인증서",
      value: "856",
      change: "+8%",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "월 결제액",
      value: "₩12.5M",
      change: "+15%",
      icon: CreditCard,
      color: "text-purple-600"
    }
  ]

  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="text-muted-foreground">
            시스템 전반의 현황을 한눈에 확인하고 관리할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> 지난 달 대비
              </p>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>최근 활동</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-blue-600" />
                <span>새로운 사용자 가입: 김철수</span>
              </div>
              <span className="text-sm text-muted-foreground">2분 전</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-green-600" />
                <span>인증서 발급 완료: #CERT-001</span>
              </div>
              <span className="text-sm text-muted-foreground">15분 전</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>승인 대기 중인 인증서: 3건</span>
              </div>
              <span className="text-sm text-muted-foreground">1시간 전</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
