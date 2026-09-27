export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${url}`);
  }
  return res.json();
};

export const sourcesKey = "/api/sources";

export const listingsKey = (sourceId: number, page: number, limit = 10) =>
  `/api/sources/${sourceId}/listings?page=${page}&limit=${limit}`;
