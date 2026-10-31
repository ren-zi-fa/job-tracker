import * as cheerio from "cheerio";
import { cleanText, fetchHtml } from "./http";
import type { ScrapedJob, ScrapeInput } from "./types";

function normalizeUrl(href: string | undefined, base: string): string {
  if (!href) return base;
  if (href.startsWith("http")) return href;
  return new URL(href, base).toString();
}

export async function scrapeJobstreet(
  input: ScrapeInput,
): Promise<ScrapedJob[]> {
  const location = input.location.jobstreetQuery;
  const url = `https://id.jobstreet.com/id/jobs/in-${input.location.jobstreetSlug}`;

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const jobs: ScrapedJob[] = [];

  $('article[data-card-type="JobCard"], [data-automation="normalJob"]').each(
    (_, el) => {
      const $el = $(el);
      const title = cleanText(
        $el.find('[data-automation="jobTitle"]').first().text(),
      );
      const company = cleanText(
        $el
          .find(
            '[data-automation="jobCompany"], [data-automation="job-card-company"]',
          )
          .first()
          .text(),
      );
      const locationText = cleanText(
        $el.find('[data-automation="jobLocation"]').first().text(),
      );
      const salary = cleanText(
        $el.find('[data-automation="jobSalary"]').first().text(),
      );
      const jobType = cleanText(
        $el.find('[data-automation="jobCardWorkType"]').first().text(),
      );
      const link = $el
        .find(
          'a[data-automation="jobTitle"], a[data-automation="job-list-item-link"]',
        )
        .first()
        .attr("href");
      const idAttr =
        $el.attr("data-job-id") ||
        $el.find("[data-job-id]").first().attr("data-job-id");

      if (!title || !company) return;
      jobs.push({
        platform: "jobstreet",
        title,
        company,
        location: locationText || location,
        wilayah: input.location.value,
        salary: salary || null,
        jobType: jobType || null,
        url: normalizeUrl(link, url),
        externalId: idAttr || title,
        postedAt: null,
        scrapedAt: new Date().toISOString(),
      });
    },
  );

  return jobs;
}
