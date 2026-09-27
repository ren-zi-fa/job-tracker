"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building,
  Calendar,
  MapPin,
  Briefcase,
  Plus,
} from "@phosphor-icons/react";
import db from "@/database/db";
import { jobListingsTable } from "@/database/models/schema";
import { eq } from "drizzle-orm";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
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

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariant[status] || "default"}>
      {status}
    </Badge>
  );
}

function JobCard({ listing }: { listing: JobListing }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base truncate">{listing.company}</CardTitle>
          <CardDescription className="mt-1 truncate">{listing.position}</CardDescription>
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

function AddApplicationDialog({ listingId }: { listingId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: 0,
          company: `Lamaran ${listingId}`,
          position: "Update Status",
          companyLocation: "",
          status: "Applied",
          applicationDate: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setOpen(false);
      }
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm">+ Application</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
          <DialogDescription>Update your application status.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function JobListings({ sourceId, sourceName }: { sourceId: number; sourceName: string }) {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchListings = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/sources/${sourceId}/listings?page=${page}&limit=10`
      );
      const data = await res.json();
      setListings((prev) => [...prev, ...data.listings]);
      setHasMore(data.hasMore);
      setPage(data.nextPage);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [sourceId, page, hasMore, loading]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !initialLoading) {
          fetchListings();
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, initialLoading, fetchListings]);

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={`skeleton-${crypto.randomUUID()}`} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
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

          {loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={`loading-${crypto.randomUUID()}`} className="h-24" />
              ))}
            </div>
          )}

          {hasMore && (
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
