"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead, EmptyState } from "@/components/bits";
import { useStore } from "@/lib/store";
import { LeadDrawer } from "@/components/lead-drawer";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

const APP_STAGES = [
  "Interested",
  "Application Started",
  "Documents Pending",
  "Documents Submitted",
  "Application Submitted",
  "Offer Received",
  "Deposit Paid",
  "Converted",
];

export default function ApplicationsPage() {
  const { applications, leads } = useStore();
  const [active, setActive] = useState<any | null>(null);

  const stageCounts = APP_STAGES.reduce((acc, stage) => {
    acc[stage] = applications.filter((a) => a.stage === stage).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppShell
      title="Application Pipeline"
      subtitle={`Tracking ${applications.length} active admissions`}
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {APP_STAGES.slice(0, 5).map((stage) => (
            <div key={stage} className="clay p-3 rounded-xl">
              <div className="mono-label text-[10px] text-muted-foreground truncate">{stage}</div>
              <div className="font-display text-[18px] font-semibold">{stageCounts[stage]}</div>
            </div>
          ))}
        </div>

        <Panel>
          <PanelHead
            title="Active Applications"
            hint="Monitor document flow and offer status"
            action={
              <button className="h-8 rounded-xl bg-primary px-3 text-[12px] font-medium text-primary-foreground">
                Start New Application
              </button>
            }
          />
          {applications.length === 0 ? (
            <EmptyState
              title="No applications found"
              body="Applications will appear here once students start their admission process."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] text-left border-collapse">
                <thead className="border-b border-border text-muted-foreground mono-label">
                  <tr>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Last Activity</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.map((a) => {
                    const lead = leads.find(l => l.id === a.leadId);
                    return (
                      <tr
                        key={a.id || a._id}
                        className="group transition-colors hover:bg-foreground/[0.02] cursor-pointer"
                        onClick={() => setActive(lead)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{lead?.name}</div>
                          <div className="font-mono text-[10px] text-faint">{lead?.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="pill bg-primary-soft text-primary text-[10px]">
                            {a.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          ₹ {a.value.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {a.lastActivity}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            View lead
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
