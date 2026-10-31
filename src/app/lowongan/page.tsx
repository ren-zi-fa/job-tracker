"use client";

import {
  ArrowLeft,
  ArrowSquareOut,
  ArrowsClockwise,
  Lightbulb,
  MagnifyingGlass,
  MapPin,
  Money,
  Suitcase,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LOCATIONS } from "@/lib/locations";
import type { Platform } from "@/lib/scraping/types";
import { fetcher, lowonganKey } from "@/lib/swr";

interface ScrapedJob {
  id: number;
  platform: Platform;
  title: string;
  company: string;
  location: string;
  wilayah: string;
  salary: string | null;
  jobType: string | null;
  url: string;
  externalId: string;
  postedAt: string | null;
  scrapedAt: string;
}

interface LowonganPage {
  jobs: ScrapedJob[];
  hasMore: boolean;
  nextPage: number;
  total: number;
  lastUpdatedAt: string | null;
}

interface RefreshResult {
  results: {
    platform: Platform;
    added: number;
    skippedCooldown?: boolean;
    error?: string;
  }[];
}

const platformMeta: Record<
  Platform,
  { label: string; icon: React.ElementType; badgeClass: string }
> = {
  jobstreet: {
    label: "Jobstreet",
    icon: Suitcase,
    badgeClass: "bg-primary text-primary-foreground",
  },
  indeed: {
    label: "Indeed",
    icon: MagnifyingGlass,
    badgeClass: "bg-secondary text-secondary-foreground",
  },
  glints: {
    label: "Glints",
    icon: Lightbulb,
    badgeClass: "bg-warning text-warning-foreground",
  },
};

export default function Lowongan() {
  const [wilayah, setWilayah] = useState(LOCATIONS[0].value);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<RefreshResult | null>(
    null,
  );

  const { data, error, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<LowonganPage>(
      (index, previous) => {
        if (previous && !previous.hasMore) return null;
        return lowonganKey({ wilayah, page: index + 1 });
      },
      fetcher,
      { revalidateFirstPage: false },
    );

  const jobs = useMemo(() => {
    const all = data?.flatMap((page) => page.jobs) ?? [];
    const seen = new Set<number>();
    return all.filter((job) => {
      if (seen.has(job.id)) return false;
      seen.add(job.id);
      return true;
    });
  }, [data]);

  const hasMore = data?.length ? data[data.length - 1].hasMore : true;
  const total = data?.length ? (data[0]?.total ?? jobs.length) : 0;
  const lastUpdatedAt = data?.length ? (data[0]?.lastUpdatedAt ?? null) : null;
  const isLoadingMore = isValidating && size > (data?.length ?? 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const res = await fetch("/api/lowongan/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wilayah }),
      });
      const json: RefreshResult = await res.json();
      setRefreshResult(json);
      await mutate();
    } catch (err) {
      console.error("Gagal refresh lowongan:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const lastUpdatedText = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

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

        <header className="mt-6 mb-8 flex items-center gap-4 border-b-2 border-border pb-6">
          <div className="flex size-14 shrink-0 items-center justify-center border-2 border-border bg-secondary text-secondary-foreground shadow-brutal">
            <MagnifyingGlass weight="bold" className="size-7" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-black tracking-tight uppercase">
              Lowongan Kerja
            </h1>
            <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              Jobstreet · Indeed · Glints
            </p>
          </div>
        </header>

        <section className="border-2 border-border bg-card p-4 shadow-brutal">
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid gap-2">
              <Label>Wilayah</Label>
              <Select
                value={wilayah}
                onValueChange={(v) => setWilayah(v as string)}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-9"
            >
              <ArrowsClockwise
                data-icon="inline-start"
                weight="bold"
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Mencari…" : "Refresh"}
            </Button>
          </div>
        </section>

        {refreshResult && (
          <div className="mt-4 flex flex-wrap gap-2">
            {refreshResult.results.map((r) => (
              <Badge
                key={r.platform}
                variant="outline"
                className={r.error ? "border-destructive text-destructive" : ""}
              >
                {platformMeta[r.platform].label}:{" "}
                {r.skippedCooldown
                  ? "menunggu cooldown"
                  : r.error
                    ? "gagal"
                    : `${r.added} lowongan`}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-6 mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-xl font-black tracking-tight uppercase">
            Hasil{" "}
            <span className="font-mono text-xs font-normal tracking-wide text-muted-foreground normal-case">
              ({total} lowongan)
            </span>
          </h2>
          {lastUpdatedText && (
            <p className="font-mono text-xs tracking-wide text-muted-foreground">
              Terakhir diperbarui: {lastUpdatedText}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={`skel-${i}`} className="h-40" />
            ))}
          </div>
        ) : error ? (
          <div className="border-2 border-dashed border-destructive bg-destructive/10 p-8 text-center text-sm font-bold text-destructive">
            Gagal memuat lowongan.
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 border-2 border-dashed border-border bg-card p-10 text-center">
            <MagnifyingGlass
              weight="bold"
              className="size-8 text-muted-foreground"
            />
            <p className="font-bold uppercase tracking-wide">
              Belum ada lowongan
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Pilih wilayah, lalu tekan Refresh untuk mengambil lowongan dari
              Jobstreet, Indeed, dan Glints.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {isLoadingMore && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={`loading-${i}`} className="h-40" />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setSize((s) => s + 1)}
                  disabled={isLoadingMore}
                >
                  Muat lebih banyak
                </Button>
              </div>
            )}

            {!hasMore && (
              <p className="mt-4 text-center font-mono text-xs tracking-wide text-muted-foreground uppercase">
                Semua lowongan telah ditampilkan
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function JobCard({ job }: { job: ScrapedJob }) {
  const meta = platformMeta[job.platform];
  const Icon = meta.icon;
  return (
    <Card className="h-full transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="truncate text-base">{job.title}</CardTitle>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
            {job.company}
          </p>
        </div>
        <Badge variant="outline" className={`shrink-0 ${meta.badgeClass}`}>
          <Icon weight="bold" className="size-3" />
          {meta.label}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {job.jobType && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{job.jobType}</Badge>
          </div>
        )}
        <div className="flex flex-wrap gap-3 font-mono text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin weight="bold" className="size-3.5" />
            {job.location}
          </span>
          {job.salary && (
            <span className="flex items-center gap-1">
              <Money weight="bold" className="size-3.5" />
              {job.salary}
            </span>
          )}
        </div>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center justify-center gap-1.5 border-2 border-border bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-brutal-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal"
        >
          Lamar
          <ArrowSquareOut weight="bold" className="size-4" />
        </a>
      </CardContent>
    </Card>
  );
}
