import Sidebar from "@/components/common/Sidebar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-white min-w-[1024px] overflow-hidden">
      <Sidebar />
      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
