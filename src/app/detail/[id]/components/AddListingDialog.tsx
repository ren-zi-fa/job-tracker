"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { createListingApiSchema } from "@/lib/validation";

import { statusOptions } from "./types";

interface AddListingDialogProps {
  sourceId: number;
  sourceName: string;
  onCreated?: () => unknown;
}

export function AddListingDialog({
  sourceId,
  sourceName,
  onCreated,
}: AddListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const payload = {
      sourceId,
      company: company.trim(),
      position: position.trim(),
      companyLocation: location.trim(),
      status,
      applicationDate: new Date().toISOString(),
    };
    const parsed = createListingApiSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error
            ? `${res.status}: ${data.error}`
            : `POST failed: ${res.status}`,
        );
      }
      setCompany("");
      setPosition("");
      setLocation("");
      setStatus("Applied");
      setOpen(false);
      await onCreated?.();
      toast.add({
        type: "success",
        title: "Lamaran ditambahkan",
        description: `${company.trim()} — ${position.trim()} (${sourceName}).`,
      });
    } catch (err) {
      console.error("Failed to add listing:", err);
      toast.add({
        type: "error",
        title: "Gagal menambah lamaran",
        description: err instanceof Error ? err.message : "Coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Tambah Lamaran</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Lamaran</DialogTitle>
          <DialogDescription>
            Add a new application for {sourceName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="listing-company">Company</Label>
            <Input
              id="listing-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="PT Example"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            {fieldErrors.company && (
              <p className="text-xs text-destructive">{fieldErrors.company}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="listing-position">Position</Label>
            <Input
              id="listing-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Software Engineer"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            {fieldErrors.position && (
              <p className="text-xs text-destructive">{fieldErrors.position}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="listing-location">Location</Label>
            <Input
              id="listing-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Jakarta"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            {fieldErrors.companyLocation && (
              <p className="text-xs text-destructive">
                {fieldErrors.companyLocation}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="listing-status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v || "Pending")}
            >
              <SelectTrigger id="listing-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldErrors.status && (
              <p className="text-xs text-destructive">{fieldErrors.status}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading || !company.trim() || !position.trim() || !location.trim()
            }
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
