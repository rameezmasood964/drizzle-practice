"use server";

import { db } from "@/app/db";
import { categories } from "@/app/db/schema";
import { revalidatePath } from "next/cache";
import z from "zod";
import { createClient } from "@supabase/supabase-js";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/utils/constants";
import { flattenError } from "zod";
import { eq } from "drizzle-orm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// yeh rule book ha teacher neechy ha jo is rule book ky according cheezy dekhti ha
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().trim().toLowerCase().min(1, "slug is required"),
  parentId: z.string().nullable().optional(),
  icon: z.any().superRefine((file, ctx) => {
    if (!file || !(file instanceof File) || file.size === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please upload icon",
      });

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dont Upload more than 2MB File",
      });

      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please Upload only JPG,PNG,WEBp",
      });

      return;
    }
    console.log("Asal File Type yeh hai:", file.type);
  }),
});

export async function addcategory(prevState: any, formdata: FormData) {
  // yeh formdata ko javascript ky builtin function sy object mein convert kry ga
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
        parentId: rawdata.parentId,
      },
    };
  }

  const { name, slug, parentId: parentIdStr, icon: validFile } = result.data;

//   yah pr hmara jo parentid variable ha wo hmari jo vlue nikli ha result.data.parentid wali usy hmnny name dia parentidstr usy 
//   number mein convert krhy han mean parentID : "4"


  const parentId = parentIdStr && parentIdStr !== "root" && parentIdStr !== "0"
      ? parseInt(parentIdStr)
      : null;
      // yaha pr ulpoadicon variable bnya kion ky hmy image file name chye tha taky usy hm try catch mein handle kr sky 
  let uploadedFileName: string | null = null;

  try {
    // icon code here

    // yaha date.now isliye lgya ha ky kia pta differnt user same name ki file ulpoad kry to yeh uniuqe hoa datenow ki wjah sy
    const safeName = validFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileName = `${Date.now()}-${safeName}`;

    //  yaha pr hm await lgya h kion ky imgae jany mein time lgta ha jb image bucket emin ajye gi hmy 2 cheezy
    // mily gi error ya data is iye eeror likha yeh
    const { error } = await supabase.storage
      .from("categories_icons")
    //   validfile hmara icon ha or fileName jo hm ny oper bnya h basically hmaary icon ko is name sy uplaod krdo 
    // mean validfile mein icon ha hm ke rhy hain icon ko fileName sy upload krdo 
      .upload(fileName, validFile);

    if (error) {
  console.log("Mera Supabase ka Error:", error);
  return {
    success: false,
    message: error.message,
    inputs: { name, slug, parentId: parentIdStr },
  };
}

    // yah pr hmary pas jo filename tha hmny apny upploadedfilename mein rkh dia 
    uploadedFileName = fileName;


    // yah tk hmari file bucket mein chli gye ha or hm ny uska name bhii rkh lia ha 



        // -------------------Next Kam----------------------




    // is code mein basically hm apny categories_icon buckett ky pas jaty hain or kehty
    // jo filesave hoe ha uska publicurl bna kr doo uskiye bultin function use krty PublicUrl
    // to wo hmy wo link publicurldata mein deta h phir wah sy publicurl nikal kr
    // icon url mein kr lety

    const { data } = supabase.storage
      .from("categories_icons")
      .getPublicUrl(fileName);

    const iconUrl = data.publicUrl;

    await db.insert(categories).values({
      name,
      slug,
      parentId: parentId,
      icon: iconUrl,
    });

    revalidatePath("/admin/categories");

    return { success: true, message: "category added successfully" };


  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }


    // jb catch mein hmary pass error aye ga to hm suppabse mein jo file ha usy del kry gy isliye hm ny 
    // filename ko uploadedfilename mein rkha tha or let uploadedfile try sy bahir bnya tha kon ky agr try mein bnaty 
    // to sirf try mein acces kr skty thy isliiye abhir bnya or catch mein acess ho gya 


    if (uploadedFileName) {
      await supabase.storage
        .from("categories_icons")
        .remove([uploadedFileName]);
    }

    // 👈 Yahan hum error ya uske 'cause' (PostgresError) dono ko check kar rahe hain
    const pgError = error.cause || error;
    const errorCode = pgError.code || error.code;
    const errorDetail = (
      pgError.detail ||
      pgError.message ||
      error.message ||
      ""
    ).toLowerCase();
    const constraintName =
      pgError.constraint_name || error.constraint_name || "";

    console.log("Extracted Error Code:", errorCode);
    console.log("Extracted Error Detail:", errorDetail);

    if (errorCode === "23505") {
      if (constraintName === "categories_slug_unique") {
        return {
          success: false,
          errors: {
            slug: ["This slug already availble.kindly change your slug name"],
            name: undefined,
            icon: undefined,
            parentId: undefined,
          },
          inputs: { name, slug, parentId: parentIdStr },
        };
      }

      if (constraintName === "categories_name_lower_unique") {
        return {
          success: false,
          errors: {
            name: ["Category Name Already Available"],
            slug: undefined,
            icon: undefined,
            parentId: undefined,
          },
          inputs: { name, slug, parentId: parentIdStr },
        };
      }
    }

    console.error("SERVER ACTION CRITICAL ERROR:", error);

    return {
      success: false,
      message: "Internal server error. Please try again later.",
       inputs: { name, slug, parentId: parentIdStr },
    };
  }
}











// ........****************************************...................................

// update function 


// 1. Update ke liye schema (Icon yahan optional hai)






// Create (Add) Schema: Isme id nahi chahiye hoti (kyunki ID database ne banani hai).
// Update Schema: Isme id lazmi chahiye hoti hai (kyunki database ko batana hai ke kis record ko change karna hai).
const updateCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().trim().toLowerCase().min(1, "Slug is required"),
  parentId: z.string().nullable().optional(),
  icon: z.any().optional(),
});

export async function updatecategory(prevState: any, formdata: FormData) {
  const rawdata = Object.fromEntries(formdata);
  
  const result = updateCategorySchema.safeParse(rawdata);

  if (!result.success) {
    const formattedError = z.flattenError(result.error).fieldErrors;
    return {
      success: false,
      errors: formattedError,
      message: "Please fix the errors below.",
      inputs: { name: rawdata.name as string, slug: rawdata.slug as string, parentId: rawdata.parentId as string }, // 👈 Yeh add karein
    };
  }

  const { id, name, slug, parentId: parentIdStr, icon: newFile } = result.data;


  // yaha hm ny from sy aye hooye string id ko number mein convert kia 
  const categoryId = parseInt(id);

  const parentId = parentIdStr && parentIdStr !== "root" && parentIdStr !== "0"
    ? parseInt(parentIdStr)
    : null;


//     Agar admin ne naya file diya hai: Toh code us file ko Supabase Storage par
//  upload karta hai, wahan se uska naya URL milta hai, aur hum us URL ko 
// is uploadedFileName variable ke andar daal dete hain.

// Agar admin ne naya file nahi diya: Toh code database se purana 
// wala category record nikalta hai aur uska purana icon utha kar
//  is uploadedFileName variable mein daal deta hai.

  let uploadedFileName: string | null = null;

  try {
    // 1. Pehle database se purani category ka data fetch karein (icon URL ke liye)
    //2. db hmara database connection ha , query yeh drizzle ka api ha jo data fetch krta ha 
    //3. categories hmara databse men table ha 
    // 4. hm ny findFirst is liye lgya ha kion ky where ka kam ha search kro wo hmesah multiple object deta h array emin []
    // hmy chye 1 result  isliye hm findFirst use krty hain taky object mily {} jesy first object mly wo searching stop krdy 


    const existingCategory = await db.query.categories.findFirst({

      // eq mean equal 
      // // Baghair Destructuring Ke: where: (categories, operators) => operators.eq(categories.id, categoryId),
      // hmary pas eq ek operators ah or bhi kafi operators hoty ahin 
      // sb sy pehly data aya databse sy categories mein phir aya hmary parameter c mein phir hm ny check kia 
      // ky c.iid mean categories.id equal ho categoryid sy jo hmary form sy aye ha 

      where: (c, { eq }) => eq(c.id, categoryId),
    });

    if (!existingCategory) {
      return { success: false, message: "Category not found." };
    }


    // yeh icon url isliye likha agr admin icon change ni krta hmy datbase mein icon to bhejna ha isliye yeh likha
    let iconUrl = existingCategory.icon; // By default purana icon use hoga

    // 2. Agar user ne naya icon upload kiya hai
    if (newFile && newFile instanceof File && newFile.size > 0) {
      if (newFile.size > MAX_FILE_SIZE) {
        return { success: false, errors: { icon: ["Dont Upload more than 2MB File"] } };
      }
      if (!ALLOWED_IMAGE_TYPES.includes(newFile.type)) {
        return { success: false, errors: { icon: ["Please Upload only JPG,PNG,WEBp"] } };
      }

      const safeName = newFile.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const fileName = `${Date.now()}-${safeName}`;

      const { error } = await supabase.storage
        .from("categories_icons")
        .upload(fileName, newFile);

      if (error) {
        return { success: false,
           message: error.message,
            inputs: { name, slug, parentId: parentIdStr },
           };
      }

      uploadedFileName = fileName;

      const { data } = supabase.storage
        .from("categories_icons")
        .getPublicUrl(fileName);

      iconUrl = data.publicUrl;
    }

    // 3. Database update query
    await db.update(categories)
      .set({
        name,
        slug,
        parentId,
        icon: iconUrl,
      })
      .where(eq(categories.id, categoryId)); // Dhyan rahe yahan eq import hona chahiye dbal se ya eq operator use ho

    revalidatePath("/admin/categories");
    return { success: true, message: "Category updated successfully!" };

  } catch (error: any) {
    if (isRedirectError(error)) throw error;

    if (uploadedFileName) {
      await supabase.storage
        .from("categories_icons")
        .remove([uploadedFileName]);
    }

    const pgError = error.cause || error;
    const errorCode = pgError.code || error.code;
    const constraintName = pgError.constraint_name || error.constraint_name || "";

    if (errorCode === "23505") {
      if (constraintName === "categories_slug_unique") {
        return {
          success: false,
          errors: { slug: ["This slug already available. Kindly change your slug name."] },
          inputs: { name, slug, parentId: parentIdStr }, // 👈 Yeh add karein
        };
      }
      if (constraintName === "categories_name_lower_unique") {
        return {
          success: false,
          errors: { name: ["Category Name Already Available"] },
          inputs: { name, slug, parentId: parentIdStr }, // 👈 Yeh add karein
        };
      }
    }

    console.error("SERVER ACTION CRITICAL ERROR (UPDATE):", error);
    return {
      success: false,
      message: "Internal server error. Please try again later.",
    };
  }
}