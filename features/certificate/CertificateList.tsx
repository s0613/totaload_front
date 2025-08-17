"use client"

import { FileText, Calendar, Download, SearchIcon } from "lucide-react"
import { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/auth"
import CertificateService, { Certificate } from "./CertificateService"

export default function CertificateList() {
  const { isLoggedIn, user } = useAuthStore()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [filterIssuer, setFilterIssuer] = useState<string | null>(null)

  const filtered = certificates.filter(
    (cert) =>
      (cert.certNumber.includes(search) ||
        cert.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
        cert.modelName.toLowerCase().includes(search.toLowerCase()) ||
        cert.vin.includes(search)) &&
      (!filterIssuer || cert.issuedBy === filterIssuer),
  )

  // 인증서 전체 조회
  const fetchAllCertificates = useCallback(async () => {
    try {
      setLoading(true)
      const data = await CertificateService.getAllCertificates()
      setCertificates(data)
      toast.success(`${data.length}개의 인증서를 불러왔습니다.`)
    } catch (error) {
      console.error('인증서 조회 실패:', error)
      toast.error('인증서 조회에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  // 인증서 클릭 시 상세페이지로 이동
  const handleCertificateClick = useCallback((certificateId: number) => {
    router.push(`/certificates/${certificateId}`)
  }, [router])

  // 컴포넌트 마운트 시 인증서 전체 조회
  useEffect(() => {
    if (isLoggedIn) {
      fetchAllCertificates()
    }
  }, [isLoggedIn, fetchAllCertificates])

  return (
    <main className="flex-1 px-8 py-8">
      {/* 헤더 */}
      <header className="mb-8 flex flex-row items-center justify-between flex-wrap gap-6">
        {/* 좌측 타이틀 */}
        <div>
          <h2 className="text-2xl font-semibold">인증서 관리 시스템</h2>
          <p className="text-gray-500">수출자동차품질인증서 (ISO 17024) 관리</p>
        </div>

        {/* 우측 검색·필터 */}
        <div className="flex flex-row items-center flex-wrap gap-4">
          {/* 검색창 */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="w-64 pl-10"
              placeholder="인증번호, 제조사, 모델명, VIN 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 발급기관 필터 */}
          <Select onValueChange={(v) => setFilterIssuer(v || null)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="발급기관 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>발급기관</SelectLabel>
                {Array.from(new Set(certificates.map((c) => c.issuedBy))).map((issuer) => (
                  <SelectItem key={issuer} value={issuer}>
                    {issuer}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* 사용자 정보 표시 */}
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>안녕하세요, {user.name}님</span>
            </div>
          )}
        </div>
      </header>



      {/* 인증서 목록 */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            인증서 목록&nbsp;
            <span className="text-blue-600">{filtered.length}개</span>
          </h3>
        </div>

        {/* 인증서 목록 */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((cert) => (
              <Card
                key={cert.id}
                role="button"
                onClick={() => handleCertificateClick(cert.id)}
                className="group relative flex flex-row items-center gap-4 overflow-hidden transition-colors px-4 py-2
                  border border-transparent bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200
                  cursor-pointer"
              >
                  {/* 정보 */}
                  <CardContent className="flex flex-1 flex-row items-center gap-6 p-0 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold truncate">
                          {cert.manufacturer} {cert.modelName}
                        </h4>
                        <span className="text-xs text-gray-500">{cert.manufactureYear}</span>
                      </div>
                      <div className="font-mono text-xs text-gray-400 truncate">
                        인증번호: {cert.certNumber}
                      </div>
                      <div className="font-mono text-xs text-gray-400 truncate">
                        VIN: {cert.vin}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-auto text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(cert.issueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {cert.issuedBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        만료: {new Date(cert.expireDate).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-gray-500">
            <FileText className="h-10 w-10" />
            <p className="text-lg">등록된 인증서가 없습니다.</p>
            <p className="text-sm text-gray-400">새 인증서 발급 버튼을 클릭하여 인증서를 발급해보세요.</p>
          </div>
        )}
      </section>
    </main>
  )
}
