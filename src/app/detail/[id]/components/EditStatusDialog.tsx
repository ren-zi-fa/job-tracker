"use client";

import { PencilSimple } from "@phosphor-icons/react";
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
import { updateListingStatusSchema } from "@/lib/validation";
import { type JobListing, statusOptions } from "./types";

interface EditStatusDialogProps {
  listing: JobListing;
  onSave: (listingId: number, status: string) => Promise<void>;
}

export function EditStatusDialog({ listing, onSave }: EditStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(listing.status);
  const [saving, setSaving] = useState(false);

  const selectId = `edit-status-${listing.id}`;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setStatus(listing.status);
    }
  };

  const handleSave = async () => {
    if (status === listing.status) {
      setOpen(false);
      return;
    }
    const parsed = updateListingStatusSchema.safeParse({ status });
    if (!parsed.success) {
      toast.add({
        type: "error",
        title: "Status tidak valid",
        description: parsed.error.issues[0]?.message ?? "Coba lagi.",
      });
      return;
    }
    setSaving(true);
    try {
      await onSave(listing.id, parsed.data.status);
      setOpen(false);
      toast.add({
        type: "success",
        title: "Status diperbarui",
        description: `${listing.company} — ${listing.position}: ${status}.`,
      });
    } catch {
      toast.add({
        type: "error",
        title: "Gagal menyimpan status",
        description: "Coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Ubah status lamaran ${listing.company}`}
          >
            <PencilSimple className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Status</DialogTitle>
          <DialogDescription>
            {listing.company} — {listing.position}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <Label htmlFor={selectId}>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v ?? status)}>
            <SelectTrigger id={selectId}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || status === listing.status}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
