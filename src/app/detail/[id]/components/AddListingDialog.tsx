"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup } from "@/components/ui/select";
import { Plus } from "@phosphor-icons/react";

const statusOptions = ["Applied", "Interview", "Rejected", "Accepted"];

interface AddListingDialogProps {
  sourceId: number;
  sourceName: string;
}

export function AddListingDialog({ sourceId, sourceName }: AddListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Applied");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!company.trim() || !position.trim() || !location.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId,
          company: company.trim(),
          position: position.trim(),
          companyLocation: location.trim(),
          status,
          applicationDate: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setCompany("");
        setPosition("");
        setLocation("");
        setStatus("Applied");
        setOpen(false);
      }
    } catch (err) {
      console.error("Failed to add listing:", err);
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="listing-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v || "Applied")}>
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
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !company.trim() || !position.trim() || !location.trim()}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
