import { pgTable, serial, varchar, text, timestamp, numeric } from 'drizzle-orm/pg-core';

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const journal = pgTable('journal', {
  id: serial('id').primaryKey(),
  date: varchar('date', { length: 255 }).notNull(),
  pair: varchar('pair', { length: 255 }).notNull(),
  pnlUsd: numeric('pnl_usd', { precision: 10, scale: 2 }).notNull(),
  usdToPhp: numeric('usd_to_php', { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
