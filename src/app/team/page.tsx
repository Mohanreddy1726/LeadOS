"use client";

import { useState, useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Panel, PanelHead, Avatar } from "@/components/bits";
import { Users, Trophy, Target, UserCircle, Plus } from "lucide-react";
import { useStore, type Role } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function TeamPage() {
  const { user, team, leads } = useStore();
  const [open, setOpen] = useState<Role | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const filteredTeam = useMemo(() => {
    if (!user) return [];
    if (user.role === "admin") return team;
    if (user.role === "manager") return team.filter(m => m.role === "telecaller");
    return [];
  }, [user, team]);

  const getInitials = (name: string) => {
    return name
      ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
      : "??";
  };

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
      setOpen(null);
      setForm({ firstName: "", lastName: "", email: "", phone: "", password: "" });
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const canAddMember = user?.role === "admin" || user?.role === "manager";

  return (
    <AppShell
      title="Team Management"
      subtitle={`Managing ${filteredTeam.length} team members`}
    >
      <div className="grid gap-6">
        <Panel>
          <PanelHead
            title="Team Directory"
            hint="Overview of telecallers and managers performance"
            action={
              canAddMember && (
                <button
                  onClick={() => setOpen(user?.role === "admin" ? "manager" : "telecaller")}
                  className="h-8 rounded-xl bg-primary px-3 text-[12px] font-medium text-primary-foreground"
                >
                  Add Member
                </button>
              )
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] text-left border-collapse">
              <thead className="border-b border-border text-muted-foreground mono-label">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Assigned</th>
                  <th className="px-4 py-3 font-medium">Contacted</th>
                  <th className="px-4 py-3 font-medium">Interested</th>
                  <th className="px-4 py-3 font-medium">Conv.</th>
                  <th className="px-4 py-3 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTeam.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground italic">
                      No team members found.
                    </td>
                  </tr>
                ) : (
                  filteredTeam.map((m) => {
                    const assigned = leads.filter(l => l.assignedTo === m.memberId).length;
                    const contacted = leads.filter(l => l.assignedTo === m.memberId && l.stage !== "New").length;
                    const interested = leads.filter(l => l.assignedTo === m.memberId && l.stage === "Interested").length;
                    const conversions = leads.filter(l => l.assignedTo === m.memberId && l.stage === "Converted").length;
                    return (
                      <tr key={m.memberId} className="group transition-colors hover:bg-foreground/[0.02]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              name={m.name}
                              initials={getInitials(m.name)}
                              tone={m.role === "admin" ? "primary" : m.role === "manager" ? "high" : "med"}
                            />
                            <span className="font-medium">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize text-muted-foreground">{m.role}</span>
                        </td>
                        <td className="px-4 py-3 font-mono">{assigned}</td>
                        <td className="px-4 py-3 font-mono">{contacted}</td>
                        <td className="px-4 py-3 font-mono">{interested}</td>
                        <td className="px-4 py-3 font-mono">{conversions}</td>
                        <td className="px-4 py-3">
                          {assigned > 0 ? (
                            <span className="font-medium text-ok">
                              {((conversions / assigned) * 100).toFixed(1)}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {open && (
          <Dialog open={true} onOpenChange={() => setOpen(null)}>
            <DialogContent className="max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="clay p-4 rounded-xl flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="size-4" />
            </div>
            <div>
              <div className="font-display text-[13px] font-semibold">Top Performer</div>
              <div className="mono-label text-[11px] text-muted-foreground">Based on conversion rate</div>
            </div>
          </div>
          <div className="clay p-4 rounded-xl flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-high/10 text-high">
              <Target className="size-4" />
            </div>
            <div>
              <div className="font-display text-[13px] font-semibold">Capacity</div>
              <div className="mono-label text-[11px] text-muted-foreground">Current lead distribution</div>
            </div>
          </div>
          <div className="clay p-4 rounded-xl flex items-start gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-med/10 text-med">
              <UserCircle className="size-4" />
            </div>
            <div>
              <div className="font-display text-[13px] font-semibold">Team Health</div>
              <div className="mono-label text-[11px] text-muted-foreground">Average response time</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}