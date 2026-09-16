import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* -------------------------------- surfaces -------------------------------- */

export function Panel({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("clay rise", className)} {...rest}>
      {children}
    </div>
  );
}

export function PanelHead({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="min-w-0">
        <h2 className="font-display truncate text-[13px] font-semibold">{title}</h2>
        {hint ? <p className="mono-label mt-1">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* --------------------------------- badges -------------------------------- */

const qualityClass: Record<string, string> = {
  hot: "bg-hot-soft text-hot",
  high: "bg-high-soft text-high",
  medium: "bg-med-soft text-med",
  low: "bg-low-soft text-low",
  junk: "bg-junk-soft text-junk",
};

export function QualityBadge({ quality }: { quality: string }) {
  return (
    <span className={cn("pill capitalize", qualityClass[quality] || "bg-border text-muted-foreground")}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {quality}
    </span>
  );
}

const stageTone = (stage: string) => {
  if (stage === "Junk") return "bg-junk-soft text-junk";
  if (stage === "Converted" || stage === "Interested") return "bg-ok-soft text-ok";
  if (stage === "Manager Review" || stage === "Follow-up") return "bg-high-soft text-high";
  if (stage === "Application" || stage === "Assigned" || stage === "Contacted")
    return "bg-med-soft text-med";
  return "bg-primary-soft text-primary";
};

export function StatusBadge({ stage }: { stage: string }) {
  return <span className={cn("pill", stageTone(stage))}>{stage}</span>;
}

export function ScoreBadge({ score }: { score: number }) {
  const strong = score >= 72;
  return (
    <span
      className={cn(
        "font-mono inline-grid h-5 min-w-8 place-items-center rounded-md px-1 text-[10px] font-medium",
        strong
          ? "bg-foreground text-primary-foreground"
          : "border border-border bg-surface text-foreground",
      )}
      title={`AI score ${score} of 100`}
    >
      {score}
    </span>
  );
}

export function Avatar({
  name,
  initials,
  tone = "med",
  className,
}: {
  name: string;
  initials: string;
  tone?: "hot" | "high" | "med" | "low" | "junk" | "primary";
  className?: string;
}) {
  const bg = {
    hot: "bg-hot",
    high: "bg-high",
    med: "bg-med",
    low: "bg-low",
    junk: "bg-junk",
    primary: "bg-primary",
  }[tone];
  return (
    <span
      aria-label={name}
      title={name}
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-primary-foreground",
        bg,
        className,
      )}
    >
      {initials}
    </span>
  );
}

/* --------------------------------- KPI card -------------------------------- */

export function KpiCard({
  label,
  value,
  delta,
  hint,
  positive = true,
}: {
  label: string;
  value: string | number;
  delta?: string;
  hint?: string;
  positive?: boolean;
}) {
  return (
    <Panel className="p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <span className="mono-label truncate">{label}</span>
        {delta ? (
          <span
            className={cn(
              "text-[10px] font-medium",
              positive ? "text-ok" : "text-muted-foreground",
            )}
          >
            {positive ? "▲" : "▼"} {delta}
          </span>
        ) : null}
      </div>
      <div className="font-display mt-2 text-[26px] font-semibold tracking-tight">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </div>
      {hint ? <div className="font-mono mt-1 text-[10px] text-faint">{hint}</div> : null}
    </Panel>
  );
}

/* ---------------------------------- charts ---------------------------------- */

export function FunnelChart({
  data,
  className,
}: {
  data: Array<{ label: string; value: number }>;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className={cn("flex flex-col gap-1.5 text-[11px]", className)}>
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-muted-foreground">{d.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-lg bg-muted">
            <div
              className="fill-bar h-full rounded-lg bg-primary"
              style={{
                width: `${Math.max(3, (d.value / max) * 100)}%`,
                opacity: 1 - i * 0.07,
                animationDelay: `${i * 70}ms`,
              }}
            />
          </div>
          <span className="font-mono w-12 text-right text-faint">
            {d.value.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  data,
  centerLabel,
  centerValue,
  size = 112,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  centerLabel: string;
  centerValue: string;
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const stopsArray: string[] = [];
  let currentAcc = 0;
  for (const d of data) {
    const start = (currentAcc / total) * 100;
    currentAcc += d.value;
    const end = (currentAcc / total) * 100;
    stopsArray.push(`${d.color} ${start}% ${end}%`);
  }
  const stops = stopsArray.join(", ");

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div
          className="size-full rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
          role="img"
          aria-label={data.map((d) => `${d.label} ${d.value}`).join(", ")}
        />
        <div className="absolute inset-[15px] grid place-items-center rounded-full bg-surface text-center shadow-[var(--shadow-bubble)]">
          <div>
            <div className="font-display text-[17px] font-semibold leading-none">
              {centerValue}
            </div>
            <div className="font-mono mt-1 text-[8px] text-faint uppercase">{centerLabel}</div>
          </div>
        </div>
      </div>
      <ul className="min-w-[150px] flex-1 space-y-2 text-[11px]">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: d.color }}
              aria-hidden
            />
            <span className="truncate">{d.label}</span>
            <span className="font-mono ml-auto text-faint">
              {d.value.toLocaleString("en-IN")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Bar({ value, max, tone = "primary" }: { value: number; max: number; tone?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="fill-bar h-full rounded-full"
        style={{ width: `${(value / max) * 100}%`, background: `var(--color-${tone})` }}
      />
    </div>
  );
}

/* ---------------------------------- states --------------------------------- */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="clay-inset grid size-10 place-items-center rounded-xl text-faint">∅</div>
      <p className="font-display text-[14px] font-semibold">{title}</p>
      <p className="max-w-sm text-[12px] text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="size-7 animate-pulse rounded-full bg-muted" />
          <div className="h-3 w-40 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ lifecycle rail ----------------------------- */

export function LifecycleRail({
  stages,
  current,
  compact = false,
}: {
  stages: readonly string[];
  current: string;
  compact?: boolean;
}) {
  const idx = stages.indexOf(current);
  return (
    <div className="flex items-center gap-3">
      <span className="mono-label shrink-0">Lifecycle</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        {stages.map((s, i) => (
          <div
            key={s}
            title={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < idx ? "bg-ok" : i === idx ? "bg-primary ring-4 ring-primary/15" : "bg-foreground/10",
            )}
          />
        ))}
      </div>
      {!compact && (
        <span className="pill shrink-0 bg-primary-soft text-primary">{current}</span>
      )}
    </div>
  );
}
