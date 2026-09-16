"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead, KpiCard, EmptyState } from "@/components/bits";
import { useStore } from "@/lib/store";
import { LeadDrawer } from "@/components/lead-drawer";
import { PhoneCall, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function AiCallsPage() {
  const { aiCalls, leads } = useStore();
  const [active, setActive] = useState<any | null>(null);

  const stats = {
    total: aiCalls.length,
    completed: aiCalls.filter((c) => c.status === "Completed").length,
    failed: aiCalls.filter((c) => ["Failed", "No Answer", "Busy"].includes(c.status)).length,
    avgScore: aiCalls.length > 0
      ? Math.round(
          aiCalls.reduce((acc, c) => acc + (c.score || 0), 0) /
            aiCalls.filter((c) => c.score).length
        )
      : 0,
  };

  return (
    <AppShell
      title="AI Call Intelligence"
      subtitle={`Monitoring ${stats.total} automated qualification attempts`}
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Total AI Calls"
            value={stats.total}
            hint="total attempts"
          />
          <KpiCard
            label="Completed"
            value={stats.completed}
            delta="4.2%"
            hint="successful connects"
          />
          <KpiCard
            label="Failed/Missed"
            value={stats.failed}
            positive={false}
            hint="no connect"
          />
          <KpiCard
            label="Avg AI Score"
            value={stats.avgScore}
            delta="1.5%"
            hint="out of 100"
          />
        </div>

        <Panel>
          <PanelHead
            title="Call Log"
            hint="Detailed trace of AI qualification outcomes"
            action={
              <button className="h-8 rounded-xl bg-primary px-3 text-[12px] font-medium text-primary-foreground">
                Trigger Batch Call
              </button>
            }
          />
          {aiCalls.length === 0 ? (
            <EmptyState
              title="No AI calls recorded"
              body="Start a qualification campaign to see automated call results here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] text-left border-collapse">
                <thead className="border-b border-border text-muted-foreground mono-label">
                  <tr>
                    <th className="px-4 py-3 font-medium">Lead</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">AI Score</th>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {aiCalls.map((c) => {
                    const lead = leads.find((l) => l.id === c.leadId);
                    return (
                      <tr
                        key={c.id}
                        className="group transition-colors hover:bg-foreground/[0.02] cursor-pointer"
                        onClick={() => setActive(lead)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{lead?.name}</div>
                          <div className="font-mono text-[10px] text-faint">{lead?.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {c.status === "Completed" ? (
                              <CheckCircle2 className="size-3 text-ok" />
                            ) : (
                              <XCircle className="size-3 text-hot" />
                            )}
                            <span>{c.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {c.status === "Completed" ? `${Math.floor(c.durationSec / 60)}m ${c.durationSec % 60}s` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {c.score ? (
                            <span className="font-mono font-medium">{c.score}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {c.at}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            View Transcript
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
      <LeadDrawer lead={active} onOpenChange={(o) => !o && setActive(null)} />
    </AppShell>
  );
}
