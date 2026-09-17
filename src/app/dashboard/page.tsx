"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppShell } from "@/components/app-shell";
import {
  Bar,
  Donut,
  EmptyState,
  FunnelChart,
  KpiCard,
  LifecycleRail,
  Panel,
  PanelHead,
  QualityBadge,
  ScoreBadge,
  StatusBadge,
  Avatar,
} from "@/components/bits";
import { LeadDrawer } from "@/components/lead-drawer";
import { AssignPanel } from "@/components/assign-panel";
import { useStore, useVisibleLeads, type Lead, type Role } from "@/lib/store";
import { toast } from "sonner";

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

const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function DashboardPage() {
  const { user, followUps } = useStore();
  const leads = useVisibleLeads();
  const [active, setActive] = useState<Lead | null>(null);
  const role = user?.role ?? "admin";

  const title =
    role === "admin" ? "Command Center" : role === "manager" ? "Team Dashboard" : "My Day";

  return (
    <AppShell title={title} subtitle={`${role} view · sample workspace`}>
      <Panel className="px-4 py-3">
        <LifecycleRail stages={STAGES} current="AI Qualification" />
      </Panel>

      {role === "admin" && <AdminDash onOpen={setActive} />}
      {role === "manager" && <ManagerDash onOpen={setActive} />}
      {role === "telecaller" && (
        <TelecallerDash
          leads={leads}
          onOpen={setActive}
          dueToday={followUps.filter((f) => f.status === "Today").length}
        />
      )}

      <LeadDrawer lead={active} onOpenChange={(o) => !o && setActive(null)} />
    </AppShell>
  );
}

/* ---------------------------------- admin ---------------------------------- */

function AdminDash({ onOpen }: { onOpen: (l: Lead) => void }) {
  const { user, leads, team, campaigns } = useStore();
  const role = user?.role ?? "admin";
  const visibleLeads = useVisibleLeads();

  const totals = {
    leads: leads.length,
    qualified: leads.filter(l => l.quality !== 'junk').length,
    junk: leads.filter(l => l.quality === 'junk').length,
    aiCalls: leads.length, // approximation
    conversions: leads.filter(l => l.stage === 'Converted').length,
    newLeads: leads.filter(l => l.stage === 'New').length,
    aiSuccess: leads.filter(l => l.quality !== 'junk').length,
    followUps: leads.filter(l => l.stage === 'Contacted').length,
    applications: leads.filter(l => l.stage === 'Application').length,
    metaLeads: leads.filter(l => l.source?.toLowerCase().includes('meta') || l.metaCampaignId).length,
    googleLeads: leads.filter(l => l.source?.toLowerCase().includes('google')).length,
  };

  const qualitySplit = [
    { label: 'Hot', value: leads.filter(l => l.quality === 'hot').length, color: 'var(--color-hot)' },
    { label: 'High', value: leads.filter(l => l.quality === 'high').length, color: 'var(--color-high)' },
    { label: 'Medium', value: leads.filter(l => l.quality === 'medium').length, color: 'var(--color-med)' },
    { label: 'Low', value: leads.filter(l => l.quality === 'low').length, color: 'var(--color-low)' },
    { label: 'Junk', value: leads.filter(l => l.quality === 'junk').length, color: 'var(--color-junk)' },
  ];

  const sourceSplit = [
    { label: 'Meta', value: leads.filter(l => l.campaignId?.toLowerCase().includes('meta') || l.metaCampaignId).length, color: 'var(--color-primary)' },
    { label: 'Google', value: leads.filter(l => l.campaignId?.toLowerCase().includes('google')).length, color: 'var(--color-high)' },
    { label: 'WhatsApp', value: leads.filter(l => l.campaignId?.toLowerCase().includes('wa')).length, color: 'var(--color-med)' },
  ];

  const funnel = [
    { label: 'Total', value: totals.leads },
    { label: 'Qualified', value: totals.qualified },
    { label: 'Interested', value: leads.filter(l => l.stage === 'Interested').length },
    { label: 'Application', value: totals.applications },
    { label: 'Converted', value: totals.conversions },
  ];

  const callerPerf = team
    .filter(m => m.role === 'telecaller')
    .map(m => {
      const mLeads = leads.filter(l => l.assignedTo === m.memberId);
      return {
        id: m.memberId,
        assigned: mLeads.length,
        contacted: mLeads.filter(l => l.stage !== 'New').length,
        interested: mLeads.filter(l => l.stage === 'Interested').length,
        applications: mLeads.filter(l => l.stage === 'Applied').length,
        conversions: mLeads.filter(l => l.stage === 'Converted').length,
      };
    });

  const maxConv = Math.max(...callerPerf.map((c) => c.conversions), 1);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Total Leads" value={totals.leads} delta="8.2%" hint="+1,420 this week" />
        <KpiCard label="Meta Leads" value={totals.metaLeads} delta="5.1%" hint="from ads/site" />
        <KpiCard label="Google Leads" value={totals.googleLeads} delta="2.3%" positive={false} hint="from search" />
        <KpiCard label="AI Calls" value={totals.aiCalls} delta="11.9%" hint="75% connected" />
        <KpiCard label="Conversions" value={totals.conversions} delta="11.4%" hint="4.9% of leads" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="New Leads" value={totals.newLeads} delta="6.4%" hint="last 7 days" />
        <KpiCard label="Successful AI Calls" value={totals.aiSuccess} delta="9.8%" hint="completed & scored" />
        <KpiCard label="Follow-ups" value={totals.followUps} delta="3.1%" hint="open across team" />
        <KpiCard label="Applications" value={totals.applications} delta="7.7%" hint="16.4% of qualified" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHead title="Lead funnel" hint="Ad click to deposit" />
          <div className="p-4">
            <FunnelChart data={funnel} />
          </div>
        </Panel>
        <Panel>
          <PanelHead title="Lead sources" hint="Share of volume" />
          <div className="p-4">
            <Donut data={sourceSplit} centerLabel="leads" centerValue={totals.leads.toString()} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel>
          <PanelHead title="Lead quality" hint="AI scoring bands" />
          <div className="p-4">
            <Donut data={qualitySplit} centerLabel="qual %" centerValue="62.8" />
          </div>
        </Panel>
        <Panel className="xl:col-span-2">
          <PanelHead
            title="Telecaller leaderboard"
            hint="Conversion performance"
            action={
              <Link href="/team" className="text-[11px] font-medium text-primary hover:underline">
                View team
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-[12px]">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Telecaller", "Manager", "Assigned", "Contacted", "Interested", "Applications", "Conv.", "Rate"].map(
                    (h) => (
                      <th key={h} className="mono-label px-3 py-2 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {callerPerf.map((p) => {
                  const m = team.find(t => t.memberId === p.id)!;
                  return (
                    <tr key={`${p.id}-${m.memberId}`} className="transition-colors hover:bg-foreground/[0.03]">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={m.name}
                            initials={m.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()}
                          />
                          <span className="font-medium">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {team.find(t => t.memberId === m.managerId)?.name ?? "—"}
                      </td>
                      <td className="font-mono px-3 py-2.5">{p.assigned}</td>
                      <td className="font-mono px-3 py-2.5">{p.contacted}</td>
                      <td className="font-mono px-3 py-2.5">{p.interested}</td>
                      <td className="font-mono px-3 py-2.5">{p.applications}</td>
                      <td className="font-mono px-3 py-2.5">{p.conversions}</td>
                      <td className="w-[110px] px-3 py-2.5">
                        <Bar value={p.conversions} max={maxConv} tone="ok" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {role === "admin" && <TeamManagement />}

      <Panel>
        <PanelHead
          title="Campaign performance"
          hint="Spend, CPL, CPQL and conversions"
          action={
            <Link href="/campaigns" className="text-[11px] font-medium text-primary hover:underline">
              All campaigns
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[12px]">
            <thead>
              <tr className="border-b border-border text-left">
                {["Campaign", "Platform", "Spend", "Leads", "CPL", "Qualified", "CPQL", "Applications", "Conversions", "Conv. rate"].map(
                  (h) => (
                    <th key={h} className="mono-label px-3 py-2 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((c, index) => {
                const campaignLeads = leads.filter(l => l.campaignId === c.id).length;
                const qualifiedLeads = leads.filter(l => l.campaignId === c.id && l.quality !== 'junk').length;
                return (
                  <tr key={c.id || c._id || index} className="transition-colors hover:bg-foreground/[0.03]">
                  <td className="px-3 py-2.5 font-medium">{c.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.platform}</td>
                  <td className="font-mono px-3 py-2.5">{inr(c.spend)}</td>
                  <td className="font-mono px-3 py-2.5">{campaignLeads.toLocaleString("en-IN")}</td>
                  <td className="font-mono px-3 py-2.5">{c.spend && campaignLeads ? inr(Math.round(c.spend / campaignLeads)) : "—"}</td>
                  <td className="font-mono px-3 py-2.5">{qualifiedLeads.toLocaleString("en-IN")}</td>
                  <td className="font-mono px-3 py-2.5">
                    {c.spend && qualifiedLeads ? inr(Math.round(c.spend / qualifiedLeads)) : "—"}
                  </td>
                  <td className="font-mono px-3 py-2.5">{c.applications}</td>
                  <td className="font-mono px-3 py-2.5">{c.conversions}</td>
                  <td className="font-mono px-3 py-2.5">
                    {campaignLeads ? ((c.conversions / campaignLeads) * 100).toFixed(1) : "0.0"}%
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </Panel>

      <RecentLeads leads={visibleLeads} onOpen={onOpen} />
    </>
  );
}

/* --------------------------------- manager --------------------------------- */

function ManagerDash({ onOpen }: { onOpen: (l: Lead) => void }) {
  const { user, team, leads: allLeads } = useStore();
  const leads = useVisibleLeads();
  const unassigned = leads.filter((l) => !l.assignedTo && l.quality !== "junk");
  const hot = leads.filter((l) => l.quality === "hot");

  const qualitySplit = [
    { label: 'Hot', value: leads.filter(l => l.quality === 'hot').length, color: 'var(--color-hot)' },
    { label: 'High', value: leads.filter(l => l.quality === 'high').length, color: 'var(--color-high)' },
    { label: 'Medium', value: leads.filter(l => l.quality === 'medium').length, color: 'var(--color-med)' },
    { label: 'Low', value: leads.filter(l => l.quality === 'low').length, color: 'var(--color-low)' },
    { label: 'Junk', value: leads.filter(l => l.quality === 'junk').length, color: 'var(--color-junk)' },
  ];

  const telecallers = team.filter(m => m.role === "telecaller");
  const callerPerformance = telecallers.map(m => {
    const mLeads = allLeads.filter(l => l.assignedTo === m.memberId);
    return {
      id: m.memberId,
      assigned: mLeads.length,
      contacted: mLeads.filter(l => l.stage !== 'New').length,
      interested: mLeads.filter(l => l.stage === 'Interested').length,
      applications: mLeads.filter(l => l.stage === 'Applied').length,
      conversions: mLeads.filter(l => l.stage === 'Converted').length,
    };
  });

  const myCallers = telecallers.filter((t) => t.managerId === user?.memberId);
  const myPerformance = callerPerformance.filter((p) => {
    const caller = telecallers.find(t => t.memberId === p.id);
    return caller?.managerId === user?.memberId;
  });
  const maxConv = myPerformance.length > 0
    ? Math.max(...myPerformance.map((c) => c.conversions))
    : 1;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Team leads" value={leads.length * 27} delta="4.8%" hint="active pool" />
        <KpiCard label="New qualified" value={186} delta="9.2%" hint="awaiting review" />
        <KpiCard label="Hot leads" value={hot.length * 9} delta="12.5%" hint="call within 24h" />
        <KpiCard label="Unassigned" value={unassigned.length} positive={false} delta="6.0%" hint="needs routing" />
        <KpiCard label="Follow-ups today" value={14} delta="2.4%" hint="across 5 callers" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelHead title="Team performance" hint="This month" />
          <div className="space-y-3 p-4">
            {myCallers.map((t) => {
              const p = callerPerformance.find((c) => c.id === t.id)!;
              return (
                <div key={t.id} className="flex items-center gap-3">
                  <Avatar name={t.name} initials={t.initials} />
                  <span className="w-32 shrink-0 truncate text-[12px] font-medium">{t.name}</span>
                  <div className="min-w-0 flex-1">
                    <Bar value={p.conversions} max={maxConv} tone="primary" />
                  </div>
                  <span className="font-mono w-28 text-right text-[11px] text-faint">
                    {p.assigned} leads · {p.conversions} conv
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel>
          <PanelHead title="Lead quality" hint="Team pool" />
          <div className="p-4">
            <Donut data={qualitySplit} centerLabel="qual %" centerValue="62.8" />
          </div>
        </Panel>
      </div>

      <AssignPanel leads={unassigned} />
      <TeamManagement />
      <RecentLeads leads={leads} onOpen={onOpen} />
    </>
  );
}

/* ------------------------------- telecaller -------------------------------- */

function TelecallerDash({
  leads,
  onOpen,
  dueToday,
}: {
  leads: Lead[];
  onOpen: (l: Lead) => void;
  dueToday: number;
}) {
  const priority = [...leads].sort((a, b) => b.score - a.score).slice(0, 6);
  const hot = leads.filter((l) => l.quality === "hot").length;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="My leads" value={leads.length} delta="3.0%" hint="assigned to me" />
        <KpiCard label="Hot leads" value={hot} delta="10.0%" hint="call first" />
        <KpiCard label="Calls pending" value={Math.max(leads.length - 4, 0)} hint="queue" />
        <KpiCard label="Follow-ups today" value={dueToday} hint="scheduled" />
        <KpiCard label="Conversions" value={7} delta="14.0%" hint="this month" />
      </div>

      <Panel>
        <PanelHead title="Priority leads" hint="Sorted by AI score" />
        {priority.length === 0 ? (
          <EmptyState
            title="Nothing in your queue"
            body="No leads are assigned to you yet. Your manager will route qualified leads here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {priority.map((l) => (
              <li key={l.id} className="p-4 transition-colors hover:bg-foreground/[0.03]">
                <div className="flex flex-wrap items-center gap-2">
                  <Avatar
                    name={l.name}
                    initials={l.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    tone={l.quality === "hot" ? "hot" : "med"}
                  />
                  <span className="text-[13px] font-medium">{l.name}</span>
                  <QualityBadge quality={l.quality} />
                  <ScoreBadge score={l.score} />
                  <span className="font-mono text-[10px] text-faint">
                    {l.program} · {l.budget} · Intake {l.intake} · {l.academic}
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {l.aiSummary}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => toast.success(`Dialling ${l.name}…`)}
                    className="h-8 rounded-xl bg-primary px-3 text-[12px] font-medium text-primary-foreground"
                  >
                    Call
                  </button>
                  <button
                    onClick={() => toast.success(`WhatsApp drafted for ${l.name}`)}
                    className="h-8 rounded-xl border border-border px-3 text-[12px] font-medium"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => onOpen(l)}
                    className="h-8 rounded-xl border border-border px-3 text-[12px] font-medium"
                  >
                    View lead
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

/* ------------------------------- shared block ------------------------------ */

function RecentLeads({ leads, onOpen }: { leads: Lead[]; onOpen: (l: Lead) => void }) {
  const { campaigns } = useStore();
  const campaignById = (id: string) => campaigns.find(c => c.id === id) || { name: "Unknown" };

  return (
    <Panel>
      <PanelHead
        title="Recent leads"
        hint="Newest first"
        action={
          <Link href="/leads" className="text-[11px] font-medium text-primary hover:underline">
            All leads
          </Link>
        }
      />
      {leads.length === 0 ? (
        <EmptyState title="No leads yet" body="New leads appear here as campaigns deliver." />
      ) : (
        <ul className="divide-y divide-border">
          {leads.slice(0, 8).map((l, index) => (
            <li key={`${l.id}-${index}`}>
              <button
                onClick={() => onOpen(l)}
                className="grid w-full grid-cols-[minmax(0,1.6fr)_auto] items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-foreground/[0.03] sm:grid-cols-[1.6fr_1fr_auto_auto_auto]"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar
                    name={l.name}
                    initials={l.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    tone={l.quality === "junk" ? "junk" : l.quality === "hot" ? "hot" : "med"}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium">{l.name}</span>
                    <span className="font-mono block truncate text-[10px] text-faint">
                      {l.phone}
                    </span>
                  </span>
                </span>
                <span className="hidden truncate text-[11px] text-muted-foreground sm:block">
                  {campaignById(l.campaignId).name}
                </span>
                <span className="hidden sm:block">
                  <ScoreBadge score={l.score} />
                </span>
                <span className="hidden sm:block">
                  <QualityBadge quality={l.quality} />
                </span>
                <StatusBadge stage={l.stage} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function TeamManagement() {
  const { user, team, fetchTeam } = useStore();
  const [open, setOpen] = useState<Role | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  async function addUser(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const res = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: open,
          memberId: `MEM_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        }),
      });

      if (!res.ok) throw new Error("Failed to create user");
      toast.success(`${open} created successfully`);
      await fetchTeam();
      setOpen(null);
      setForm({ firstName: "", lastName: "", email: "", phone: "", password: "" });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {user?.role === "admin" && (
        <Panel>
          <PanelHead
            title="Managers"
            action={
              <button
                onClick={() => setOpen("manager")}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground"
              >
                <Plus className="size-3" /> Add Manager
              </button>
            }
          />
          <div className="divide-y divide-border">
            {team.filter(m => m.role === "manager").length === 0 ? (
              <div className="p-3 text-center text-[11px] text-faint">No managers found</div>
            ) : (
              team.filter(m => m.role === "manager").map(m => (
                <div key={m.memberId} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={m.name}
                      initials={m.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()}
                    />
                    <span className="text-[13px] font-medium">{m.name}</span>
                  </div>
                  <span className="mono-label text-[11px]">{m.memberId}</span>
                </div>
              ))
            )}
          </div>
        </Panel>
      )}

      <Panel>
        <PanelHead
          title="Telecallers"
          action={
            <button
              onClick={() => setOpen("telecaller")}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground"
            >
              <Plus className="size-3" /> Add Telecaller
            </button>
          }
        />
        <div className="divide-y divide-border">
          {team.filter(m => m.role === "telecaller").length === 0 ? (
            <div className="p-3 text-center text-[11px] text-faint">No telecallers found</div>
          ) : (
            team.filter(m => m.role === "telecaller").map(m => (
              <div key={m.memberId} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={m.name}
                    initials={m.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase()}
                  />
                  <span className="text-[13px] font-medium">{m.name}</span>
                </div>
                <span className="mono-label text-[11px]">{m.memberId}</span>
              </div>
            ))
          )}
        </div>
      </Panel>

      {open && (
        <Dialog open={true} onOpenChange={() => setOpen(null)}>
          <DialogContent className="max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Add New {open}</DialogTitle>
              <DialogDescription>Create a new system account for this team member.</DialogDescription>
            </DialogHeader>
            <form onSubmit={addUser} className="space-y-3">
              {user?.role === "admin" && (
                <div className="flex gap-4 p-2 rounded-xl bg-surface border border-border">
                  <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="manager"
                      checked={open === "manager"}
                      onChange={(e) => setOpen(e.target.value as Role)}
                      className="size-3 accent-primary"
                    />
                    Manager
                  </label>
                  <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="telecaller"
                      checked={open === "telecaller"}
                      onChange={(e) => setOpen(e.target.value as Role)}
                      className="size-3 accent-primary"
                    />
                    Telecaller
                  </label>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="First name"
                  autoComplete="off"
                  className="rounded-xl border bg-surface px-3 py-2 text-[13px] outline-none"
                  value={form.firstName}
                  onChange={e => setForm({...form, firstName: e.target.value})}
                />
                <input
                  placeholder="Last name"
                  autoComplete="off"
                  className="rounded-xl border bg-surface px-3 py-2 text-[13px] outline-none"
                  value={form.lastName}
                  onChange={e => setForm({...form, lastName: e.target.value})}
                />
              </div>
              <input
                placeholder="Email"
                autoComplete="off"
                className="w-full rounded-xl border bg-surface px-3 py-2 text-[13px] outline-none"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
              />
              <input
                placeholder="Phone"
                autoComplete="off"
                className="w-full rounded-xl border bg-surface px-3 py-2 text-[13px] outline-none"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
              />
              <input
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                className="w-full rounded-xl border bg-surface px-3 py-2 text-[13px] outline-none"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-2 text-[13px] font-medium text-primary-foreground"
              >
                Create Account
              </button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}