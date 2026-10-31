const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function resolveTargetUrl(url: string): string {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) return url;
  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    block_resources: "false",
  });
  return `https://app.scrapingbee.com/api/v1/?${params.toString()}`;
}

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(resolveTargetUrl(url), {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "id-ID,id;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(30000),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} dari ${new URL(url).hostname}`);
  }
  return res.text();
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(resolveTargetUrl(url), {
    headers: {
      "user-agent": USER_AGENT,
      accept: "application/json",
      "accept-language": "id-ID,id;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(30000),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} dari ${new URL(url).hostname}`);
  }
  return (await res.json()) as T;
}

export function cleanText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}
