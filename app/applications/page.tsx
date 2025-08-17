"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { vehicleService, type CertificateApplication } from "@/features/car/VehicleService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Calendar, MapPin, Car } from "lucide-react"
import { toast } from "sonner"
import Sidebar from "@/components/common/Sidebar"

export default function ApplicationsPage() {
  const { isLoggedIn, user } = useAuthStore()
  const router = useRouter()
  const [applications, setApplications] = useState<CertificateApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    loadApplications()
  }, [isLoggedIn, router, user])

  const loadApplications = async () => {
    if (!user?.userId) return

    try {
      setIsLoading(true)
      const userApplications = await vehicleService.getUserApplications(user.userId)
      setApplications(userApplications)
    } catch (error) {
      console.error("신청 내역 로드 실패:", error)
      toast.error("신청 내역을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">대기중</Badge>
      case "processing":
        return <Badge className="bg-blue-600">처리중</Badge>
      case "completed":
        return <Badge className="bg-green-600">완료</Badge>
      case "rejected":
        return <Badge variant="destructive">거절</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">인증서 신청 내역</h1>
            <p className="text-gray-600">인증서 발급 신청 현황을 확인하세요</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">신청 내역을 불러오는 중...</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">신청 내역이 없습니다</h3>
            <p className="text-gray-600 mb-6">아직 인증서 발급을 신청하지 않으셨습니다.</p>
            <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
              <Car className="w-4 h-4 mr-2" />
              차량 정보 불러오기
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">총 {applications.length}건의 신청 내역이 있습니다.</p>
              <Button onClick={() => router.push("/")} variant="outline">
                <Car className="w-4 h-4 mr-2" />새 신청
              </Button>
            </div>

            <div className="grid gap-6">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          신청 번호: {application.id}
                        </CardTitle>
                        <CardDescription>VIN: {application.vehicleVin}</CardDescription>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">수출 국가</span>
                          <p className="font-semibold">{application.targetCountry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">신청일</span>
                          <p className="font-semibold">
                            {new Date(application.applicationDate).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="text-gray-500">완료 예정일</span>
                          <p className="font-semibold">
                            {application.completionDate
                              ? new Date(application.completionDate).toLocaleDateString("ko-KR")
                              : new Date(
                                  new Date(application.applicationDate).getTime() + 5 * 24 * 60 * 60 * 1000,
                                ).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {application.certificateNumber && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>인증서 번호:</strong> {application.certificateNumber}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        상세 보기
                      </Button>
                      {application.status === "completed" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          인증서 다운로드
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
