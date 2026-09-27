import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import db from "@/database/db";
import { jobListingsTable } from "@/database/models/schema";
import { updateListingStatusSchema } from "@/lib/validation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const listingId = parseInt(id, 10);
  if (Number.isNaN(listingId)) {
    return NextResponse.json({ error: "Invalid listing id" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = updateListingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid status", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { status } = parsed.data;

  const [updated] = await db
    .update(jobListingsTable)
    .set({ status })
    .where(eq(jobListingsTable.id, listingId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
