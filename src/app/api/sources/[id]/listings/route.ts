import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/database/db";
import { jobListingsTable } from "@/database/models/schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  const listings = await db
    .select()
    .from(jobListingsTable)
    .where(eq(jobListingsTable.sourceId, parseInt(id)))
    .orderBy(desc(jobListingsTable.applicationDate), desc(jobListingsTable.id))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = listings.length > limit;
  const data = hasMore ? listings.slice(0, limit) : listings;

  return NextResponse.json({
    listings: data,
    hasMore,
    nextPage: page + 1,
  });
}
