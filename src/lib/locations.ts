export interface LocationOption {
  value: string;
  label: string;
  indeedQuery: string;
  glintsQuery: string;
  jobstreetQuery: string;
  jobstreetSlug: string;
}

export const LOCATIONS: LocationOption[] = [
  {
    value: "sumatera-barat",
    label: "Sumatera Barat",
    indeedQuery: "Padang, Sumatera Barat",
    glintsQuery: "Sumatera Barat",
    jobstreetQuery: "Sumatera Barat",
    jobstreetSlug: "Sumatera-Barat",
  },
  {
    value: "sumatera-utara",
    label: "Sumatera Utara",
    indeedQuery: "Medan, Sumatera Utara",
    glintsQuery: "Sumatera Utara",
    jobstreetQuery: "Sumatera Utara",
    jobstreetSlug: "Sumatera-Utara",
  },
  {
    value: "pekanbaru-riau",
    label: "Pekanbaru, Riau",
    indeedQuery: "Pekanbaru, Riau",
    glintsQuery: "Pekanbaru",
    jobstreetQuery: "Pekanbaru",
    jobstreetSlug: "Pekanbaru",
  },
  {
    value: "batam",
    label: "Kota Batam",
    indeedQuery: "Batam, Kepulauan Riau",
    glintsQuery: "Batam",
    jobstreetQuery: "Batam",
    jobstreetSlug: "Batam",
  },
];

export function getLocation(value: string | null | undefined): LocationOption {
  return LOCATIONS.find((loc) => loc.value === value) ?? LOCATIONS[0];
}
