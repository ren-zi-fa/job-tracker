import { count } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/database/db";
import { jobListingsTable } from "@/database/models/schema";

export async function GET() {
  const rows = await db
    .select({ status: jobListingsTable.status, count: count() })
    .from(jobListingsTable)
    .groupBy(jobListingsTable.status)
    .orderBy(jobListingsTable.status);

  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return NextResponse.json({ byStatus: rows, total });
}
