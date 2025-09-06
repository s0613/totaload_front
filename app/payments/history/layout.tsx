import { Metadata } from "next"
import Sidebar from "@/components/common/Sidebar"

export const metadata: Metadata = {
  title: "결제 내역 | Totaro",
  description: "인증서 발급 결제 내역을 확인하세요",
}

export default function PaymentHistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
