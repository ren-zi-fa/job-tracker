import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { jobListingsTable, sourceTable } from "@/database/models/schema";

export const statusEnum = z.enum([
  "Pending",
  "Applied",
  "Interview",
  "Rejected",
  "Accepted",
]);

// ---- Sources ----
export const insertSourceSchema = createInsertSchema(sourceTable, {
  sourceName: (schema) =>
    schema.trim().min(1, "Nama source wajib diisi").max(255),
});
export type InsertSourceInput = z.infer<typeof insertSourceSchema>;

// ---- Listings (API boundary: terima ISO string / Date, output Date) ----
// createInsertSchema(jobListingsTable) menghasilkan applicationDate: z.date()
// (hanya mau Date object) — itu penyebab error toISOString dulu.
// Override ke z.coerce.date() agar string ISO dari JSON ikut valid.
export const createListingApiSchema = createInsertSchema(jobListingsTable, {
  sourceId: z.coerce.number().int().positive("sourceId tidak valid"),
  company: (schema) => schema.trim().min(1, "Company wajib diisi").max(255),
  position: (schema) => schema.trim().min(1, "Position wajib diisi").max(255),
  companyLocation: (schema) =>
    schema.trim().min(1, "Location wajib diisi").max(255),
  status: statusEnum,
  applicationDate: z.coerce.date(),
});
export type CreateListingInput = z.infer<typeof createListingApiSchema>;

export const updateListingStatusSchema = z.object({
  status: statusEnum,
});
export type UpdateListingStatusInput = z.infer<
  typeof updateListingStatusSchema
>;