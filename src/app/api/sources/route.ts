import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/database/db";
import { jobListingsTable, sourceTable } from "@/database/models/schema";
import { insertSourceSchema } from "@/lib/validation";

export async function GET() {
  const sources = await db
    .select({
      id: sourceTable.id,
      sourceName: sourceTable.sourceName,
      listingCount: count(jobListingsTable.id),
    })
    .from(sourceTable)
    .leftJoin(
      jobListingsTable,
      eq(jobListingsTable.sourceId, sourceTable.id),
    )
    .groupBy(sourceTable.id, sourceTable.sourceName)
    .orderBy(sourceTable.id);
  return NextResponse.json(sources);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = insertSourceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const [result] = await db.insert(sourceTable).values(parsed.data).returning();
  return NextResponse.json(result, { status: 201 });
}
