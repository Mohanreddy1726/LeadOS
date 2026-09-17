"use client";

import { useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QualityBadge, ScoreBadge, StatusBadge, Avatar } from "@/components/bits";
import { FollowUpModal } from "@/components/follow-up-modal";
import { useStore, type Lead } from "@/lib/store";
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

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const TRANSCRIPT = [
  { t: "00:04", who: "AI", text: "Hi, am I speaking with the student who enquired about studying abroad?" },
  { t: "00:08", who: "Lead", text: "Yes, that's me." },
  { t: "00:11", who: "AI", text: "Great. Which programme are you planning to apply for?" },
  { t: "00:16", who: "Lead", text: "I'm looking at MBBS, ideally starting next year." },
  { t: "00:22", who: "AI", text: "Do you have a preferred country and an approximate budget in mind?" },
  { t: "00:29", who: "Lead", text: "Georgia mostly, around 20 to 25 lakhs for the whole course." },
  { t: "00:38", who: "AI", text: "Understood. Have you appeared for NEET, and are your documents ready?" },
  { t: "00:46", who: "Lead", text: "Yes, NEET qualified. Marksheets are ready, passport is in process." },
  { t: "00:55", who: "AI", text: "Perfect. A counsellor will call you with shortlisted universities. Is the afternoon fine?" },
  { t: "01:02", who: "Lead", text: "Afternoon works, thank you." },
];

export function LeadDrawer({
  lead,
  onOpenChange,
}: {
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={!!lead} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto bg-surface p-0 sm:max-w-[520px]"
      >
        <SheetTitle className="sr-only">Lead details</SheetTitle>
        {lead ? <LeadDetail lead={lead} /> : null}
      </SheetContent>
    </Sheet>
  );
}

export function LeadDetail({ lead }: { lead: any }) {
  const { setStage, team, aiCalls, campaigns, adsets, ads } = useStore();
  const caller = team.find(t => t.memberId === lead.assignedTo);
  const calls = aiCalls.filter(c => c.leadId === lead.id);
  const stageIdx = STAGES.indexOf(lead.stage);
  const campaign = campaigns.find(c => c._id === lead.campaignId || c.id === lead.campaignId || c.metaCampaignId === lead.metaCampaignId);
  const adset = adsets.find(as => as._id === lead.metaAdSetId || as.id === lead.metaAdSetId);
  const ad = ads.find(a => a._id === lead.metaAdId || a.id === lead.metaAdId);

  return (
    <div className="flex flex-col">
      {/* header */}
      <div className="flex items-start gap-3 border-b border-border px-4 pt-5 pb-4">
        <Avatar
          name={lead.name}
          initials={lead.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2)}
          tone={lead.quality === "junk" ? "junk" : lead.quality === "hot" ? "hot" : "med"}
          className="size-10 rounded-xl text-[13px]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-[16px] leading-none font-semibold">{lead.name}</h2>
            <QualityBadge quality={lead.quality} />
            <StatusBadge stage={lead.stage} />
          </div>
          <p className="font-mono mt-2 text-[10px] text-faint">
            {lead.id} · {lead.phone} · {lead.email}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {lead.source} · {lead.source?.toLowerCase().includes('website') ? "Direct Inquiry" : (campaign?.name ?? "Unknown")}
          </p>
        </div>
      </div>

      {/* lifecycle */}
      <div className="border-b border-border px-4 py-3">
        <div className="mono-label mb-2">Lifecycle · stage {Math.max(stageIdx + 1, 0)}/14</div>
        <div className="flex flex-wrap gap-1">
          {STAGES.map((s, i) => (
            <span
              key={s}
              className={cn(
                "rounded-md px-1.5 py-1 text-[9px] font-medium",
                lead.stage === "Junk"
                  ? "bg-junk-soft text-junk"
                  : i < stageIdx
                    ? "bg-ok-soft text-ok"
                    : i === stageIdx
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-faint",
              )}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* AI score */}
      <div className="flex items-center gap-4 border-b border-border px-4 py-4">
        <div className="relative size-[84px] shrink-0">
          <div
            className="size-full rounded-full"
            style={{
              background: `conic-gradient(var(--color-primary) 0 ${lead.score}%, var(--border) ${lead.score}% 100%)`,
            }}
            role="img"
            aria-label={`AI score ${lead.score} out of 100`}
          />
          <div className="absolute inset-[9px] grid place-items-center rounded-full bg-surface shadow-[var(--shadow-bubble)]">
            <span className="font-display text-[20px] font-semibold">{lead.score}</span>
          </div>
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="mono-label">AI score /100</div>
          <div className="text-[12px] font-medium">
            {lead.qualification} · Intent {lead.intent}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="pill bg-ok-soft text-ok">Budget {lead.budget}</span>
            <span className="pill bg-med-soft text-med">Intake {lead.intake}</span>
            <span className="pill bg-muted text-muted-foreground">{lead.timeline}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="overview" className="px-4 py-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai">AI call</TabsTrigger>
            <TabsTrigger value="calls">Calls</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 pt-4">
            <Facts
              rows={[
                ["Program", lead.program],
                ["Preferred destination", lead.destination],
                ["Budget", lead.budget],
                ["Intake", lead.intake],
                ["Academic status", lead.academic],
                ["Documents", lead.documents],
                ["Meta Campaign", campaign?.name ?? lead.metaCampaignId ?? "—"],
                ["Meta Ad Set", adset?.name ?? lead.metaAdSetId ?? "—"],
                ["Meta Ad", ad?.name ?? lead.metaAdId ?? "—"],
                ["Owner", caller?.name ?? "Unassigned"],
                ["Manager", team.find(t => t.memberId === lead.managerId)?.name ?? "—"],
                ["Created", fmtDate(lead.createdAt)],
                ["Last contact", lead.lastContact ? fmtDate(lead.lastContact) : "—"],
                ["Next follow-up", lead.nextFollowUp ? fmtDate(lead.nextFollowUp) : "—"],
              ]}
            />
            <div className="clay-inset p-3">
              <div className="mono-label mb-1.5">Why this lead was classified this way</div>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{lead.reason}</p>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 pt-4">
            <div className="clay-inset p-3">
              <div className="mono-label mb-1.5">AI summary</div>
              <p className="text-[12px] leading-relaxed">{lead.aiSummary}</p>
            </div>
            <CallPlayer duration={272} />
            <div className="space-y-2">
              <div className="mono-label mb-2">Transcript</div>
              <ul className="space-y-2.5">
                {TRANSCRIPT.map((t) => (
                  <li key={t.t} className={cn("transition-colors", t.who === "Lead" && "border-l-2 border-border pl-3")}>
                    <span className="font-mono text-[9px] text-faint">{t.t}</span>
                    {t.who === "AI" && <span className="pill ml-1.5 bg-primary-soft text-primary">AI</span>}
                    <p className="mt-0.5 text-[11px] leading-relaxed text-pretty">{t.text}</p>
                  </li>
                ))}
              </ul>
            </div>
            <Facts
              title="Extracted information"
              rows={[
                ["Program", lead.program],
                ["Budget", lead.budget],
                ["Intake", lead.intake],
                ["Eligibility", lead.academic],
                ["Preferred country", lead.destination],
                ["Documents", lead.documents],
                ["Timeline", lead.timeline],
              ]}
            />
          </TabsContent>

          <TabsContent value="calls" className="space-y-3 pt-4">
            <div className="mono-label">AI call attempts</div>
            {calls.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">No AI call attempts logged yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {calls.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 py-2.5 text-[11px]">
                    <span className="font-mono text-faint">{fmtDateTime(c.at)}</span>
                    <span className="pill bg-muted text-muted-foreground">{c.status}</span>
                    <span className="font-mono ml-auto text-faint">
                      {Math.floor(c.durationSec / 60)}m {c.durationSec % 60}s
                    </span>
                    {c.score ? <ScoreBadge score={c.score} /> : null}
                  </li>
                ))}
              </ul>
            )}
            <div className="mono-label pt-2">Human call history</div>
            <ul className="divide-y divide-border">
              {[
                ["Priya Nair", "12 Jun · 3:10 PM", "6m 04s", "Interested", "Wants a university shortlist by Friday."],
                ["Priya Nair", "09 Jun · 11:20 AM", "2m 38s", "Callback", "Asked to call after college hours."],
              ].map(([who, when, dur, outcome, note], i) => (
                <li key={i} className="py-2.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-medium">{who}</span>
                    <span className="font-mono text-faint">{when}</span>
                    <span className="font-mono ml-auto text-faint">{dur}</span>
                    <span className="pill bg-ok-soft text-ok">{outcome}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="timeline" className="pt-4">
            <ol className="relative space-y-4 pl-5">
              <span className="absolute top-1.5 bottom-1.5 left-[5px] w-px bg-border" aria-hidden />
              {[
                ["Lead created", `${lead.source} · ${fmtDate(lead.createdAt)}`, true],
                ["Validated & deduplicated", "Phone and email verified", true],
                ["AI call started", "Auto-dialer queue", true],
                ["AI call completed", "4m 32s", true],
                ["AI qualification", lead.qualification, true],
                ["Score generated", `${lead.score}/100 · intent ${lead.intent}`, true],
                ["Manager review", team.find(t => t.memberId === lead.managerId)?.name ?? "Pending", stageIdx >= 7],
                ["Assigned", caller?.name ?? "Unassigned", !!caller],
                ["Human call", lead.lastContact ? fmtDate(lead.lastContact) : "Pending", !!lead.lastContact],
                ["Follow-up scheduled", lead.nextFollowUp ? fmtDate(lead.nextFollowUp) : "None", !!lead.nextFollowUp],
              ].map(([label, meta, done]) => (
                <li key={label as string} className="relative">
                  <span
                    className={cn(
                      "absolute top-1 -left-5 size-2.5 rounded-full",
                      done ? "bg-ok" : "bg-foreground/15",
                    )}
                    aria-hidden
                  />
                  <div className={cn("text-[11px] font-medium", !done && "text-faint")}>
                    {label as string}
                  </div>
                  <div className="font-mono text-[9px] text-faint">{meta as string}</div>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </div>

      {/* actions */}
      <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-border bg-surface px-4 py-3">
        <button
          onClick={() => toast.success(`Dialling ${lead.name}…`)}
          className="h-9 flex-1 rounded-xl bg-primary text-[12px] font-medium text-primary-foreground shadow-[var(--shadow-bubble)]"
        >
          Call now
        </button>
        <button
          onClick={() => toast.success(`WhatsApp message drafted for ${lead.name}`)}
          className="h-9 flex-1 rounded-xl border border-border bg-surface text-[12px] font-medium"
        >
          WhatsApp
        </button>
        <FollowUpModal
          leadId={lead.id}
          trigger={
            <button className="h-9 flex-1 rounded-xl border border-border bg-surface text-[12px] font-medium">
              Follow-up
            </button>
          }
        />
        {lead.stage !== "Converted" && (
          <button
            onClick={() => {
              setStage(lead.id, "Interested");
              toast.success("Lead moved to Interested");
            }}
            className="h-9 w-full rounded-xl bg-ok-soft text-[12px] font-medium text-ok"
          >
            Mark as interested
          </button>
        )}
      </div>
    </div>
  );
}

function Facts({ rows, title }: { rows: Array<[string, string]>; title?: string }) {
  return (
    <div className="space-y-1">
      {title ? <div className="mono-label mb-2">{title}</div> : null}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {rows.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="mono-label">{k}</dt>
            <dd className="truncate text-[12px] font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CallPlayer({ duration }: { duration: number }) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(114);
  const [speed, setSpeed] = useState(1);
  const mmss = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="clay-bubble flex items-center gap-3 p-3">
      <button
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause recording" : "Play recording"}
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
      >
        {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <input
          type="range"
          min={0}
          max={duration}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Recording position"
          className="w-full accent-[var(--primary)]"
        />
        <div className="font-mono mt-1 flex justify-between text-[9px] text-faint">
          <span>{mmss(pos)}</span>
          <span>{mmss(duration)}</span>
        </div>
      </div>
      <Volume2 className="size-3.5 shrink-0 text-faint" aria-hidden />
      <button
        onClick={() => setSpeed((s) => (s === 2 ? 1 : s === 1 ? 1.5 : 2))}
        className="font-mono shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px]"
        aria-label="Playback speed"
      >
        {speed}×
      </button>
    </div>
  );
}
