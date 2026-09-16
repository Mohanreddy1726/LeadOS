"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead, KpiCard } from "@/components/bits";
import { useStore } from "@/lib/store";
import { Megaphone, TrendingUp, DollarSign, Users, RefreshCw } from "lucide-react";

const inr = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function CampaignsPage() {
  const { campaigns, leads, setCampaigns } = useStore();
  const [syncing, setSyncing] = useState(false);
  const totalSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalLeads = leads.length;
  const totalConverted = leads.filter(l => l.stage === "Converted").length;
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem("leados.token");
      const res = await fetch("/api/meta/sync", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setCampaigns(data.data);
        }
        alert("Campaigns synced successfully!");
      } else {
        alert("Failed to sync campaigns.");
      }
    } catch (err) {
      console.error("Sync error:", err);
      alert("An error occurred while syncing campaigns.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AppShell
      title="Campaign Performance"
      subtitle={`Analyzing ${campaigns.length} active acquisition channels`}
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Total Spend"
            value={inr(totalSpend)}
            delta="12.4%"
            hint="last 30 days"
          />
          <KpiCard
            label="Total Leads"
            value={totalLeads.toLocaleString("en-IN")}
            delta="8.1%"
            hint="all sources"
          />
          <KpiCard
            label="Avg. CPL"
            value={inr(avgCpl)}
            delta="4.2%"
            positive={false}
            hint="cost per lead"
          />
          <KpiCard
            label="Conversion Rate"
            value={`${((totalConverted / totalLeads) * 100).toFixed(2)}%`}
            delta="2.1%"
            hint="lead to deposit"
          />
        </div>

        <Panel>
          <PanelHead
            title="Channel Breakdown"
            hint="Granular performance metrics by campaign and platform"
            action={
              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 h-8 rounded-xl bg-secondary px-3 text-[12px] font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync Meta"}
                </button>
                <button className="h-8 rounded-xl bg-primary px-3 text-[12px] font-medium text-primary-foreground">
                  New Campaign
                </button>
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] text-left border-collapse">
              <thead className="border-b border-border text-muted-foreground mono-label">
                <tr>
                  <th className="px-4 py-3 font-medium">Campaign</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Spend</th>
                  <th className="px-4 py-3 font-medium">Leads</th>
                  <th className="px-4 py-3 font-medium">CPL</th>
                  <th className="px-4 py-3 font-medium">Qualified</th>
                  <th className="px-4 py-3 font-medium">CPQL</th>
                  <th className="px-4 py-3 font-medium">Conv.</th>
                  <th className="px-4 py-3 font-medium text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => {
                  const campaignLeads = leads.filter(l => l.campaignId === c._id || l.campaignId === c.id);
                  const qualified = campaignLeads.filter(l => l.stage === "Qualified").length;
                  const conversions = campaignLeads.filter(l => l.stage === "Converted").length;
                  const leadCount = campaignLeads.length;
                  return (
                    <tr key={c._id || c.id} className="group transition-colors hover:bg-foreground/[0.02]">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.platform}</td>
                      <td className="px-4 py-3 font-mono">{inr(c.spend || 0)}</td>
                      <td className="px-4 py-3 font-mono">{leadCount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 font-mono">{leadCount > 0 ? inr(Math.round((c.spend || 0) / leadCount)) : "—"}</td>
                      <td className="px-4 py-3 font-mono">{qualified.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 font-mono">{qualified > 0 ? inr(Math.round((c.spend || 0) / qualified)) : "—"}</td>
                      <td className="px-4 py-3 font-mono">{conversions}</td>
                      <td className="px-4 py-3 text-right font-medium text-ok">
                        {leadCount > 0 ? ((conversions / leadCount) * 100).toFixed(1) : "0.0"}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
