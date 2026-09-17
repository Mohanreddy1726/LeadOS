"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead, KpiCard } from "@/components/bits";
import { useStore } from "@/lib/store";
import { ArrowLeft, TrendingUp, Users, DollarSign, Target, MousePointer2 } from "lucide-react";
import Link from "next/link";

const inr = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export default function AdInsightsPage() {
  const { id } = useParams();
  const { campaigns, adsets, ads } = useStore();

  // Find the asset across all levels
  const asset = useMemo(() => {
    return campaigns.find(c => (c._id || c.id) === id) ||
           adsets.find(a => (a._id || a.id) === id) ||
           ads.find(a => (a._id || a.id) === id);
  }, [id, campaigns, adsets, ads]);

  if (!asset) {
    return (
      <AppShell title="Insights">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="p-4 bg-muted rounded-full mb-4">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-medium">Asset not found</h2>
          <p className="text-muted-foreground text-sm mb-6">We couldn't find the campaign or ad you're looking for.</p>
          <Link href="/campaigns" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
            Back to Campaigns
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={asset.name}
      subtitle={`Detailed performance insights for ${asset.platform} asset`}
    >
      <div className="grid gap-6">
        {/* Header Actions */}
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/campaigns"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to breakdown
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${asset.status === 'ACTIVE' ? 'bg-ok/10 text-ok' : 'bg-muted text-muted-foreground'}`}>
            {asset.status || 'Unknown'}
          </span>
        </div>

        {/* Primary KPIs - Matching Meta Ads Manager Layout */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KpiCard
            label="Results"
            value={(asset.conversions || 0).toLocaleString("en-IN")}
            hint="Total leads"
          />
          <KpiCard
            label="Cost per result"
            value={asset.conversions > 0 ? inr(Math.round(asset.spend / asset.conversions)) : "—"}
            hint="Avg. CPL"
          />
          <KpiCard
            label="Amount spent"
            value={inr(asset.spend || 0)}
            hint="Total cost"
          />
          <KpiCard
            label="Reach"
            value={(asset.reach || 0).toLocaleString("en-IN")}
            hint="Unique viewers"
          />
          <KpiCard
            label="Impressions"
            value={(asset.impressions || 0).toLocaleString("en-IN")}
            hint="Total views"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Performance Chart Area (Placeholder for actual chart) */}
          <Panel className="lg:col-span-2">
            <PanelHead
              title="Performance Over Time"
              hint="Daily results and spend trend"
            />
            <div className="h-[300px] w-full flex flex-col items-center justify-center bg-muted/30 rounded-xl border border-dashed border-border text-muted-foreground">
              <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-xs font-mono">Time-series data visualization</p>
              <p className="text-[10px] opacity-60">Data available upon API integration of daily insights</p>
            </div>
          </Panel>

          {/* Quick Stats Side Panel */}
          <div className="grid gap-6">
            <Panel>
              <PanelHead title="Efficiency" hint="Engagement metrics" />
              <div className="space-y-4 py-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <MousePointer2 className="h-3 w-3" /> CPC
                  </span>
                  <span className="text-xs font-mono font-medium">
                    {asset.clicks > 0 ? inr(asset.spend / asset.clicks) : "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3" /> CTR
                  </span>
                  <span className="text-xs font-mono font-medium">
                    {asset.impressions > 0 ? ((asset.clicks / asset.impressions) * 100).toFixed(2) : "0.00"}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-2">
                    <Target className="h-3 w-3" /> Conv. Rate
                  </span>
                  <span className="text-xs font-mono font-medium">
                    {asset.clicks > 0 ? ((asset.conversions / asset.clicks) * 100).toFixed(2) : "0.00"}%
                  </span>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHead title="Platform" hint="Distribution" />
              <div className="py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{asset.platform}</span>
                  <span className="font-mono font-medium">100%</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full" />
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Demographics Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel>
            <PanelHead title="Age & Gender" hint="Demographic reach" />
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead className="text-muted-foreground mono-label">
                  <tr>
                    <th className="py-2 font-medium">Segment</th>
                    <th className="py-2 font-medium text-right">Results</th>
                    <th className="py-2 font-medium text-right">Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { s: "18-24", r: "12", sp: inr(1200) },
                    { s: "25-34", r: "45", sp: inr(4500) },
                    { s: "35-44", r: "22", sp: inr(2800) },
                    { s: "45+", r: "8", sp: inr(900) },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-foreground/[0.01]">
                      <td className="py-2">{row.s}</td>
                      <td className="py-2 text-right font-mono">{row.r}</td>
                      <td className="py-2 text-right font-mono">{row.sp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Top Regions" hint="Geographic performance" />
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead className="text-muted-foreground mono-label">
                  <tr>
                    <th className="py-2 font-medium">Region</th>
                    <th className="py-2 font-medium text-right">Results</th>
                    <th className="py-2 font-medium text-right">Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { r: "Maharashtra", res: "84", sp: inr(8400) },
                    { r: "Delhi", res: "32", sp: inr(3200) },
                    { r: "Karnataka", res: "21", sp: inr(2100) },
                    { r: "Gujarat", res: "15", sp: inr(1500) },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-foreground/[0.01]">
                      <td className="py-2">{row.r}</td>
                      <td className="py-2 text-right font-mono">{row.res}</td>
                      <td className="py-2 text-right font-mono">{row.sp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
