"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { fetcher, listingsCountKey } from "@/lib/swr";

export function TotalListingsBadge({ sourceId }: { sourceId: number }) {
  const { data, isLoading } = useSWR<{ total: number }>(
    listingsCountKey(sourceId),
    fetcher,
  );

  if (isLoading) {
    return (
      <Badge variant="secondary" className="mt-2 animate-pulse">
        Menghitung job listing…
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="mt-2">
      Total {data?.total ?? 0} job listing
    </Badge>
  );
}
