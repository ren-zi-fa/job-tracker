import { scrapeGlints } from "./glints";
import { scrapeIndeed } from "./indeed";
import { scrapeJobstreet } from "./jobstreet";
import type { Platform, ScrapeInput, ScrapeResult } from "./types";

const scrapers: Record<
  Platform,
  (input: ScrapeInput) => Promise<ScrapeResult["jobs"]>
> = {
  jobstreet: scrapeJobstreet,
  indeed: scrapeIndeed,
  glints: scrapeGlints,
};

export async function scrapePlatform(
  input: ScrapeInput,
): Promise<ScrapeResult> {
  const scraper = scrapers[input.platform];
  try {
    const jobs = await scraper(input);
    return { platform: input.platform, jobs };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { platform: input.platform, jobs: [], error: message };
  }
}

export async function scrapePlatforms(
  inputs: ScrapeInput[],
): Promise<ScrapeResult[]> {
  const settled = await Promise.allSettled(
    inputs.map((input) => scrapePlatform(input)),
  );
  return settled.map((result, i) =>
    result.status === "fulfilled"
      ? result.value
      : {
          platform: inputs[i].platform,
          jobs: [],
          error: "scraper gagal berjalan",
        },
  );
}
