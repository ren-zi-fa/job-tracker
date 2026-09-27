"use client";

import {
  Briefcase,
  Building,
  LinkedinLogo,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import Link from "next/link";
import useSWR from "swr";
import { AddSourceDialog } from "@/app/components/AddSourceDialog";
import { GlobalSearchDialog } from "@/app/components/GlobalSearchDialog";
import { StatusStats } from "@/app/components/StatusStats";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher, sourcesKey } from "@/lib/swr";

interface Source {
  id: number;
  sourceName: string;
  listingCount: number;
}

const iconMap: Record<string, React.ElementType> = {
  LinkedIn: LinkedinLogo,
  Jobstreet: Briefcase,
  Glints: MagnifyingGlass,
  "Direct Company": Building,
};

const skeletons = [0, 1, 2, 3];

export default function Home() {
  const {
    data: sources = [],
    isLoading,
    error,
  } = useSWR<Source[]>(sourcesKey, fetcher);

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center border-2 border-border bg-primary text-primary-foreground shadow-brutal-sm">
              <Briefcase weight="bold" className="size-6" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-black tracking-tight uppercase">
                Job Tracker
              </h1>
              <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                Track your job applications from all sources
              </p>
            </div>
          </div>
          {!isLoading && !error && <GlobalSearchDialog />}
        </header>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {skeletons.map((i) => (
              <Skeleton key={`skel-${i}`} className="h-36" />
            ))}
          </div>
        ) : error ? (
          <div className="border-2 border-destructive bg-destructive/10 p-8 text-center text-sm font-bold text-destructive">
            Gagal memuat data sumber lamaran.
          </div>
        ) : (
          <>
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {sources.map((source) => {
                const Icon = iconMap[source.sourceName] || Building;
                return (
                  <Link
                    key={source.id}
                    href={`/detail/${source.id}`}
                    className="group block focus-visible:outline-none"
                  >
                    <Card className="h-full transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-brutal-lg group-focus-visible:ring-2 group-focus-visible:ring-ring">
                      <CardHeader className="flex flex-row items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex size-8 shrink-0 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
                            <Icon weight="bold" className="size-4" />
                          </span>
                          <CardTitle className="truncate">
                            {source.sourceName}
                          </CardTitle>
                        </div>
                        <Badge variant="default">
                          {source.listingCount ?? 0}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="font-mono uppercase">
                          {source.listingCount ?? 0} lamaran — lihat detail →
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </section>

            {sources.length === 0 && (
              <div className="mt-4 flex flex-col items-center gap-3 border-2 border-dashed border-border bg-card p-10 text-center">
                <Building
                  weight="bold"
                  className="size-8 text-muted-foreground"
                />
                <p className="font-bold uppercase tracking-wide">
                  Belum ada sumber lamaran
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Tambahkan sumber lamaran pertamamu untuk mulai melacak
                  aplikasi.
                </p>
              </div>
            )}

            <section className="mt-10 max-w-xl">
              <StatusStats />
            </section>

            <section className="mt-10 flex justify-end border-t-2 border-border pt-6">
              <AddSourceDialog />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
