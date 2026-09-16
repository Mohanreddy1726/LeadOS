"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function FollowUpModal({
  leadId,
  trigger,
}: {
  leadId: string;
  trigger: React.ReactNode;
}) {
  const handleSave = () => {
    toast.success(`Follow-up scheduled for ${leadId}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="mono-label">Reason</span>
            <input className="h-10 rounded-xl border bg-surface px-3 text-[13px] outline-none focus:border-primary" placeholder="e.g. Budget discussion" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="mono-label">Date & Time</span>
            <input type="datetime-local" className="h-10 rounded-xl border bg-surface px-3 text-[13px] outline-none focus:border-primary" />
          </div>
          <button
            onClick={handleSave}
            className="h-10 w-full rounded-xl bg-primary text-[13px] font-medium text-primary-foreground"
          >
            Save Follow-up
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
