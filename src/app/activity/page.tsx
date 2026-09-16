"use client";

import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead, Avatar } from "@/components/bits";
import { useStore } from "@/lib/store";
import {
  UserPlus,
  PhoneCall,
  CheckCircle2,
  Calendar,
  FileText,
  Zap,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const KIND_CONFIG = {
  lead: { icon: UserPlus, color: "text-primary", label: "New Lead" },
  ai: { icon: PhoneCall, color: "text-med", label: "AI Call" },
  assign: { icon: Zap, color: "text-high", label: "Assignment" },
  followup: { icon: Calendar, color: "text-low", label: "Follow-up" },
  application: { icon: FileText, color: "text-ok", label: "Application" },
  conversion: { icon: CheckCircle2, color: "text-ok", label: "Conversion" },
  alert: { icon: AlertCircle, color: "text-hot", label: "System Alert" },
} as const;

export default function ActivityPage() {
  const { activity } = useStore();
  return (
    <AppShell
      title="System Activity"
      subtitle="Real-time audit log of workspace events"
    >
      <div className="grid gap-6">
        <Panel>
          <PanelHead
            title="Audit Timeline"
            hint="Sequential log of all lead intelligence and routing events"
          />
          <div className="relative px-4 py-4">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
            <ul className="space-y-6">
              {activity.map((item) => {
                const config = KIND_CONFIG[item.kind as keyof typeof KIND_CONFIG];
                const Icon = config.icon;
                return (
                  <li key={item.id} className="relative flex gap-4">
                    <div className={cn(
                      "z-10 grid size-7 shrink-0 place-items-center rounded-full border border-border bg-surface",
                      config.color
                    )}>
                      <Icon className="size-3" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[13px]">{item.text}</span>
                        <span className="mono-label text-[10px] text-faint">{item.at}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-medium">By {item.actor}</span>
                        <span className="text-faint">•</span>
                        <span className="opacity-70">{config.label}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
