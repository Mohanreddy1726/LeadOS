"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead, Avatar, EmptyState } from "@/components/bits";
import { useStore } from "@/lib/store";
import { LeadDrawer } from "@/components/lead-drawer";
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function FollowUpsPage() {
  const { followUps, completeFollowUp, leads } = useStore();
  const [active, setActive] = useState<any | null>(null);

  const groups = useMemo(() => {
    const g: Record<string, any[]> = {
      Today: [],
      Upcoming: [],
      Overdue: [],
    };
    followUps.forEach((f) => {
      if (f.status !== "Completed") {
        g[f.status]?.push(f);
      }
    });
    return g;
  }, [followUps]);

  return (
    <AppShell
      title="Follow-up Schedule"
      subtitle={`You have ${followUps.filter((f) => f.status !== "Completed").length} open tasks`}
    >
      <div className="grid gap-6">
        {Object.entries(groups).map(([status, items]) => (
          <Panel key={status}>
            <PanelHead
              title={status}
              hint={`${items.length} tasks ${status === "Overdue" ? "requiring immediate attention" : "scheduled"}`}
              action={
                status === "Overdue" && (
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-hot">
                    <AlertCircle className="size-3" /> Critical
                  </span>
                )
              }
            />
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-muted-foreground font-mono">
                No {status.toLowerCase()} follow-ups
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((f) => {
                  const lead = leads.find(l => l.memberId === f.leadId || l.id === f.leadId);
                  return (
                    <li
                      key={f.id}
                      className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.02]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => setActive(lead)}
                          className="grid size-8 shrink-0 place-items-center rounded-full bg-surface border border-border text-[10px] font-semibold hover:bg-accent transition-colors"
                        >
                          {lead?.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium truncate">{lead?.name}</span>
                            <span className={cn(
                              "pill text-[9px] px-1.5 py-0.5",
                              f.priority === "High" ? "bg-hot-soft text-hot" : f.priority === "Medium" ? "bg-med-soft text-med" : "bg-low-soft text-low"
                            )}>
                              {f.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Clock className="size-3" /> {f.time}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Calendar className="size-3" /> {f.date}
                            </span>
                            <span className="text-[11px] text-faint truncate italic">
                              {f.reason}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          completeFollowUp(f.id);
                          toast.success(`Follow-up for ${lead?.name} completed`);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-[11px] font-medium transition-colors hover:bg-ok-soft hover:text-ok hover:border-ok/30"
                      >
                        <CheckCircle2 className="size-3" /> Complete
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        ))}
      </div>
      <LeadDrawer lead={active} onOpenChange={(o) => !o && setActive(null)} />
    </AppShell>
  );
}
