import { count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/database/db";
import { scrapedJobsTable } from "@/database/models/schema";
import { lowonganQuerySchema } from "@/lib/validation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = lowonganQuerySchema.safeParse({
    wilayah: searchParams.get("wilayah") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Query tidak valid", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { wilayah, page, limit } = parsed.data;
  const offset = (page - 1) * limit;
  const where = eq(scrapedJobsTable.wilayah, wilayah);

  const rows = await db
    .select()
    .from(scrapedJobsTable)
    .where(where)
    .orderBy(desc(scrapedJobsTable.scrapedAt), desc(scrapedJobsTable.id))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  const [{ total }] = await db
    .select({ total: count() })
    .from(scrapedJobsTable)
    .where(where);

  const lastUpdatedRows = await db
    .select({ lastUpdated: scrapedJobsTable.scrapedAt })
    .from(scrapedJobsTable)
    .where(where)
    .orderBy(desc(scrapedJobsTable.scrapedAt))
    .limit(1);

  return NextResponse.json({
    jobs: data,
    hasMore,
    nextPage: page + 1,
    total,
    lastUpdatedAt: lastUpdatedRows[0]?.lastUpdated ?? null,
  });
}
