
import {pgTable,serial,text,timestamp} from 'drizzle-orm/pg-core'


export const userTable = pgTable('users',{

id: serial('id').primaryKey(),
name: text('name').notNull(),
email: text('email').notNull().unique(),
createdat : timestamp('created_at').defaultNow().notNull(),



})