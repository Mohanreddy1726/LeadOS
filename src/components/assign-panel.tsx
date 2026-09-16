"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Panel, PanelHead, QualityBadge, ScoreBadge, EmptyState, Avatar } from "@/components/bits";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AssignPanel({ leads }: { leads: any[] }) {
  const { assignLeads, team } = useStore();
  const telecallers = team.filter(t => t.role === "telecaller");
  const [selected, setSelected] = useState<string[]>([]);
  const [caller, setCaller] = useState(telecallers[0]?.memberId || "");

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  function assign(roundRobin = false) {
    if (selected.length === 0) {
      toast.error("Select at least one lead");
      return;
    }
    if (roundRobin) {
      selected.forEach((id, i) => assignLeads([id], telecallers[i % telecallers.length]?.memberId));
      toast.success(`${selected.length} leads distributed round-robin across the team`);
    } else {
      assignLeads(selected, caller);
      toast.success(
        `${selected.length} leads assigned to ${telecallers.find((t) => t.memberId === caller)?.name}`,
      );
    }
    setSelected([]);
  }

  return (
    <Panel>
      <PanelHead
        title="Lead assignment"
        hint={`${leads.length} unassigned qualified leads`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={caller}
              onChange={(e) => setCaller(e.target.value)}
              aria-label="Select telecaller"
              className="h-8 rounded-xl border border-border bg-surface px-2 text-[12px]"
            >
              {telecallers.map((t) => (
                <option key={t.memberId} value={t.memberId}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => assign(false)}
              className="h-8 rounded-xl bg-primary px-3 text-[12px] font-medium text-primary-foreground"
            >
              Assign {selected.length ? `(${selected.length})` : ""}
            </button>
            <button
              onClick={() => assign(true)}
              className="h-8 rounded-xl border border-border px-3 text-[12px] font-medium"
            >
              Round-robin
            </button>
          </div>
        }
      />
      {leads.length === 0 ? (
        <EmptyState title="Queue is clear" body="Every qualified lead has an owner right now." />
      ) : (
        <ul className="max-h-[360px] divide-y divide-border overflow-y-auto">
          {leads.map((l) => (
            <li key={l.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-foreground/[0.03]",
                  selected.includes(l.id) && "bg-primary-soft/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(l.id)}
                  onChange={() => toggle(l.id)}
                  className="size-3.5 accent-[var(--primary)]"
                  aria-label={`Select ${l.name}`}
                />
                  <Avatar
                    name={l.name}
                    initials={l.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2)}
                    tone={l.quality === "hot" ? "hot" : "med"}
                  />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium">{l.name}</span>
                  <span className="font-mono block truncate text-[10px] text-faint">
                    {l.program} · {l.source}
                  </span>
                </span>
                <ScoreBadge score={l.score} />
                <QualityBadge quality={l.quality} />
              </label>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
