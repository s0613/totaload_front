"use client"

import { SearchIcon, MapPin, Gauge, Plus, FileText, Calendar, Download } from "lucide-react"
import { useCallback, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import CarListHeader from "./CarListHeader"
import VehicleSearchModal from "./VehicleSearchModal"
import { useAuthStore } from "@/lib/auth"
import CertificateService, { Certificate } from "./CertificateService"

interface Vehicle {
  id: string
  vin: string
  make: string
  model: string
  year: number
  mileage: number
  country: string
  image?: string
}

export default function CarList() {
  const { isLoggedIn } = useAuthStore()
  const [vehicles] = useState<Vehicle[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  const [search, setSearch] = useState("")
  const [filterCountry, setFilterCountry] = useState<string | null>(null)
  const [selected, setSelected] = useState<Vehicle | null>(null)
  const [showVehicleSearch, setShowVehicleSearch] = useState(false)

  const filtered = vehicles.filter(
    (v) =>
      (v.vin.includes(search) ||
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase())) &&
      (!filterCountry || v.country === filterCountry),
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

  // 인증서 단건 조회
  const fetchCertificateById = useCallback(async (id: number) => {
    try {
      setLoading(true)
      const certificate = await CertificateService.getCertificateById(id)
      setSelectedCertificate(certificate)
      toast.success('인증서 정보를 불러왔습니다.')
    } catch (error) {
      console.error('인증서 단건 조회 실패:', error)
      toast.error('인증서 조회에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  // PDF 다운로드
  const handleDownloadPdf = useCallback(async (pdfFilePath: string, certNumber: string) => {
    try {
      await CertificateService.downloadCertificatePdf(pdfFilePath, `certificate_${certNumber}.pdf`)
      toast.success('PDF 다운로드가 시작되었습니다.')
    } catch (error) {
      console.error('PDF 다운로드 실패:', error)
      toast.error('PDF 다운로드에 실패했습니다.')
    }
  }, [])

  // 컴포넌트 마운트 시 인증서 전체 조회
  useEffect(() => {
    if (isLoggedIn) {
      fetchAllCertificates()
    }
  }, [isLoggedIn, fetchAllCertificates])

  const handleRequest = useCallback(() => {
    if (!selected) return
    toast(`${selected.vin} 인증서 요청이 접수되었습니다.`)
  }, [selected])

  const router = useRouter()

  return (
    <main className="flex-1 px-8 py-8">
      <CarListHeader search={search} setSearch={setSearch} setFilterCountry={setFilterCountry} vehicles={vehicles} />

      {/* 차량 정보 불러오기 및 인증서 새로고침 버튼 */}
      {isLoggedIn && (
        <div className="mb-6 flex gap-3">
          <Button
            onClick={() => setShowVehicleSearch(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            차량 정보 불러오기
          </Button>
          
          <Button
            onClick={fetchAllCertificates}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            <FileText className="w-5 h-5 mr-2" />
            {loading ? '로딩 중...' : '인증서 새로고침'}
          </Button>
        </div>
      )}

      {/* 차량 목록 */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            차량 목록&nbsp;
            <span className="text-blue-600">{filtered.length}대</span>
          </h3>

          {selected && (
            <Button onClick={handleRequest} className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
              인증서 요청
            </Button>
          )}
        </div>

        {/* 반응형 그리드 */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filtered.map((v) => {
              const isSelected = selected?.id === v.id
              return (
                <Card
                  key={v.id}
                  role="button"
                  aria-selected={isSelected}
                  onClick={() => router.push(`/cardetail/${v.id}`)}
                  className={`group relative flex flex-row items-center gap-4 overflow-hidden transition-shadow px-4 py-2
                    ${
                      isSelected
                        ? "border-blue-500 shadow-lg bg-blue-50/40"
                        : "hover:shadow-md bg-white hover:border-blue-400 hover:bg-blue-50/60 border border-transparent"
                    }
                    cursor-pointer
                  `}
                >
                  {/* 정보 */}
                  <CardContent className="flex flex-1 flex-row items-center gap-6 p-0 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold truncate">
                          {v.make} {v.model}
                        </h4>
                        <span className="text-xs text-gray-500">{v.year}</span>
                      </div>
                      <div className="font-mono text-xs text-gray-400 truncate">{v.vin}</div>
                    </div>
                    <div className="flex items-center gap-4 ml-auto text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Gauge className="h-4 w-4 text-gray-400" />
                        {v.mileage.toLocaleString()}km
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {v.country}
                      </div>
                    </div>
                  </CardContent>
                  {isSelected && <span className="absolute inset-x-0 top-0 h-1 bg-blue-600" />}
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-gray-500">
            <SearchIcon className="h-10 w-10" />
            <p className="text-lg">등록된 차량이 없습니다.</p>
            <p className="text-sm text-gray-400">차량 정보 불러오기 버튼을 클릭하여 차량을 추가해보세요.</p>
          </div>
        )}
      </section>

      {/* 인증서 목록 */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            인증서 목록&nbsp;
            <span className="text-blue-600">{certificates.length}개</span>
          </h3>
          
          {selectedCertificate && (
            <div className="flex gap-2">
              <Button 
                onClick={() => setSelectedCertificate(null)}
                variant="outline"
                size="sm"
              >
                선택 해제
              </Button>
              <Button 
                onClick={() => handleDownloadPdf(selectedCertificate.pdfFilePath, selectedCertificate.certNumber)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF 다운로드
              </Button>
            </div>
          )}
        </div>

        {/* 인증서 목록 */}
        {certificates.length > 0 ? (
          <div className="flex flex-col gap-3">
            {certificates.map((cert) => {
              const isSelected = selectedCertificate?.id === cert.id
              return (
                <Card
                  key={cert.id}
                  role="button"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCertificate(isSelected ? null : cert)}
                  className={`group relative flex flex-row items-center gap-4 overflow-hidden transition-shadow px-4 py-2
                    ${
                      isSelected
                        ? "border-green-500 shadow-lg bg-green-50/40"
                        : "hover:shadow-md bg-white hover:border-green-400 hover:bg-green-50/60 border border-transparent"
                    }
                    cursor-pointer
                  `}
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
                    </div>
                  </CardContent>
                  {isSelected && <span className="absolute inset-x-0 top-0 h-1 bg-green-600" />}
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-gray-500">
            <FileText className="h-10 w-10" />
            <p className="text-lg">등록된 인증서가 없습니다.</p>
            <p className="text-sm text-gray-400">인증서 새로고침 버튼을 클릭하여 인증서를 불러와보세요.</p>
          </div>
          )}
      </section>

      {/* 차량 검색 모달 */}
      {showVehicleSearch && <VehicleSearchModal onClose={() => setShowVehicleSearch(false)} />}
    </main>
  )
}
