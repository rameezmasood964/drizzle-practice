import {pgTable,serial,text,integer,timestamp,boolean} from 'drizzle-orm/pg-core'





// categories table 
export const categoriesTable = pgTable('categories',{

    category_id: serial('id').primaryKey(),
    categoryname: text('categoryname').notNull(),
    category_slug: text('slug').notNull().unique(),
    createdat: timestamp('ccreatedat').defaultNow().notNull(),
    parentid : integer('parent_id').references (() : any => categoriesTable.category_id,{onDelete:'cascade'}) 
})



// listes table 

export const itemslists = pgTable('itemslists', {

    list_id: serial('list_id').primaryKey(),
   
   title : text('text').notNull(),
   phone_no : text('phone_no').notNull(),
   address: text('address').notNull(),

   category_id : integer('category_id').references(() : any => categoriesTable.category_id,{onDelete :'cascade'}).notNull()
    
})




// images table 

export const listingImages = pgTable('listing_images', {
    image_id: serial('image_id').primaryKey(),
    
    // Kis listing ki tasveer hai? (Master list se link)
    list_id: integer('list_id')
        .references((): any => itemslists.list_id, { onDelete: 'cascade' })
        .notNull(),
    
    image_url: text('image_url').notNull(), // Cloudinary ya AWS S3 ka image link
    
    // Yeh optional hai, agar aap batana chahein ke yeh main/cover photo hai ya nahi
    is_primary: boolean('is_primary').default(false).notNull(),
});





// hostel boys and girsl detai in one table 

export const hostelDetails = pgTable('hostel_details', {
    detail_id: serial('detail_id').primaryKey(),
    list_id: integer('list_id')
        .references((): any => itemslists.list_id, { onDelete: 'cascade' })
        .notNull()
        .unique(),

    // Common Attributes (Jo dono ke liye lazmi hain)
    monthly_rent: integer('monthly_rent').notNull(),
    room_type: text('room_type').notNull(),
 
   
    mess_facility: boolean('mess_facility').default(false).notNull(),
    wifi_available: boolean('wifi_available').default(true).notNull(),
    has_fridge: boolean('has_fridge').default(false).notNull(),
    has_washing_machine: boolean('has_washing_machine').default(false).notNull(),

    

    // Sirf Boys ke liye (Girls ke liye yeh false ya null ho sakta hai)
    parking_space: boolean('parking_space').default(false), 

    // Sirf Girls ke liye 
    security_guard: boolean('security_guard').default(false),
 
});
// Doctor Details Table
export const doctorDetails = pgTable('doctor_details', {
    detail_id: serial('detail_id').primaryKey(),
    list_id: integer('list_id').references((): any => itemslists.list_id, { onDelete: 'cascade' }).notNull().unique(),
    specialization: text('specialization').notNull(), // e.g., Skin Specialist, Child Specialist
    consultation_fee: integer('consultation_fee').notNull(),
    clinic_timings: text('clinic_timings').notNull(), // e.g., 5:00 PM - 9:00 PM
    description: text('about_self').notNull()
     
});

// Lawyer Details Table
export const lawyerDetails = pgTable('lawyer_details', {
    detail_id: serial('detail_id').primaryKey(),
    list_id: integer('list_id').references((): any => itemslists.list_id, { onDelete: 'cascade' }).notNull().unique(),
    expertise: text('expertise').notNull(), // e.g., Criminal, Civil, Family Case
    experience_years: integer('experience_years').notNull(), // Kitne saal ka tajurba hai
     description: text('about_self').notNull()
  
});