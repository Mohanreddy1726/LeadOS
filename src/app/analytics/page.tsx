"use client";

import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead, KpiCard, FunnelChart, Donut } from "@/components/bits";
import { useStore } from "@/lib/store";
import { BarChart3, TrendingUp, Zap, Target } from "lucide-react";

export default function AnalyticsPage() {
  const { leads } = useStore();

  const totals = {
    leads: leads.length,
    qualified: leads.filter(l => l.stage === "Qualified").length,
    conversions: leads.filter(l => l.stage === "Converted").length,
  };

  const qualitySplit = [
    { label: "Hot", value: leads.filter(l => l.quality === "hot").length, color: "bg-hot" },
    { label: "Warm", value: leads.filter(l => l.quality === "warm").length, color: "bg-high" },
    { label: "Cold", value: leads.filter(l => l.quality === "cold").length, color: "bg-med" },
    { label: "Junk", value: leads.filter(l => l.quality === "junk").length, color: "bg-border" },
  ];

  const sourceSplit = leads.reduce((acc: any, l) => {
    const id = l.campaignId || "Unknown";
    const entry = acc.find((a: any) => a.label === id);
    if (entry) entry.value++;
    else acc.push({ label: id, value: 1, color: "bg-primary" });
    return acc;
  }, []);

  const funnel = [
    { stage: "New", value: leads.filter(l => l.stage === "New").length },
    { stage: "Contacted", value: leads.filter(l => l.stage === "Contacted").length },
    { stage: "Interested", value: leads.filter(l => l.stage === "Interested").length },
    { stage: "Qualified", value: leads.filter(l => l.stage === "Qualified").length },
    { stage: "Applied", value: leads.filter(l => l.stage === "Applied").length },
    { stage: "Converted", value: leads.filter(l => l.stage === "Converted").length },
  ];

  return (
    <AppShell
      title="Workspace Analytics"
      subtitle="Intelligence metrics across the entire lead lifecycle"
    >
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label="Total Throughput"
            value={totals.leads}
            delta="14.2%"
            hint="leads processed"
          />
          <KpiCard
            label="Qualification Rate"
            value={`${((totals.qualified / totals.leads) * 100).toFixed(1)}%`}
            delta="3.1%"
            hint="lead to qualified"
          />
          <KpiCard
            label="Conversion Rate"
            value={`${((totals.conversions / totals.leads) * 100).toFixed(1)}%`}
            delta="1.8%"
            hint="lead to deposit"
          />
          <KpiCard
            label="Cost per Qual"
            value="₹ 420"
            delta="6.4%"
            positive={false}
            hint="average CPQL"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Panel className="xl:col-span-2">
            <PanelHead
              title="Conversion Funnel"
              hint="Drop-off analysis from initial click to final deposit"
            />
            <div className="p-6">
              <FunnelChart data={funnel} />
            </div>
          </Panel>
          <Panel>
            <PanelHead
              title="Quality Distribution"
              hint="AI scoring across lead pool"
            />
            <div className="p-6">
              <Donut
                data={qualitySplit}
                centerLabel="avg score"
                centerValue="68"
              />
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Panel>
            <PanelHead
              title="Source Mix"
              hint="Volume share by platform"
            />
            <div className="p-6">
              <Donut
                data={sourceSplit}
                centerLabel="total"
                centerValue="12.5k"
              />
            </div>
          </Panel>
          <Panel className="xl:col-span-2">
            <PanelHead
              title="Performance Trends"
              hint="Weekly conversion momentum"
            />
            <div className="p-6 flex items-end gap-2 h-48">
              {[40, 60, 45, 90, 65, 80, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-primary transition-all duration-500"
                    style={{ height: `${h}%` }}
                  />
                  <span className="mono-label text-[10px] text-faint">Day {i + 1}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
