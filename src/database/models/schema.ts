import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const sourceTable = pgTable("source", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sourceName: varchar({ length: 255 }).notNull(),
});

export const jobListingsTable = pgTable("job_listings", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sourceId: integer()
    .notNull()
    .references(() => sourceTable.id),
  company: varchar({ length: 255 }).notNull(),
  position: varchar({ length: 255 }).notNull(),
  companyLocation: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 255 }).notNull(),
  applicationDate: timestamp().notNull(),
});

export const scrapedJobsTable = pgTable(
  "scraped_jobs",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    platform: varchar({ length: 50 }).notNull(),
    title: varchar({ length: 255 }).notNull(),
    company: varchar({ length: 255 }).notNull(),
    location: varchar({ length: 255 }).notNull(),
    wilayah: varchar({ length: 50 }).notNull(),
    salary: varchar({ length: 255 }),
    jobType: varchar({ length: 255 }),
    url: text().notNull(),
    externalId: varchar({ length: 255 }).notNull(),
    postedAt: timestamp(),
    scrapedAt: timestamp().notNull(),
  },
  (table) => [
    uniqueIndex("scraped_jobs_platform_external_idx").on(
      table.platform,
      table.externalId,
    ),
  ],
);
