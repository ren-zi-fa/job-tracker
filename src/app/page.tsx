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
    <main className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight dark:text-white">
            Job Tracker
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Track your job applications from all sources
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {skeletons.map((i) => (
              <Skeleton key={`skel-${i}`} className="h-32" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-none border border-dashed border-destructive/50 p-8 text-center text-sm text-destructive">
            Gagal memuat data sumber lamaran.
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sources.map((source) => {
                const Icon = iconMap[source.sourceName] || Building;
                return (
                  <Link
                    key={source.id}
                    href={`/detail/${source.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="size-5 text-zinc-400" />
                          <CardTitle className="text-sm">
                            {source.sourceName}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>Lihat detail →</CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </section>

            <section className="mt-8 flex justify-end">
              <AddSourceDialog />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
