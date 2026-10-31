export const PLATFORMS = ["jobstreet", "indeed", "glints"] as const;

export type Platform = (typeof PLATFORMS)[number];

export interface ScrapedJob {
  platform: Platform;
  title: string;
  company: string;
  location: string;
  wilayah: string;
  salary?: string | null;
  jobType?: string | null;
  url: string;
  externalId: string;
  postedAt?: string | null;
  scrapedAt: string;
}

export interface ScrapeResult {
  platform: Platform;
  jobs: ScrapedJob[];
  error?: string;
}

export interface ScrapeInput {
  platform: Platform;
  location: {
    value: string;
    indeedQuery: string;
    glintsQuery: string;
    jobstreetQuery: string;
    jobstreetSlug: string;
  };
}
