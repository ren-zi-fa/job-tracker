import db from "../db";
import { sourceTable, jobListingsTable } from "./schema";

async function main() {
  await db.insert(sourceTable).values([
    { sourceName: "LinkedIn" },
    { sourceName: "Jobstreet" },
    { sourceName: "Kalibrr" },
    { sourceName: "Indeed" },
  ]).returning();

  await db.insert(jobListingsTable).values([
    { sourceId: 1, company: "PT Google Indonesia", position: "Software Engineer", companyLocation: "Jakarta", status: "Applied", applicationDate: new Date("2026-09-01") },
    { sourceId: 1, company: "PT Gojek", position: "Product Manager", companyLocation: "Jakarta", status: "Interview", applicationDate: new Date("2026-09-05") },
    { sourceId: 2, company: "PT Tokopedia", position: "Data Analyst", companyLocation: "Bandung", status: "Applied", applicationDate: new Date("2026-09-10") },
    { sourceId: 3, company: "PT Traveloka", position: "UX Designer", companyLocation: "Jakarta", status: "Rejected", applicationDate: new Date("2026-09-15") },
  ]).returning();

  console.log("Seed data inserted successfully!");
}

main().catch(console.error);
