import { NextResponse } from "next/server";
import db from "@/database/db";
import { jobListingsTable } from "@/database/models/schema";
import { createListingApiSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createListingApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const [result] = await db
      .insert(jobListingsTable)
      .values(parsed.data)
      .returning();
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/listings failed:", err);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 },
    );
  }
}
