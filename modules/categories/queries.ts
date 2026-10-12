
import { db } from "@/app/db";
import { categories } from "@/app/db/schema";

export async function getCategories (){

    try {
        const data = await db.select().from(categories);
           console.log("categories ka data ", data)
        return data;
     
    }
    catch (error){
        console.error("categories fetch krty hoye error", error);
        return[];

    }
}