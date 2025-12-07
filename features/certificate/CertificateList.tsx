"use client"

import { FileText, Calendar, Download, SearchIcon } from "lucide-react"
import { useCallback, useState, useEffect, useMemo } from "react"
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
import CertificateListHeader from "./CertificateListHeader"

export default function CertificateList() {
  const { isLoggedIn, user } = useAuthStore()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [isLocalSearchMode, setIsLocalSearchMode] = useState(false)
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [filterCountry, setFilterCountry] = useState<string | null>(null)

  // 클라이언트 사이드 필터링 함수
  const filterCertificates = useCallback((certs: Certificate[], searchTerm: string, country: string | null) => {
    return certs.filter((cert) => {
      // 검색어 필터링 (인증번호, 제조사, 모델명, VIN)
      const matchesSearch = !searchTerm || (
        cert.certNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.vin.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      // 국가 필터링
      const matchesCountry = !country || cert.country === country
      
      return matchesSearch && matchesCountry
    })
  }, [])

  // 현재 표시할 인증서 목록 결정
  const displayCertificates = useMemo(() => {
    // 검색어가 있으면 검색 결과(certificates) 사용, 없으면 전체 목록 사용
    if (search && search.trim()) {
      return certificates
    }
    // 검색어가 없으면 필터만 적용된 전체 목록 사용
    return filterCertificates(allCertificates, '', filterCountry)
  }, [search, certificates, allCertificates, filterCountry, filterCertificates])

  // 필터링된 인증서 목록 (헤더 정보 표시용)
  const filtered = useMemo(() => {
    return filterCertificates(allCertificates, search, filterCountry)
  }, [allCertificates, search, filterCountry, filterCertificates])

  // 하이브리드 검색 함수 (로컬 우선, 서버는 선택적)
  const performSearch = useCallback(async (searchTerm: string) => {
    // 검색어가 없으면 전체 목록 표시
    if (!searchTerm.trim()) {
      setCertificates(allCertificates)
      setIsLocalSearchMode(false)
      return
    }

    // 일단 로컬 검색 결과를 즉시 표시 (빠른 응답)
    const localResults = filterCertificates(allCertificates, searchTerm, filterCountry)
    setCertificates(localResults)
    setIsLocalSearchMode(true)
    
    console.log(`[CertificateList] 로컬 검색 완료: ${localResults.length}개 결과`)

    // 검색어가 충분히 길고 서버 검색을 시도할 가치가 있는 경우에만 서버 검색 시도
    if (searchTerm.trim().length >= 3) {
      try {
        setSearchLoading(true)
        console.log('[CertificateList] 서버 검색 시도 (백그라운드):', searchTerm)
        
        // 백그라운드에서 서버 검색 시도
        const searchResults = await CertificateService.searchCertificates(searchTerm, {
          country: filterCountry || undefined
        })
        
        // 서버 검색 성공 시 결과가 더 나은 경우에만 교체
        if (searchResults.length > 0) {
          setCertificates(searchResults)
          setIsLocalSearchMode(false)
          console.log(`[CertificateList] 서버 검색 성공으로 결과 업데이트: ${searchResults.length}개`)
        } else {
          console.log('[CertificateList] 서버 검색 결과가 없어 로컬 검색 결과 유지')
        }
        
      } catch (error) {
        // 서버 검색 실패해도 로컬 검색 결과가 이미 표시되어 있으므로 조용히 무시
        console.info('[CertificateList] 서버 검색 실패, 로컬 검색 결과 유지:', (error as any)?.message || String(error))
        
      } finally {
        setSearchLoading(false)
      }
    }
  }, [allCertificates, filterCountry, filterCertificates])

  // 인증서 전체 조회
  const fetchAllCertificates = useCallback(async () => {
    try {
      setLoading(true)
      const data = await CertificateService.getAllCertificates()
      setAllCertificates(data)
      setCertificates(data)
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

  // 국가 필터 변경 시 검색 재실행
  useEffect(() => {
    if (search && search.trim()) {
      performSearch(search)
    }
  }, [filterCountry, performSearch, search])

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 min-w-0 h-full overflow-y-auto">
      {/* 헤더 */}
      <CertificateListHeader
        search={search}
        setSearch={setSearch}
        filterCountry={filterCountry}
        setFilterCountry={setFilterCountry}
        onSearchSubmit={performSearch}
        isLoading={loading || searchLoading}
        totalCount={allCertificates.length}
        filteredCount={displayCertificates.length}
        isLocalSearchMode={isLocalSearchMode}
      />

      {/* 인증서 목록 */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            인증서 목록&nbsp;
            <span className="text-blue-600">{displayCertificates.length}개</span>
            {allCertificates.length !== displayCertificates.length && (
              <span className="text-gray-500 text-sm font-normal ml-2">
                (전체 {allCertificates.length}개 중)
              </span>
            )}
          </h3>
          {(search || filterCountry) && (
            <div className="text-sm text-gray-500">
              {searchLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>검색 중...</span>
                </div>
              ) : (
                <span>검색 결과</span>
              )}
            </div>
          )}
        </div>

        {/* 검색 상태 표시 */}
        {(loading || searchLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">
                {searchLoading ? '검색 중입니다...' : '데이터를 불러오는 중입니다...'}
              </p>
            </div>
          </div>
        )}

        {/* 인증서 목록 */}
        {!loading && !searchLoading && displayCertificates.length > 0 ? (
          <div className="flex flex-col gap-3">
            {displayCertificates.map((cert) => (
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
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-semibold truncate">
                          {cert.manufacturer || 'N/A'} {cert.modelName || 'N/A'}
                        </h4>
                        <span className="text-xs text-gray-500">{cert.manufactureYear || 'N/A'}</span>
                      </div>
                      <div className="font-mono text-xs text-gray-400 truncate">
                        인증번호: {cert.certNumber || 'N/A'}
                      </div>
                      <div className="font-mono text-xs text-gray-400 truncate">
                        VIN: {cert.vin || 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 ml-auto text-sm text-gray-600 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="hidden sm:inline">{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : 'N/A'}</span>
                        <span className="sm:hidden">{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="hidden sm:inline">{cert.country || 'N/A'}</span>
                        <span className="sm:hidden">{cert.country ? cert.country.slice(0, 2) : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="hidden sm:inline">만료: {cert.expireDate ? new Date(cert.expireDate).toLocaleDateString() : 'N/A'}</span>
                        <span className="sm:hidden">만료: {cert.expireDate ? new Date(cert.expireDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : !loading && !searchLoading ? (
          <div className="flex flex-col items-center gap-2 py-16 text-gray-500">
            <FileText className="h-10 w-10" />
            {search || filterCountry ? (
              <>
                <p className="text-lg">검색 결과가 없습니다.</p>
                <p className="text-sm text-gray-400">다른 검색어나 필터를 시도해보세요.</p>
              </>
            ) : (
              <>
                <p className="text-lg">등록된 인증서가 없습니다.</p>
                <p className="text-sm text-gray-400">새 인증서 발급 버튼을 클릭하여 인증서를 발급해보세요.</p>
              </>
            )}
          </div>
        ) : null}
      </section>
    </main>
  )
}
