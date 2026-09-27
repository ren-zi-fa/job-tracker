"use client";

import { Briefcase, Calendar, MapPin } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetcher, listingsKey } from "@/lib/swr";
import { AddListingDialog } from "./AddListingDialog";

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Applied: "default",
  Interview: "secondary",
  Rejected: "destructive",
  Accepted: "outline",
};

interface JobListing {
  id: number;
  sourceId: number;
  company: string;
  position: string;
  companyLocation: string;
  status: string;
  applicationDate: string;
}

interface ListingsPage {
  listings: JobListing[];
  hasMore: boolean;
  nextPage: number;
}

const skeletonKeys = ["skel-1", "skel-2", "skel-3"];

function StatusBadge({ status }: { status: string }) {
  return <Badge variant={statusVariant[status] || "default"}>{status}</Badge>;
}

function JobCard({ listing }: { listing: JobListing }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base truncate">
            {listing.company}
          </CardTitle>
          <CardDescription className="mt-1 truncate">
            {listing.position}
          </CardDescription>
        </div>
        <StatusBadge status={listing.status} />
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <MapPin className="size-3" />
          <span className="truncate">{listing.companyLocation}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="size-3" />
          {new Date(listing.applicationDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobListings({
  sourceId,
  sourceName,
}: {
  sourceId: number;
  sourceName: string;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, error, size, setSize, isValidating, isLoading, mutate } =
    useSWRInfinite<ListingsPage>((index, previousData) => {
      if (previousData && !previousData.hasMore) return null;
      return listingsKey(sourceId, index + 1);
    }, fetcher);

  const listings = useMemo(() => {
    const all = data?.flatMap((page) => page.listings) ?? [];
    const seen = new Set<number>();
    return all.filter((listing) => {
      if (seen.has(listing.id)) return false;
      seen.add(listing.id);
      return true;
    });
  }, [data]);

  const hasMore = data?.length ? data[data.length - 1].hasMore : true;
  const isLoadingMore = isValidating && size > (data?.length ?? 0);
  const showSentinel = !isLoading && !error && listings.length > 0 && hasMore;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!showSentinel || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          !isLoading &&
          !isLoadingMore &&
          hasMore
        ) {
          setSize((current) => current + 1);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showSentinel, isLoading, isLoadingMore, hasMore, setSize]);

  const dialog = (
    <div className="mb-6 flex justify-end">
      <AddListingDialog
        sourceId={sourceId}
        sourceName={sourceName}
        onCreated={() => mutate()}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {dialog}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skeletonKeys.map((key) => (
              <Skeleton key={key} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {dialog}
        <div className="rounded-none border border-dashed border-destructive/50 p-8 text-center text-sm text-destructive">
          Gagal memuat lamaran.
        </div>
      </div>
    );
  }

  return (
    <div>
      {dialog}

      <h2 className="mb-4 text-xl font-bold dark:text-white">
        Lamaran — {sourceName}
      </h2>

      {listings.length === 0 ? (
        <div className="rounded-none border border-dashed border-border p-8 text-center text-zinc-400">
          <Briefcase className="mx-auto mb-2 size-8 opacity-50" />
          <p>Belum ada lamaran untuk {sourceName}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <JobCard key={listing.id} listing={listing} />
            ))}
          </div>

          {isLoadingMore && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {skeletonKeys.map((key) => (
                <Skeleton key={`loading-${key}`} className="h-24" />
              ))}
            </div>
          )}

          {showSentinel && (
            <div ref={sentinelRef} className="mt-6 flex justify-center py-4">
              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {!hasMore && listings.length > 0 && (
            <p className="mt-4 text-center text-sm text-zinc-400">
              Semua lamaran telah ditampilkan
            </p>
          )}
        </>
      )}
    </div>
  );
}
