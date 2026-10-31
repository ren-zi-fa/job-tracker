import * as cheerio from "cheerio";
import { cleanText, fetchHtml } from "./http";
import type { ScrapedJob, ScrapeInput } from "./types";

export async function scrapeIndeed(input: ScrapeInput): Promise<ScrapedJob[]> {
  const location = input.location.indeedQuery;
  const qs = new URLSearchParams();
  if (location) qs.set("l", location);
  const url = `https://id.indeed.com/jobs?${qs.toString()}`;

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const jobs: ScrapedJob[] = [];

  $(
    'div[data-testid="jobListing"], div.job_seen_beacon, td.resultContent',
  ).each((_, el) => {
    const $el = $(el);
    const title = cleanText(
      $el
        .find("h2.jobTitle span[title], h2.jobTitle, span[title]")
        .first()
        .attr("title") ||
        $el.find("h2.jobTitle span[title], h2.jobTitle").first().text(),
    );
    const company = cleanText(
      $el
        .find(
          'span[data-testid="company-name"], span.companyName, span[data-testid="companyName"]',
        )
        .first()
        .text(),
    );
    const locationText = cleanText(
      $el.find('div[data-testid="text-location"], div.location').first().text(),
    );
    const salary = cleanText(
      $el
        .find(
          'div[data-testid="attribute_snippet_testid"], div.salary-snippet-container',
        )
        .first()
        .text(),
    );
    const link = $el
      .find("a[data-jk], h2.jobTitle a, a.jcs-JobTitle")
      .first()
      .attr("href");
    const jobKey =
      $el.find("a[data-jk]").first().attr("data-jk") ||
      $el.attr("data-jk") ||
      link?.match(/jk=([^&]+)/)?.[1];

    if (!title || !company) return;
    jobs.push({
      platform: "indeed",
      title,
      company,
      location: locationText || location,
      wilayah: input.location.value,
      salary: salary || null,
      jobType: null,
      url: normalizeIndeedUrl(link),
      externalId: jobKey || title,
      postedAt: null,
      scrapedAt: new Date().toISOString(),
    });
  });

  return jobs;
}

function normalizeIndeedUrl(href: string | undefined): string {
  if (!href) return "https://id.indeed.com";
  if (href.startsWith("http")) return href;
  return new URL(href, "https://id.indeed.com").toString();
}
