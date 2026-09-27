import { statusEnum } from "@/lib/validation";

export interface JobListing {
  id: number;
  sourceId: number;
  company: string;
  position: string;
  companyLocation: string;
  status: string;
  applicationDate: string;
}

export const statusOptions: string[] = statusEnum.options;
