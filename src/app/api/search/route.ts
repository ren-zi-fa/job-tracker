import { desc } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/database/db";
import { jobListingsTable, sourceTable } from "@/database/models/schema";

export async function GET() {
  const rows = await db
    .select({
      id: jobListingsTable.id,
      sourceId: jobListingsTable.sourceId,
      sourceName: sourceTable.sourceName,
      company: jobListingsTable.company,
      position: jobListingsTable.position,
      companyLocation: jobListingsTable.companyLocation,
      status: jobListingsTable.status,
    })
    .from(jobListingsTable)
    .innerJoin(sourceTable, eq(jobListingsTable.sourceId, sourceTable.id))
    .orderBy(desc(jobListingsTable.applicationDate), desc(jobListingsTable.id))
    .limit(1000);

  return NextResponse.json(rows);
}
