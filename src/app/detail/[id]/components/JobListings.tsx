"use client";

import { Briefcase, Calendar, MapPin } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSWRConfig } from "swr";
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
import { getStatusBadgeClass } from "@/lib/status";
import { fetcher, listingsCountKey, listingsKey } from "@/lib/swr";
import { AddListingDialog } from "./AddListingDialog";
import { EditStatusDialog } from "./EditStatusDialog";

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
  total: number;
}

const skeletonKeys = ["skel-1", "skel-2", "skel-3"];

function getTargetIdFromHash(): number | null {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(/#listing-(\d+)/);
  return match ? parseInt(match[1] as string, 10) : null;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={getStatusBadgeClass(status)}>
      {status}
    </Badge>
  );
}
function JobCard({
  listing,
  highlighted,
  onSaveStatus,
}: {
  listing: JobListing;
  highlighted: boolean;
  onSaveStatus: (listingId: number, status: string) => Promise<void>;
}) {
  return (
    <div id={`listing-${listing.id}`} className="scroll-mt-24">
      <Card
        className={`transition-all ${
          highlighted
            ? "-translate-x-0.5 -translate-y-0.5 shadow-brutal-lg ring-4 ring-primary"
            : "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg"
        }`}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">
              {listing.company}
            </CardTitle>
            <CardDescription className="mt-1 truncate">
              {listing.position}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <StatusBadge status={listing.status} />
            <EditStatusDialog listing={listing} onSave={onSaveStatus} />
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin weight="bold" className="size-3.5" />
            <span className="truncate">{listing.companyLocation}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar weight="bold" className="size-3.5" />
            {new Date(listing.applicationDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </CardContent>
      </Card>
    </div>
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
  const scrolledRef = useRef<number | null>(null);
  const { mutate: globalMutate } = useSWRConfig();
  const [targetId, setTargetId] = useState<number | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

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
  const total = data?.length ? (data[0]?.total ?? listings.length) : 0;
  const isLoadingMore = isValidating && size > (data?.length ?? 0);
  const showSentinel = !isLoading && !error && listings.length > 0 && hasMore;

  const refreshListingsAndTotal = useCallback(async () => {
    await mutate();
    await globalMutate(listingsCountKey(sourceId));
  }, [mutate, globalMutate, sourceId]);

  const updateListingStatus = useCallback(
    async (listingId: number, status: string) => {
      await mutate(
        (pages) =>
          pages?.map((page) => ({
            ...page,
            listings: page.listings.map((listing) =>
              listing.id === listingId ? { ...listing, status } : listing,
            ),
          })),
        { revalidate: false },
      );
      try {
        const res = await fetch(`/api/listings/${listingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
      } finally {
        await refreshListingsAndTotal();
      }
    },
    [mutate, refreshListingsAndTotal],
  );

  useEffect(() => {
    const onHashChange = () => {
      scrolledRef.current = null;
      setHighlightedId(null);
      setTargetId(getTargetIdFromHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Sync target dari hash URL saat mount & setelah data selesai dimuat.
  // Diperlukan karena navigasi client-side (pushState) tidak memicu
  // event hashchange, sehingga hash belum tentu ada saat render pertama.
  useEffect(() => {
    if (!isLoading) setTargetId(getTargetIdFromHash());
  }, [isLoading]);

  // Muat halaman tambahan sampai kartu target ditemukan (deep-link dari pencarian).
  useEffect(() => {
    if (targetId == null || isLoading || error) return;
    if (listings.some((listing) => listing.id === targetId)) return;
    if (hasMore && !isValidating) setSize((current) => current + 1);
  }, [targetId, listings, hasMore, isValidating, isLoading, error, setSize]);

  // Scroll tepat ke kartu perusahaan + highlight sementara.
  const targetLoaded =
    targetId != null && listings.some((listing) => listing.id === targetId);
  useEffect(() => {
    if (targetId == null || isLoading || !targetLoaded) return;
    if (scrolledRef.current === targetId) return;
    const el = document.getElementById(`listing-${targetId}`);
    if (!el) return;
    scrolledRef.current = targetId;
    const frame = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(targetId);
    });
    const clear = setTimeout(() => setHighlightedId(null), 3000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(clear);
    };
  }, [targetId, targetLoaded, isLoading]);

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
        onCreated={() => refreshListingsAndTotal()}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {dialog}
        <div className="flex flex-col gap-5">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="border-2 border-dashed border-destructive bg-destructive/10 p-8 text-center text-sm font-bold text-destructive">
          Gagal memuat lamaran.
        </div>
      </div>
    );
  }

  return (
    <div>
      {dialog}

      <h2 className="mb-5 font-heading text-xl font-black tracking-tight uppercase">
        Lamaran — {sourceName}{" "}
        <span className="font-mono text-xs font-normal tracking-wide text-muted-foreground normal-case">
          ({total} job listing)
        </span>
      </h2>

      {listings.length === 0 ? (
        <div className="border-2 border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          <Briefcase weight="bold" className="mx-auto mb-2 size-8" />
          <p>Belum ada lamaran untuk {sourceName}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <JobCard
                key={listing.id}
                listing={listing}
                highlighted={listing.id === highlightedId}
                onSaveStatus={updateListingStatus}
              />
            ))}
          </div>

          {isLoadingMore && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {skeletonKeys.map((key) => (
                <Skeleton key={`loading-${key}`} className="h-24" />
              ))}
            </div>
          )}

          {showSentinel && (
            <div ref={sentinelRef} className="mt-6 flex justify-center py-4">
              <div className="size-6 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          )}

          {!hasMore && listings.length > 0 && (
            <p className="mt-4 text-center font-mono text-xs tracking-wide text-muted-foreground uppercase">
              Semua lamaran telah ditampilkan
            </p>
          )}
        </>
      )}
    </div>
  );
}
