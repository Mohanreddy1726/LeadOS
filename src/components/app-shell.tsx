"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Activity as ActivityIcon,
  BarChart3,
  Bell,
  CalendarClock,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  PhoneCall,
  Search,
  Settings,
  Sun,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/bits";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: React.ElementType; roles: Role[] };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "telecaller"] },
  { to: "/leads", label: "Leads", icon: Users, roles: ["admin", "manager", "telecaller"] },
  { to: "/ai-calls", label: "AI Calls", icon: PhoneCall, roles: ["admin", "manager", "telecaller"] },
  { to: "/follow-ups", label: "Follow-ups", icon: CalendarClock, roles: ["admin", "manager", "telecaller"] },
  { to: "/applications", label: "Applications", icon: FileText, roles: ["admin", "manager", "telecaller"] },
  { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "manager"] },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone, roles: ["admin"] },
  { to: "/team", label: "Team", icon: UsersRound, roles: ["admin", "manager"] },
  { to: "/activity", label: "Activity", icon: ActivityIcon, roles: ["admin", "manager", "telecaller"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: ["admin", "manager", "telecaller"] },
];

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, hydrated, signOut, sidebarCollapsed, toggleSidebar } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.push("/");
  }, [hydrated, user, router]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="font-mono text-[11px] text-faint">Loading workspace…</div>
      </div>
    );
  }

  const items = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1620px] gap-4 p-3 sm:p-4">
        <aside
          className={cn(
            "clay sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col p-3 transition-[width] duration-300 lg:flex",
            sidebarCollapsed ? "w-[76px]" : "w-[232px]",
          )}
        >
          <Brand collapsed={sidebarCollapsed} />
          <Nav items={items} collapsed={sidebarCollapsed} />
          <div className="mt-auto space-y-2">
            <button
              onClick={toggleSidebar}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-accent"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <>
                  <ChevronsLeft className="size-4" /> Collapse
                </>
              )}
            </button>
            {!sidebarCollapsed && <UserChip />}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="clay flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4">
            <Sheet>
              <SheetTrigger
                aria-label="Open navigation"
                className="grid size-9 place-items-center rounded-xl border border-border lg:hidden"
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] bg-surface p-3">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand collapsed={false} />
                <Nav items={items} collapsed={false} />
                <div className="mt-4">
                  <UserChip />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex min-w-0 items-center gap-2.5">
              <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary ring-3 ring-primary/15" />
              <div className="min-w-0">
                <h1 className="font-display truncate text-[17px] leading-none font-semibold">
                  {title}
                </h1>
                {subtitle ? <p className="mono-label mt-1 truncate">{subtitle}</p> : null}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <GlobalSearch />
              <DateRange />
              {actions}
              <Notifications />
              <ThemeToggle />
              <a
                href="#help"
                aria-label="Help"
                className="hidden size-9 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground sm:grid"
              >
                <CircleHelp className="size-4" />
              </a>
              <ProfileMenu onSignOut={() => { signOut(); router.push("/"); }} />
            </div>
          </header>

          <main className="flex flex-col gap-4 pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="mb-3 flex items-center gap-2.5 px-2 py-2">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary shadow-[var(--shadow-bubble)]">
        <span className="font-display text-sm font-semibold text-primary-foreground">V</span>
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <div className="font-display truncate text-[15px] leading-none font-semibold">
            Lead.OS
          </div>
          <div className="mono-label mt-1">Lead OS</div>
        </div>
      )}
    </div>
  );
}

function Nav({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {items.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            href={to}
            title={label}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-colors",
              active
                ? "bg-foreground/[0.045] font-medium text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              collapsed && "justify-center",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function UserChip() {
  const { user } = useStore();
  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
  return (
    <div className="clay-bubble flex items-center gap-2.5 p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-med text-[11px] font-semibold text-primary-foreground">
        {initials}
      </span>
      <div className="min-w-0">
        <div className="truncate text-[12px] font-medium">{user.name}</div>
        <div className="mono-label">{user.role}</div>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  return (
    <label className="clay-bubble hidden items-center gap-2 px-3 py-2 md:flex md:w-[220px] xl:w-[260px]">
      <Search className="size-3.5 shrink-0 text-faint" aria-hidden />
      <span className="sr-only">Global search</span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search leads, phones, campaigns…"
        className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-faint"
      />
    </label>
  );
}

function DateRange() {
  const [range, setRange] = useState("Last 30 days");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="clay-bubble hidden px-3 py-2 text-[12px] font-medium sm:block">
        {range}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {["Today", "Last 7 days", "Last 30 days", "This quarter", "Custom range"].map((r) => (
          <DropdownMenuItem key={r} onSelect={() => setRange(r)}>
            {r}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  const { notifications, markAllRead, removeNotification } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Notifications, ${unread} unread`}
        className="relative grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-hot text-[9px] font-semibold text-primary-foreground">
            {unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="font-display text-[13px] font-semibold">Notifications</span>
          <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
            Mark all read
          </button>
        </div>
        <ul className="max-h-[320px] divide-y divide-border overflow-y-auto">
          {notifications.map((n) => (
            <li key={n.id} className="group flex items-center gap-2.5 px-3 py-2.5 hover:bg-accent">
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  n.read ? "bg-border" : "bg-primary",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] leading-snug">{n.text}</p>
                <p className="font-mono mt-1 text-[10px] text-faint">{n.at}</p>
              </div>
              <button
                onClick={() => removeNotification(n.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                aria-label="Remove notification"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <button
      onClick={() => setDark((d) => !d)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

function MemberSelector({
  role,
  onSelect,
  onClose,
}: {
  role: Role;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const { team } = useStore();
  const members = team.filter((m) => m.role === role);
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[320px]">
        <DialogHeader>
          <DialogTitle>Select {role}</DialogTitle>
          <DialogDescription>
            Who do you want to view the workspace as?
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-1">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onSelect(m.id);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-[13px] transition-colors hover:bg-accent"
            >
              <Avatar name={m.name} initials={m.initials} />
              <span className="font-medium">{m.name}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProfileMenu({ onSignOut }: { onSignOut: () => void }) {
  const { user, switchRole } = useStore();
  const [selectorRole, setSelectorRole] = useState<Role | null>(null);
  if (!user) return null;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="clay-bubble flex items-center gap-2 py-1.5 pr-3 pl-1.5">
          <span className="grid size-7 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {initials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block max-w-[110px] truncate text-[12px] font-medium">{user.name}</span>
            <span className="mono-label block">{user.role}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[220px]">
          <DropdownMenuLabel className="text-[12px]">
            {user.name}
            <span className="block text-[11px] font-normal text-muted-foreground">{user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(user.originalRole && user.originalRole !== "telecaller") && (
            <>
              <DropdownMenuLabel className="mono-label">Switch role</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={user.role}
                onValueChange={(v) => {
                  const role = v as Role;
                  if (role === user.originalRole || role === "admin") {
                    switchRole(role);
                    toast.success(`Now viewing as ${role}`);
                  } else {
                    setSelectorRole(role);
                  }
                }}
              >
                {(user.originalRole === "admin") && (
                  <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                )}
                {(user.originalRole === "admin" || user.originalRole === "manager") && (
                  <DropdownMenuRadioItem value="manager">Manager</DropdownMenuRadioItem>
                )}
                {(user.originalRole === "admin" || user.originalRole === "manager") && (
                  <DropdownMenuRadioItem value="telecaller">Telecaller</DropdownMenuRadioItem>
                )}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onSelect={onSignOut}>
            <LogOut className="size-3.5" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {selectorRole && (
        <MemberSelector
          role={selectorRole}
          onSelect={(mId) => {
            switchRole(selectorRole, mId);
            toast.success(`Now viewing as ${selectorRole}`);
          }}
          onClose={() => setSelectorRole(null)}
        />
      )}
    </>
  );
}
