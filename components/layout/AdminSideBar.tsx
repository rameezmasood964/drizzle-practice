
import Link from "next/link"
const AdminSideBar = () => {
  return (
    <aside className="w-64 h-screen bg-sidebar border-sidebar-border p-4">

        <div>
            <h1 className="text-xl font-bold text-sidebar-foreground mb-6">Admin Pannel</h1>
        </div>

        <nav className="flex flex-col gap-2">

            <Link className=" block px-4 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" href= "/admin">Dashboard</Link>
             <Link className="block px-4 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" href= "/admin/categories">Categories</Link>
            
        </nav>
    </aside>
  )
}

export default AdminSideBar