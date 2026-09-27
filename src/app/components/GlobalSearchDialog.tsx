"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { Document } from "flexsearch";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher, searchKey } from "@/lib/swr";

interface SearchDoc {
  id: number;
  sourceId: number;
  sourceName: string;
  company: string;
  position: string;
  companyLocation: string;
  status: string;
  [key: string]: string | number;
}

type EnrichedResult = {
  field: string;
  result: number[];
};

const statusClass: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Applied: "bg-blue-100 text-blue-800 border-blue-200",
  Interview: "bg-purple-100 text-purple-800 border-purple-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  Accepted: "bg-green-100 text-green-800 border-green-200",
};

export function GlobalSearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const { data: docs = [], isLoading } = useSWR<SearchDoc[]>(
    open ? searchKey : null,
    fetcher,
  );

  const byId = useMemo(() => {
    const map = new Map<number, SearchDoc>();
    for (const doc of docs) map.set(doc.id, doc);
    return map;
  }, [docs]);

  const index = useMemo(() => {
    const idx = new Document({
      tokenize: "forward",
      document: {
        id: "id",
        index: [
          "company",
          "position",
          "companyLocation",
          "status",
          "sourceName",
        ],
      },
    });
    for (const doc of docs) idx.add(doc);
    return idx;
  }, [docs]);

  const results = useMemo<SearchDoc[]>(() => {
    const q = deferredQuery.trim();
    if (!q) return docs.slice(0, 8);
    const hits = index.search(q, { enrich: true }) as unknown as
      | EnrichedResult[]
      | number[];
    // FlexSearch Document.search with enrich:true returns per-field groups;
    // without store it returns plain ids. Handle both shapes.
    const ids: number[] = Array.isArray(hits)
      ? (hits as EnrichedResult[]).flatMap((h) =>
          typeof h === "number" ? [h] : (h.result ?? []),
        )
      : [];
    const seen = new Set<number>();
    const out: SearchDoc[] = [];
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      const doc = byId.get(Number(id));
      if (doc) out.push(doc);
      if (out.length >= 20) break;
    }
    return out;
  }, [deferredQuery, docs, index, byId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <MagnifyingGlass className="size-4" />
            Cari lamaran…
          </Button>
        }
      />
      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Cari lamaran</DialogTitle>
          <DialogDescription>
            Cari perusahaan, posisi, lokasi, atau sumber. Klik hasil untuk
            lompat ke halaman detail.
          </DialogDescription>
        </DialogHeader>

        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="cth: engineer, jakarta, linkedin…"
        />

        {isLoading ? (
          <div className="space-y-2 py-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : results.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-400">
            {deferredQuery.trim()
              ? `Tidak ada hasil untuk "${deferredQuery.trim()}".`
              : "Belum ada lamaran untuk dicari."}
          </p>
        ) : (
          <>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {deferredQuery.trim()
                ? `${results.length} hasil`
                : `Terbaru — ${results.length} lamaran`}
            </p>
            <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
              {results.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/detail/${doc.sourceId}#listing-${doc.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-md border border-border p-3 transition-colors hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {doc.company}
                    </p>
                    <div className="flex shrink-0 items-center gap-1">
                      <Badge
                        variant="outline"
                        className={statusClass[doc.status] || ""}
                      >
                        {doc.status}
                      </Badge>
                      <Badge variant="secondary">{doc.sourceName}</Badge>
                    </div>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {doc.position} — {doc.companyLocation}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
