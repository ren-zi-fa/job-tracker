import { notFound } from "next/navigation";
import db from "@/database/db";
import { sourceTable } from "@/database/models/schema";
import { eq } from "drizzle-orm";
import JobListings from "./components/JobListings";
import { AddListingDialog } from "./components/AddListingDialog";

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
    <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Kembali ke Beranda
        </a>

        <header className="mt-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Building"><title>Building</title><path d="M4 22h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v13a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2ZM2 9h20"/><path d="M20 9V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4"/></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight dark:text-white">
                {source.sourceName}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Detail lamaran dan lowongan
              </p>
            </div>
          </div>
        </header>

        <div className="mb-6 flex justify-end">
          <AddListingDialog sourceId={source.id} sourceName={source.sourceName} />
        </div>

        <JobListings sourceId={source.id} sourceName={source.sourceName} />
      </div>
    </main>
  );
}
