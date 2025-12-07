"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search, Car, MapPin, FileText, Eye } from "lucide-react"
import { toast } from "sonner"
import { vehicleService, type Vehicle, CERTIFICATE_TEMPLATES } from "./VehicleService"
import { useAuthStore } from "@/lib/auth"

interface VehicleSearchModalProps {
  onClose: () => void
}

export default function VehicleSearchModal({ onClose }: VehicleSearchModalProps) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [step, setStep] = useState<"search" | "details" | "country" | "preview" | "complete">("search")
  const [vin, setVin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [showTemplatePreview, setShowTemplatePreview] = useState(false)

  // VIN으로 차량 정보 조회
  const handleSearchVehicle = async () => {
    if (!vin.trim()) {
      toast.error("VIN을 입력해주세요.")
      return
    }

    if (vin.length < 10) {
      toast.error("올바른 VIN을 입력해주세요. (최소 10자)")
      return
    }

    setIsLoading(true)

    try {
      const foundVehicle = await vehicleService.getVehicleByVin(vin)
      if (foundVehicle) {
        setVehicle(foundVehicle)
        setStep("details")
        toast.success("차량 정보를 성공적으로 불러왔습니다!")
      }
    } catch (error) {
      console.error("차량 조회 실패:", error)
      let errorMessage = "차량 정보를 찾을 수 없습니다."
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 국가 선택 단계로 이동
  const handleProceedToCountrySelection = () => {
    setStep("country")
  }

  // 템플릿 미리보기
  const handlePreviewTemplate = () => {
    if (!selectedCountry) {
      toast.error("국가를 선택해주세요.")
      return
    }
    setShowTemplatePreview(true)
    setStep("preview")
  }

  // 인증서 발급 신청
  const handleApplyCertificate = async () => {
    if (!vehicle || !selectedCountry || !user?.userId) {
      toast.error("필요한 정보가 누락되었습니다.")
      return
    }

    setIsLoading(true)

    try {
      const application = await vehicleService.applyCertificate(vehicle.vin, selectedCountry, user.userId)
      setStep("complete")
      toast.success("인증서 발급 신청이 완료되었습니다!")
    } catch (error) {
      console.error("인증서 신청 실패:", error)
      toast.error("인증서 발급 신청에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedTemplate = selectedCountry
    ? CERTIFICATE_TEMPLATES[selectedCountry as keyof typeof CERTIFICATE_TEMPLATES]
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">차량 정보 불러오기</h2>
            <p className="text-gray-600">VIN을 입력하여 차량 정보를 조회하고 인증서를 발급받으세요</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Step 1: VIN 검색 */}
          {step === "search" && (
            <div className="space-y-6">
              <div className="text-center">
                <Car className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">차량 정보 조회</h3>
                <p className="text-gray-600">차량의 VIN(차대번호)을 입력해주세요</p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <label htmlFor="vin" className="text-sm font-medium text-gray-700">
                    VIN (차대번호) *
                  </label>
                  <Input
                    id="vin"
                    type="text"
                    placeholder="예: KMHE341DBLA569132"
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    className="text-center font-mono"
                    maxLength={17}
                  />
                  <p className="text-xs text-gray-500">VIN은 17자리 영문자와 숫자로 구성됩니다</p>
                </div>

                <Button onClick={handleSearchVehicle} disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      조회 중...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      차량 정보 조회
                    </>
                  )}
                </Button>
              </div>

              {/* 샘플 VIN 안내 */}
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="text-sm font-medium text-blue-800 mb-2">테스트용 VIN</h4>
                <div className="space-y-1 text-xs text-blue-700">
                  <p>• KMHE341DBLA569132 (Hyundai Sonata)</p>
                  <p>• JH4KA8270MC000352 (Kia Sorento)</p>
                  <p>• 3FA6P0H73KR123456 (Genesis G80)</p>
                  <p>• WVWZZZ1JZ3W386752 (Volkswagen Golf)</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 차량 정보 확인 */}
          {step === "details" && vehicle && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">차량 정보 확인</h3>
                <p className="text-gray-600">조회된 차량 정보를 확인해주세요</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 차량 이미지 */}
                <div className="space-y-4">
                  <div className="aspect-video overflow-hidden rounded-lg border bg-gray-100">
                    <img
                      src={vehicle.image || "/placeholder.svg"}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      등급: {vehicle.finalGrade}
                    </Badge>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      점수: {vehicle.finalScore}점
                    </Badge>
                  </div>
                </div>

                {/* 차량 상세 정보 */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        기본 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">제조사</span>
                          <p className="font-semibold">{vehicle.make}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">모델</span>
                          <p className="font-semibold">{vehicle.model}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">연식</span>
                          <p className="font-semibold">{vehicle.year}년</p>
                        </div>
                        <div>
                          <span className="text-gray-500">주행거리</span>
                          <p className="font-semibold">{vehicle.mileage?.toLocaleString()}km</p>
                        </div>
                        <div>
                          <span className="text-gray-500">연료</span>
                          <p className="font-semibold">{vehicle.fuelType}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">배기량</span>
                          <p className="font-semibold">{vehicle.displacement}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        검사 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">검사 기관</span>
                          <p className="font-semibold">{vehicle.inspectionCenter}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">평가사</span>
                          <p className="font-semibold">{vehicle.evaluatorName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">검사일</span>
                          <p className="font-semibold">{vehicle.inspectionDate}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep("search")} className="flex-1">
                  다시 검색
                </Button>
                <Button onClick={handleProceedToCountrySelection} className="flex-1">
                  다음 단계
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: 국가 선택 */}
          {step === "country" && (
            <div className="space-y-6">
              <div className="text-center">
                <MapPin className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">수출 국가 선택</h3>
                <p className="text-gray-600">인증서를 발급받을 국가를 선택해주세요</p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium text-gray-700">
                    수출 국가 *
                  </label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="국가를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CERTIFICATE_TEMPLATES).map(([country, template]) => (
                        <SelectItem key={country} value={country}>
                          <div className="flex items-center gap-2">
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                      <CardDescription>{selectedTemplate.authority}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">언어</span>
                          <p className="font-semibold">{selectedTemplate.language}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">유효기간</span>
                          <p className="font-semibold">{selectedTemplate.validityPeriod}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">특징</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedTemplate.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                    이전
                  </Button>
                  <Button onClick={handlePreviewTemplate} disabled={!selectedCountry} className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    템플릿 미리보기
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 템플릿 미리보기 */}
          {step === "preview" && selectedTemplate && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">인증서 템플릿 미리보기</h3>
                <p className="text-gray-600">{selectedTemplate.name} 템플릿을 확인하세요</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 템플릿 미리보기 */}
                <div className="space-y-4">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg border bg-gray-100">
                    <img
                      src={selectedTemplate.preview || "/placeholder.svg"}
                      alt={`${selectedTemplate.name} 템플릿`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="text-center text-sm text-gray-500">* 실제 인증서와 다를 수 있습니다</p>
                </div>

                {/* 발급 정보 */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>발급 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-gray-500">차량</span>
                          <p className="font-semibold">
                            {vehicle?.make} {vehicle?.model} ({vehicle?.year})
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">VIN</span>
                          <p className="font-semibold font-mono">{vehicle?.vin}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">수출 국가</span>
                          <p className="font-semibold">{selectedCountry}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">발급 기관</span>
                          <p className="font-semibold">{selectedTemplate.authority}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">예상 처리 시간</span>
                          <p className="font-semibold">3-5 영업일</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">주의사항</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• 인증서 발급 후 수정이 불가능합니다</li>
                      <li>• 차량 정보가 정확한지 다시 한번 확인해주세요</li>
                      <li>• 발급 완료 시 이메일로 알림을 받으실 수 있습니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep("country")} className="flex-1">
                  이전
                </Button>
                <Button
                  onClick={handleApplyCertificate}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      신청 중...
                    </>
                  ) : (
                    "발급 신청"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: 신청 완료 */}
          {step === "complete" && (
            <div className="space-y-6 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">발급 신청 완료!</h3>
                <p className="text-gray-600">인증서 발급 신청이 성공적으로 접수되었습니다.</p>
              </div>

              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">신청 번호</span>
                      <span className="font-semibold">APP-{Date.now()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">신청일</span>
                      <span className="font-semibold">{new Date().toLocaleDateString("ko-KR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">예상 완료일</span>
                      <span className="font-semibold">
                        {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  신청 내역은 대시보드에서 확인하실 수 있습니다.
                  <br />
                  발급 완료 시 이메일로 알림을 보내드립니다.
                </p>
                <div className="flex gap-4 max-w-md mx-auto">
                  <Button variant="outline" onClick={() => router.push("/applications")} className="flex-1">
                    신청 내역 보기
                  </Button>
                  <Button onClick={onClose} className="flex-1">
                    확인
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
