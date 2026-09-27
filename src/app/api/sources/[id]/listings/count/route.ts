import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/database/db";
import { jobListingsTable } from "@/database/models/schema";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sourceId = parseInt(id, 10);
  if (Number.isNaN(sourceId)) {
    return NextResponse.json({ error: "Invalid source id" }, { status: 400 });
  }

  const [{ total }] = await db
    .select({ total: count() })
    .from(jobListingsTable)
    .where(eq(jobListingsTable.sourceId, sourceId));

  return NextResponse.json({ total });
}
