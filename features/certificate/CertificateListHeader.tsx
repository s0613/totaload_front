"use client"

import { SearchIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useAuthStore } from "@/lib/auth"
import { useEffect, useState, useCallback } from "react"

interface CertificateListHeaderProps {
  search: string
  setSearch: (v: string) => void
  filterCountry: string | null
  setFilterCountry: (v: string | null) => void
  onSearchSubmit?: (searchTerm: string) => void
  isLoading?: boolean
  totalCount?: number
  filteredCount?: number
  isLocalSearchMode?: boolean
}

export default function CertificateListHeader({ 
  search, 
  setSearch, 
  filterCountry,
  setFilterCountry,
  onSearchSubmit,
  isLoading = false,
  totalCount = 0,
  filteredCount = 0,
  isLocalSearchMode = false
}: CertificateListHeaderProps) {
  const { user } = useAuthStore()
  const [searchValue, setSearchValue] = useState(search)

  // 디바운스된 검색어 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== search) {
        setSearch(searchValue)
        if (onSearchSubmit) {
          onSearchSubmit(searchValue)
        }
      }
    }, 300) // 300ms 디바운스

    return () => clearTimeout(timer)
  }, [searchValue, search, setSearch, onSearchSubmit])

  // 검색어 초기화
  const clearSearch = useCallback(() => {
    setSearchValue("")
    setSearch("")
    if (onSearchSubmit) {
      onSearchSubmit("")
    }
  }, [setSearch, onSearchSubmit])

  // 필터 초기화
  const clearFilter = useCallback(() => {
    setFilterCountry(null)
  }, [setFilterCountry])

  // 국가 목록
  const countries = [
    "리비아",
    "키르기스탄", 
    "아랍에미리트",
    "요르단",
    "러시아",
    "알바니아",
    "타지키스탄",
    "카자흐스탄",
    "사우디아라비아",
    "오만",
    "캄보디아",
    "가나",
    "도미니카공화국",
    "과테말라",
    "나이제리아",
    "가봉",
    "세네갈",
    "그루지야"
  ]

  return (
    <header className="mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      {/* 좌측 타이틀 */}
      <div className="min-w-0">
        <h2 className="text-xl lg:text-2xl font-semibold">인증서 관리 시스템</h2>
        
        {/* 검색 결과 표시 */}
        {(search || filterCountry) && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-gray-600">
              {isLoading ? "검색 중..." : `${filteredCount}개 / 전체 ${totalCount}개`}
            </span>
          </div>
        )}
      </div>

      {/* 우측 검색·필터 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
        {/* 검색창 */}
        <div className="relative w-full sm:w-auto">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="w-full sm:w-64 pl-10 pr-10"
            placeholder="인증번호, 제조사, 모델명, VIN 검색"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={isLoading}
          />
          {/* 검색어 삭제 버튼 */}
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 h-7 w-7 p-0 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* 국가 필터 */}
        <div className="relative w-full sm:w-40">
          <Select 
            value={filterCountry || "all"} 
            onValueChange={(v) => setFilterCountry(v === "all" ? null : v)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="국가 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>수출 국가</SelectLabel>
                <SelectItem value="all">전체 국가</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {/* 필터 삭제 버튼 */}
          {filterCountry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="absolute right-8 top-1/2 h-6 w-6 p-0 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* 사용자 정보 표시 */}
        {user && (
          <div className="flex items-center gap-2 text-sm text-gray-600 w-full sm:w-auto justify-center sm:justify-start">
            <span>안녕하세요, {user.name}님</span>
          </div>
        )}
      </div>
    </header>
  )
}
