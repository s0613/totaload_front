"use client"

import { Bell, SearchIcon, User, Settings, LogOut } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/auth"
import { useRouter } from "next/navigation"

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

interface CarListHeaderProps {
  search: string
  setSearch: (v: string) => void
  setFilterCountry: (v: string | null) => void
  vehicles: Vehicle[]
}

export default function CarListHeader({ search, setSearch, setFilterCountry, vehicles }: CarListHeaderProps) {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleSettingsClick = () => {
    router.push("/profile/settings")
  }

  return (
    <header className="mb-8 flex flex-row items-center justify-between flex-wrap gap-6">
      {/* 좌측 타이틀 */}
      <div>
        <h2 className="text-2xl font-semibold">인증서 발급 시스템</h2>
        <p className="text-gray-500">수출자동차품질인증서 (ISO 17024)</p>
      </div>

      {/* 우측 검색·필터·알림·프로필 */}
      <div className="flex flex-row items-center flex-wrap gap-4">
        {/* 검색창 */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="w-64 pl-10"
            placeholder="차대번호 또는 모델명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 국가 필터 */}
        <Select onValueChange={(v) => setFilterCountry(v || null)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="국가 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>수출 국가</SelectLabel>
              {Array.from(new Set(vehicles.map((v) => v.country))).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </header>
  )
}
