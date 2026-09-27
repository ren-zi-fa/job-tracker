import { NextResponse } from "next/server";
import db from "@/database/db";
import { sourceTable } from "@/database/models/schema";

export async function GET() {
  const sources = await db.select().from(sourceTable).orderBy(sourceTable.id);
  return NextResponse.json(sources);
}

export async function POST(req: Request) {
  const { sourceName } = await req.json();
  const [result] = await db
    .insert(sourceTable)
    .values({ sourceName })
    .returning();
  return NextResponse.json(result, { status: 201 });
}
