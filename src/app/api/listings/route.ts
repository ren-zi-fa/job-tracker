import { NextResponse } from "next/server";
import db from "@/database/db";
import { jobListingsTable } from "@/database/models/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { sourceId, company, position, companyLocation, status, applicationDate } =
    await req.json();
  const [result] = await db
    .insert(jobListingsTable)
    .values({ sourceId, company, position, companyLocation, status, applicationDate })
    .returning();
  return NextResponse.json(result, { status: 201 });
}
