'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, Shield } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">접근 권한이 없습니다</CardTitle>
          <CardDescription className="text-gray-600">
            이 페이지에 접근할 수 있는 권한이 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">권한 확인 필요</span>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              관리자 권한이 필요한 페이지입니다. 시스템 관리자에게 문의하세요.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Link href="/" className="w-full">
              <Button className="w-full" variant="outline">
                <Home className="w-4 h-4 mr-2" />
                홈으로 돌아가기
              </Button>
            </Link>
            
            <Link href="/login" className="w-full">
              <Button className="w-full">
                <Shield className="w-4 h-4 mr-2" />
                다른 계정으로 로그인
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
