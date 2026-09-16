"use client";

import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead } from "@/components/bits";
import { useStore } from "@/lib/store";
import { User, Bell, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
  const { user } = useStore();

  return (
    <AppShell
      title="Workspace Settings"
      subtitle="Configure your profile and system preferences"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Panel>
          <PanelHead
            title="Profile Settings"
            hint="Personal information and public identity"
            action={<User className="size-4 text-muted-foreground" />}
          />
          <div className="space-y-4 p-4">
            <div className="grid gap-2">
              <label className="mono-label text-[11px]">Full Name</label>
              <input
                defaultValue={user?.name}
                className="h-9 rounded-xl border border-border bg-surface px-3 text-[12px] outline-none focus:ring-2 ring-primary/20"
              />
            </div>
            <div className="grid gap-2">
              <label className="mono-label text-[11px]">Email Address</label>
              <input
                defaultValue={user?.email}
                className="h-9 rounded-xl border border-border bg-surface px-3 text-[12px] outline-none focus:ring-2 ring-primary/20"
              />
            </div>
            <div className="grid gap-2">
              <label className="mono-label text-[11px]">Phone Number</label>
              <input
                defaultValue={user?.phone}
                className="h-9 rounded-xl border border-border bg-surface px-3 text-[12px] outline-none focus:ring-2 ring-primary/20"
              />
            </div>
            <button className="h-9 rounded-xl bg-primary px-4 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Save Profile
            </button>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            title="Notifications"
            hint="Control how you receive alerts and updates"
            action={<Bell className="size-4 text-muted-foreground" />}
          />
          <div className="space-y-4 p-4">
            {[
              { label: "New Lead Assignment", desc: "Get notified when a lead is routed to you" },
              { label: "AI Call Completion", desc: "Alert when an AI qualification is finished" },
              { label: "Follow-up Reminders", desc: "Daily summary of due tasks" },
              { label: "Application Status Change", desc: "Track student progress in real-time" },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] font-medium">{n.label}</div>
                  <div className="mono-label text-[10px] text-muted-foreground">{n.desc}</div>
                </div>
                <input type="checkbox" defaultChecked className="size-3.5 accent-primary" />
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHead
            title="Account Security"
            hint="Manage passwords and access control"
            action={<Lock className="size-4 text-muted-foreground" />}
          />
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
              <div className="min-w-0">
                <div className="text-[12px] font-medium">Two-factor Authentication</div>
                <div className="mono-label text-[10px] text-muted-foreground">Add an extra layer of security</div>
              </div>
              <button className="text-[11px] font-medium text-primary hover:underline">Enable</button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
              <div className="min-w-0">
                <div className="text-[12px] font-medium">Password Reset</div>
                <div className="mono-label text-[10px] text-muted-foreground">Update your login credentials</div>
              </div>
              <button className="text-[11px] font-medium text-primary hover:underline">Change</button>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHead
            title="Workspace Preferences"
            hint="Localization and appearance settings"
            action={<Globe className="size-4 text-muted-foreground" />}
          />
          <div className="space-y-4 p-4">
            <div className="grid gap-2">
              <label className="mono-label text-[11px]">Currency Format</label>
              <select className="h-9 rounded-xl border border-border bg-surface px-3 text-[12px] outline-none">
                <option>INR (₹) - India</option>
                <option>USD ($) - United States</option>
                <option>EUR (€) - Europe</option>
                <option>GBP (£) - UK</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="mono-label text-[11px]">Timezone</label>
              <select className="h-9 rounded-xl border border-border bg-surface px-3 text-[12px] outline-none">
                <option>Asia/Kolkata (GMT+5:30)</option>
                <option>UTC (GMT+0)</option>
                <option>America/New_York (GMT-5)</option>
              </select>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
