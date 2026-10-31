import { cleanText, fetchJson } from "./http";
import type { ScrapedJob, ScrapeInput } from "./types";

interface GlintsCompany {
  name?: string;
}

interface GlintsOpportunity {
  id?: string | number;
  title?: string;
  company?: GlintsCompany;
  location?: string;
  locationName?: string;
  salaryEstimate?: {
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
    type?: string;
  };
  employmentType?: string;
  createdAt?: string;
  isRemote?: boolean;
}

interface GlintsResponse {
  data?: GlintsOpportunity[];
}

function formatSalary(opp: GlintsOpportunity): string | null {
  const est = opp.salaryEstimate;
  if (!est || (est.minAmount == null && est.maxAmount == null)) return null;
  const currency = est.currency ?? "IDR";
  const min =
    est.minAmount != null ? est.minAmount.toLocaleString("id-ID") : "?";
  const max =
    est.maxAmount != null ? est.maxAmount.toLocaleString("id-ID") : "?";
  return `${currency} ${min} - ${max}`;
}

export async function scrapeGlints(input: ScrapeInput): Promise<ScrapedJob[]> {
  const location = input.location.glintsQuery;
  const qs = new URLSearchParams();
  if (location) qs.set("locationName", location);
  qs.set("page", "1");
  qs.set("limit", "30");
  const url = `https://glints.com/api/opportunities?${qs.toString()}`;

  const json = await fetchJson<GlintsResponse>(url);
  const data = Array.isArray(json.data) ? json.data : [];

  const jobs: ScrapedJob[] = [];
  for (const opp of data) {
    const title = cleanText(opp.title);
    const company = cleanText(opp.company?.name);
    if (!title || !company) continue;
    const id = String(opp.id ?? title);
    jobs.push({
      platform: "glints",
      title,
      company,
      location: cleanText(opp.location ?? opp.locationName) || location,
      wilayah: input.location.value,
      salary: formatSalary(opp),
      jobType: cleanText(opp.employmentType) || null,
      url: `https://glints.com/id/opportunities/jobs/${id}`,
      externalId: id,
      postedAt: opp.createdAt ?? null,
      scrapedAt: new Date().toISOString(),
    });
  }

  return jobs;
}
