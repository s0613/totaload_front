import { AdminSidebar } from "@/features/admin/Sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="w-64 border-r bg-white flex-shrink-0">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
