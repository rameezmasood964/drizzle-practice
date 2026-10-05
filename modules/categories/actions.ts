
import { db } from "@/app/db";
import { categories } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import z from "zod";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!

);

// yeh rule book ha teacher neechy ha jo is rule book ky according cheezy dekhti ha 
const categorySchema = z.object({

    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, "slug is required"),
    parentId: z.string().nullable().optional(),
    icon: z.any().refine((file) => file instanceof File && file.size > 0, {
        message: "icon uploaded succesfully"
    })
})



export async function addcategory(formdata: FormData) {


    // yeh data student ha jo user ky form submit krny pr mila ha 
    const name = formdata.get("name") as string;
    const slug = formdata.get("slug") as string;
    const parentIdStr = formdata.get("parentId") as string;
    const parentId = parentIdStr && parentIdStr !== "root" ? parseInt(parentIdStr) : null
    const iconFile = formdata.get("icon") as File | null;



    // yeh teacher ha jo sudent ky data ko rulebbok ky according check krta ha to student(formdata) ky variable 
    // ka data yaha aye ga 

    const result = categorySchema.safeParse({
        name,
        slug,
        parentId: parentIdStr,
        icon: iconFile
    })

    if (!result.success) {
        return { success: false, error: result.error.format() }
    }


    // icon code here 


// 3. BEST PRACTICE: Zod ke pass ki hui file ko use karo (`result.data.icon`)
    // Yahan TypeScript ko pata hai ke yeh 100% File hai, koi casting ya jhoot ki zaroorat nahi!
    // or result hmary pas ay ha zode  safeparse sy
    const validFile = result.data.icon;

    // yaha date.now isliye lgya ha ky kia pta differnt user same name ki file ulpoad kry to yeh uniuqe hoa datenow ki wjah sy
    const fileName = `${Date.now()} - ${validFile.name}`


    //  yaha pr hm await lgya h kion ky imgae jany mein time lgta ha jb image bucket emin ajye gi hmy 2 cheezy 
    // mily gi error ya data is iye eeror likha
    const { error } = await supabase.storage
        .from("categories_icons")
        .upload(fileName, validFile)

    if (error) {
        return { success: false, error: { _errors: [error.message] } }
    }
    



    // is code mein basically hm apny categories_icon buckett ky pas jaty hain or kehty 
    // jo filesave hoe ha uska publicurl bna kr doo uskiye bultin function use krty PublicUrl 
    // to wo hmy wo link publicurldata mein deta h phir wah sy publicurl nikal kr 
    // icon url mein kr lety 

    const { data: PublicUrlData } = supabase.storage
        .from("categories_icons")
        .getPublicUrl(fileName)

         const iconUrl = PublicUrlData.publicUrl;









await db.insert(categories).values({
    name,
    slug,
    parentId: parentId,
    icon: iconUrl


})

revalidatePath("/admin/categories")
return { success: true, message: "category added successfully" };
}