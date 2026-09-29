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

export const categorylists = pgTable('categorylists', {

    list_id: serial('list_id').primaryKey(),
   
   title : text('text').notNull(),
   phone_no : text('phone_no').notNull(),
   address: text('address').notNull(),

   category_id : integer('category_id').references(() : any => categoriesTable.category_id,{onDelete :'cascade'}).notNull()
    
})


// specific detail table 

export const hostelDetails = pgTable('hostel_details', {
    detail_id: serial('detail_id').primaryKey(),
    list_id: integer('list_id')
        .references((): any => categorylists.list_id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    
    // Yeh batayega ke yeh Boys ka hai ya Girls ka
    hostel_type: text('hostel_type').notNull(), // 'boys' ya 'girls'
    
    // Common Attributes (Jo dono ke liye lazmi hain)
    monthly_rent: integer('monthly_rent').notNull(),
    room_type: text('room_type').notNull(),
 
    // Common Amenities (Dono ke liye)
   
    mess_facility: boolean('mess_facility').default(false).notNull(),
    wifi_available: boolean('wifi_available').default(true).notNull(),
    has_fridge: boolean('has_fridge').default(false).notNull(),
    has_washing_machine: boolean('has_washing_machine').default(false).notNull(),

    // --- SPECIFIC FIELDS (Jo kisi ek ke liye khas hain, inke sath .notNull() nahi hoga) ---
    
    // Sirf Boys ke liye (Girls ke liye yeh false ya null ho sakta hai)
    parking_space: boolean('parking_space').default(false), 

    // Sirf Girls ke liye 
    security_guard: boolean('security_guard').default(true),
    pick_and_drop: boolean('pick_and_drop').default(false),
});
// Doctor Details Table
export const doctorDetails = pgTable('doctor_details', {
    detail_id: serial('detail_id').primaryKey(),
    list_id: integer('list_id').references((): any => categorylists.list_id, { onDelete: 'cascade' }).notNull().unique(),
    specialization: text('specialization').notNull(), // e.g., Skin Specialist, Child Specialist
    consultation_fee: integer('consultation_fee').notNull(),
    clinic_timings: text('clinic_timings').notNull(), // e.g., 5:00 PM - 9:00 PM
     
});

// Lawyer Details Table
export const lawyerDetails = pgTable('lawyer_details', {
    detail_id: serial('detail_id').primaryKey(),
    list_id: integer('list_id').references((): any => categorylists.list_id, { onDelete: 'cascade' }).notNull().unique(),
    expertise: text('expertise').notNull(), // e.g., Criminal, Civil, Family Case
    experience_years: integer('experience_years').notNull(), // Kitne saal ka tajurba hai
  
});