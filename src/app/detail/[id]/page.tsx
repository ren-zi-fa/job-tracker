import { ArrowLeft, Building } from "@phosphor-icons/react/dist/ssr";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/database/db";
import { sourceTable } from "@/database/models/schema";
import JobListings from "./components/JobListings";
import { TotalListingsBadge } from "./components/TotalListingsBadge";

async function getSource(id: string) {
  const sources = await db
    .select()
    .from(sourceTable)
    .where(eq(sourceTable.id, parseInt(id)));
  return sources[0];
}

export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const source = await getSource(id);
  if (!source) return notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 border-2 border-border bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal"
        >
          <ArrowLeft data-icon="inline-start" weight="bold" />
          Kembali ke Beranda
        </Link>

        <header className="mt-6 mb-10 flex items-center gap-4 border-b-2 border-border pb-6">
          <div className="flex size-14 shrink-0 items-center justify-center border-2 border-border bg-primary text-primary-foreground shadow-brutal">
            <Building weight="bold" className="size-7" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-black tracking-tight uppercase">
              {source.sourceName}
            </h1>
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              Detail lamaran dan lowongan
            </p>
            <TotalListingsBadge sourceId={source.id} />
          </div>
        </header>

        <JobListings sourceId={source.id} sourceName={source.sourceName} />
      </div>
    </main>
  );
}
