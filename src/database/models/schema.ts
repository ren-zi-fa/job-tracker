import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const sourceTable = pgTable("source", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sourceName: varchar({ length: 255 }).notNull(),
});

export const jobListingsTable = pgTable("job_listings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sourceId: integer().notNull().references(() => sourceTable.id),
  company: varchar({ length: 255 }).notNull(),
  position: varchar({ length: 255 }).notNull(),
  companyLocation: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 255 }).notNull(),
  applicationDate: timestamp().notNull(),
});
