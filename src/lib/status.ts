export const statusBadgeClass: Record<string, string> = {
  Pending: "bg-primary text-primary-foreground",
  Applied: "bg-secondary text-secondary-foreground",
  Interview: "bg-warning text-warning-foreground",
  Rejected: "bg-destructive text-destructive-foreground",
  Accepted: "bg-success text-success-foreground",
};

export function getStatusBadgeClass(status: string): string {
  return statusBadgeClass[status] ?? "bg-muted text-muted-foreground";
}

export const statusChartColor: Record<string, string> = {
  Pending: "var(--primary)",
  Applied: "var(--secondary)",
  Interview: "var(--warning)",
  Rejected: "var(--destructive)",
  Accepted: "var(--success)",
};

export const statusChartFallbackColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
