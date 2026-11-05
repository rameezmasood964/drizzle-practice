import AdminSideBar from "@/components/layout/Admin/AdminSideBar"
import { Toaster } from "@/components/ui/sonner"
export default function AdminLayout({ children }: { children: React.ReactNode }) {

    return (

        <div className="flex flex-row">
            <AdminSideBar />
            <main>{children}</main>
            <Toaster />

        </div>
    )


}