"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead, KpiCard } from "@/components/bits";
import { useStore } from "@/lib/store";
import { Megaphone, TrendingUp, DollarSign, Users, RefreshCw } from "lucide-react";

const inr = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function CampaignsPage() {
  const { campaigns, adsets, ads, leads, setCampaigns, setAdsets, setAds } = useStore();
  const [view, setView] = useState<"campaigns" | "adsets" | "ads">("campaigns");
  const [syncing, setSyncing] = useState(false);

  const currentData = useMemo(() => {
    const data = view === "campaigns" ? campaigns : view === "adsets" ? adsets : ads;
    return [...data]
      .filter(item => item.status !== 'DELETED')
      .sort((a, b) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
        return 0;
      });
  }, [view, campaigns, adsets, ads]);

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
        // The sync API now returns counts, not the full list.
        // We need to fetch the latest data from the database.
        const [cRes, asRes, adRes] = await Promise.all([
          fetch("/api/campaigns", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("/api/adsets", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("/api/ads", { headers: { "Authorization": `Bearer ${token}` } }),
        ]);
        if (cRes.ok) setCampaigns(await cRes.json());
        if (asRes.ok) setAdsets(await asRes.json());
        if (adRes.ok) setAds(await adRes.json());

        alert("All Meta assets synced successfully!");
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
            hint="Granular performance metrics by campaign, adset and ad"
            action={
              <div className="flex gap-2">
                <div className="flex p-1 bg-muted rounded-xl mr-2">
                  {(["campaigns", "adsets", "ads"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1, -1)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 h-8 rounded-xl bg-secondary px-3 text-[12px] font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Syncing..." : "Sync Meta"}
                </button>
              </div>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] text-left border-collapse">
              <thead className="border-b border-border text-muted-foreground mono-label">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Reach</th>
                  <th className="px-4 py-3 font-medium">Spend</th>
                  <th className="px-4 py-3 font-medium">CPC</th>
                  <th className="px-4 py-3 font-medium">Leads</th>
                  <th className="px-4 py-3 font-medium">CPL</th>
                  <th className="px-4 py-3 font-medium">Qualified</th>
                  <th className="px-4 py-3 font-medium">CPQL</th>
                  <th className="px-4 py-3 font-medium">Conv.</th>
                  <th className="px-4 py-3 font-medium text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentData.map((c) => {
                  const campaignLeads = leads.filter(l => l.campaignId === c.metaCampaignId || l.campaignId === c._id || l.campaignId === c.id || l.campaignId === c.metaAdSetId || l.campaignId === c.metaAdId);
                  const qualified = campaignLeads.filter(l => l.stage === "Qualified").length;
                  const conversions = campaignLeads.filter(l => l.stage === "Converted").length;
                  const leadCount = campaignLeads.length;
                  const cpc = c.clicks > 0 ? (c.spend || 0) / c.clicks : 0;
                  return (
                    <tr key={c._id || c.id} className="group transition-colors hover:bg-foreground/[0.02]">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${c.status === 'ACTIVE' ? 'bg-ok/10 text-ok' : 'bg-muted text-muted-foreground'}`}>
                          {c.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.platform}</td>
                      <td className="px-4 py-3 font-mono">{ (c.reach || 0).toLocaleString("en-IN") }</td>
                      <td className="px-4 py-3 font-mono">{inr(c.spend || 0)}</td>
                      <td className="px-4 py-3 font-mono">{cpc > 0 ? inr(cpc) : "—"}</td>
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
