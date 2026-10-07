'use server'


import { db } from "@/app/db";
import { categories } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import z from "zod";
import { createClient } from "@supabase/supabase-js";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/utils/constants";
import { flattenError } from "zod";


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!

);

// yeh rule book ha teacher neechy ha jo is rule book ky according cheezy dekhti ha 
const categorySchema = z.object({

    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, "slug is required"),
    parentId: z.string().nullable().optional(),
    icon: z.any().superRefine((file, ctx) => {

        if (!file || !(file instanceof File) || file.size === 0) {

            ctx.addIssue({

                code: z.ZodIssueCode.custom,
                message: "Please upload icon"
            })

            return;
        }


        if (file.size > MAX_FILE_SIZE) {

            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Dont Upload more than 2MB File"
            })

            return;
        }


        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {

            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please Upload only JPG,PNG,WEBp"
            })

            return;
        }
            console.log("Asal File Type yeh hai:", file.type);

    })
})



export async function addcategory(prevState: any, formdata: FormData) {

    // yeh formdata ko js ky builtin function sy object mein convert kry ga 
    const rawdata = Object.fromEntries(formdata);
    const result = categorySchema.safeParse(rawdata);

    if (!result.success) {
        const formatedError = z.flattenError(result.error).fieldErrors;
        return {
            success: false,
            errors: formatedError,
            message: "Please fix the errors below.",
           inputs: { 
                name: rawdata.name, 
                slug: rawdata.slug, 
                parentId: rawdata.parentId 
            }
        };
    }

     const { name, slug, parentId: parentIdStr, icon: validFile } = result.data;
        const parentId = parentIdStr && parentIdStr !== "root"  && parentIdStr!== "0"? parseInt(parentIdStr) : null;

    try {

        // yeh data student ha jo user ky form submit krny pr mila ha 
        // const name = formdata.get("name") as string;
        // const slug = formdata.get("slug") as string;
        // const parentIdStr = formdata.get("parentId") as string;
        // const parentId = parentIdStr && parentIdStr !== "root" ? parseInt(parentIdStr) : null
        // const iconFile = formdata.get("icon") as File | null;


        // ISAY RAKHNA HAI:
       


        // yeh teacher ha jo sudent ky data ko rulebbok ky according check krta ha to student(formdata) ky variable 
        // ka data yaha aye ga 

        // const result = categorySchema.safeParse({
        //     name,
        //     slug,
        //     parentId: parentIdStr,
        //     icon: iconFile
        // })

        // if (!result.success) {
        //     // Zod ka pehla error message nikal karclient ko bhej rahe hain
        //     console.log("zod schema ka result", result.error);

        //     const formatedError = z.flattenError(result.error).fieldErrors
        //     console.log("formated error", formatedError)
        //     // const firstError = result.error.issues[0]?.message || "Validation failed"

        //     // const firstError = result.error.issues[0]?.message || "Validation failed";


        //     return {
        //         success: false,
        //         errors: formatedError,
        //         message: "Please fix the errors below."
        //     };
        // }


        // icon code here 


        // 3. BEST PRACTICE: Zod ke pass ki hui file ko use karo (`result.data.icon`)
        // Yahan TypeScript ko pata hai ke yeh 100% File hai, koi casting ya jhoot ki zaroorat nahi!
        // or result hmary pas ay ha zode  safeparse sy


        // yaha date.now isliye lgya ha ky kia pta differnt user same name ki file ulpoad kry to yeh uniuqe hoa datenow ki wjah sy
        const fileName = `${Date.now()} - ${validFile.name}`


        //  yaha pr hm await lgya h kion ky imgae jany mein time lgta ha jb image bucket emin ajye gi hmy 2 cheezy 
        // mily gi error ya data is iye eeror likha yeh 
        const { error } = await supabase.storage
            .from("categories_icons")
            .upload(fileName, validFile)

        if (error) {
            console.log("Mera Supabase ka Error:", error);
            return { success: false, message: error.message };
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



    catch (error : any) {
        if (isRedirectError(error)) {

            throw error;
        }
        

        if (error.code == "23505" && error.constraint_name =="'categories_slug_unique"){



            if (error.constraint_name.includes('slug')) {
                return {
                    success: false,
                    errors: {
                        slug: ["This slug already availble.kindly change your slug name"],
                        name: undefined,
            icon: undefined,
            parentId: undefined
                    },
                    inputs: { name, slug, parentId }
                };
            }


            if (error.constraint_name.includes('name')) {
                return {
                    success: false,
                    errors: {
                        name: ["Category Name Already Available"],
                        slug: undefined,
            icon: undefined,
            parentId: undefined
                    },
                    inputs: { name, slug, parentId }
                };
            }
        }

        console.error("SERVER ACTION CRITICAL ERROR:", error);


        return {

            success: false,
            message: "Internal server error. Please try again later."
        }



    }
}