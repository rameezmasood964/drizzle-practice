import {pgTable,serial,text,integer,timestamp} from 'drizzle-orm/pg-core'


export const categoriesTable = pgTable('categories',{

    id: serial('id').primaryKey(),
    categoryname: text('categoryname').notNull(),
    category_slug: text('slug').notNull().unique(),
    createdat: timestamp('ccreatedat').defaultNow().notNull(),
    parentid : integer('parent_id').references (() : any => categoriesTable.id,{onDelete:'cascade'}) 
})