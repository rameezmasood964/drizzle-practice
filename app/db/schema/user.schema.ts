
import {pgTable,uuid,text,timestamp,pgEnum} from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', ['user', 'admin']);

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name'),
  phone: text('phone'),
  role: userRole('role').default('user').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
