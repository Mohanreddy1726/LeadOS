"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import {
  Panel,
  PanelHead,
  QualityBadge,
  StatusBadge,
  ScoreBadge,
  Avatar,
  EmptyState,
} from "@/components/bits";
import { LeadDrawer } from "@/components/lead-drawer";
import { useVisibleLeads, type Lead } from "@/lib/store";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  "New",
  "Validating",
  "Valid",
  "AI Call Pending",
  "AI Calling",
  "AI Qualification",
  "Qualified",
  "Manager Review",
  "Assigned",
  "Contacted",
  "Follow-up",
  "Interested",
  "Application",
  "Converted",
];

export default function LeadsPage() {
  const leads = useVisibleLeads();
  const [search, setSearch] = useState("");
  const [filterQuality, setFilterQuality] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [active, setActive] = useState<Lead | null>(null);

  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    const result = leads.filter((l) => {
      const name = l.name || "";
      const phone = l.phone || "";
      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        phone.toLowerCase().includes(search.toLowerCase());
      const matchesQuality =
        filterQuality === "all" || l.quality === filterQuality;
      const matchesStage =
        filterStage === "all" || l.stage === filterStage;
      return matchesSearch && matchesQuality && matchesStage;
    });

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leads, search, filterQuality, filterStage]);

  return (
    <AppShell
      title="Leads Management"
      subtitle={`Viewing ${filteredLeads.length} of ${leads.length} leads`}
    >
      <div className="grid gap-4">
        <Panel>
          <PanelHead
            title="Lead Directory"
            hint="Manage and route qualified leads from your AI intake"
            action={
              <div className="flex items-center gap-2">
                <div className="clay-bubble relative hidden items-center gap-2 px-3 py-2 sm:flex">
                  <Search className="size-3.5 shrink-0 text-faint" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or phone..."
                    className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-faint"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={filterQuality}
                    onChange={(e) => setFilterQuality(e.target.value)}
                    className="h-8 rounded-xl border border-border bg-surface px-2 text-[12px] outline-none"
                  >
                    <option value="all">All Quality</option>
                    <option value="hot">Hot</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="junk">Junk</option>
                  </select>
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="h-8 rounded-xl border border-border bg-surface px-2 text-[12px] outline-none"
                  >
                    <option value="all">All Stages</option>
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            }
          />
          {filteredLeads.length === 0 ? (
            <EmptyState
              title="No leads found"
              body="Try adjusting your search or filters to find what you're looking for."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground mono-label">
                    <th className="px-4 py-3 font-medium">Date Added</th>
                    <th className="px-4 py-3 font-medium">Lead</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Country</th>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium">NEET Qualified</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Quality</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLeads.map((l) => (
                    <tr
                      key={l.id}
                      className="group transition-colors hover:bg-foreground/[0.02] cursor-pointer"
                      onClick={() => setActive(l)}
                    >
                      <td className="px-4 py-3 text-muted-foreground font-mono text-[10px]">
                        {l.createdAt
                          ? new Date(l.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={l.name}
                            initials={l.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                            tone={l.quality === "junk" ? "junk" : l.quality === "hot" ? "hot" : "med"}
                          />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{l.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                        {l.phone}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-[11px] font-medium px-2 py-0.5 rounded-full border",
                          l.source?.toLowerCase().includes('meta') ? "bg-blue-50 text-blue-600 border-blue-100" :
                          l.source?.toLowerCase().includes('google') ? "bg-green-50 text-green-600 border-green-100" :
                          "bg-gray-50 text-gray-600 border-gray-100"
                        )}>
                          {l.source || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">
                        {l.destination || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[120px]">
                        {l.city || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "pill text-[10px] font-medium",
                          l.neetQualified?.toLowerCase() === 'yes' ? "bg-ok-soft text-ok" : "bg-muted text-muted-foreground"
                        )}>
                          {l.neetQualified || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={l.score} />
                      </td>
                      <td className="px-4 py-3">
                        <QualityBadge quality={l.quality} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge stage={l.stage} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
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
