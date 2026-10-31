import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/database/db";
import { scrapedJobsTable } from "@/database/models/schema";
import { getLocation } from "@/lib/locations";
import { scrapePlatform } from "@/lib/scraping";
import { PLATFORMS, type Platform } from "@/lib/scraping/types";
import { lowonganRefreshSchema } from "@/lib/validation";

const COOLDOWN_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = lowonganRefreshSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload tidak valid", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { wilayah } = parsed.data;
  const location = getLocation(wilayah);
  const results: {
    platform: Platform;
    added: number;
    skippedCooldown?: boolean;
    error?: string;
  }[] = [];

  for (const platform of PLATFORMS) {
    const last = await db
      .select({ scrapedAt: scrapedJobsTable.scrapedAt })
      .from(scrapedJobsTable)
      .where(
        and(
          eq(scrapedJobsTable.platform, platform),
          eq(scrapedJobsTable.wilayah, wilayah),
        ),
      )
      .orderBy(desc(scrapedJobsTable.scrapedAt))
      .limit(1);

    const lastScrapedAt = last[0]?.scrapedAt;
    if (lastScrapedAt && Date.now() - lastScrapedAt.getTime() < COOLDOWN_MS) {
      results.push({ platform, added: 0, skippedCooldown: true });
      continue;
    }

    const result = await scrapePlatform({ platform, location });

    if (result.error) {
      results.push({ platform, added: 0, error: result.error });
      continue;
    }

    let added = 0;
    for (const job of result.jobs) {
      try {
        const inserted = await db
          .insert(scrapedJobsTable)
          .values({
            platform: job.platform,
            title: job.title,
            company: job.company,
            location: job.location,
            wilayah: job.wilayah,
            salary: job.salary ?? null,
            jobType: job.jobType ?? null,
            url: job.url,
            externalId: job.externalId,
            postedAt: job.postedAt ? new Date(job.postedAt) : null,
            scrapedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [scrapedJobsTable.platform, scrapedJobsTable.externalId],
            set: {
              title: job.title,
              company: job.company,
              location: job.location,
              salary: job.salary ?? null,
              jobType: job.jobType ?? null,
              url: job.url,
              postedAt: job.postedAt ? new Date(job.postedAt) : null,
              scrapedAt: new Date(),
            },
          })
          .returning({ id: scrapedJobsTable.id });
        if (inserted.length > 0) added += 1;
      } catch (err) {
        console.error(`Gagal upsert ${platform}/${job.externalId}:`, err);
      }
    }

    results.push({ platform, added });
  }

  return NextResponse.json({ results, wilayah });
}
