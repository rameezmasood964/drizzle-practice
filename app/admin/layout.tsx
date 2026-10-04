import AdminSideBar from "@/components/layout/AdminSideBar"
export default function AdminLayout ({children}:{children:React.ReactNode}){

    return(

        <div className="flex flex-row">
            <AdminSideBar/>
            <main>{children}</main>
            
        </div>
    )


}