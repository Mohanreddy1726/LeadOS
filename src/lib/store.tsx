"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type FollowUp,
  type Stage,
} from "./mock";

export type Role = "admin" | "manager" | "telecaller";

export interface SessionUser {
  name: string;
  email: string;
  phone: string;
  role: Role;
  originalRole: Role;
  originalMemberId: string;
  memberId: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  campaignId: string;
  metaCampaignId?: string;
  metaAdSetId?: string;
  metaAdId?: string;
  score: number;
  quality: string;
  stage: string;
  qualification: string;
  intent: string;
  program: string;
  destination: string;
  city?: string;
  neetQualified?: string;
  metaLeadId?: string;
  budget: string;
  intake: string;
  academic: string;
  assignedTo?: string;
  managerId?: string;
  createdAt: string;
  lastContact?: string;
  nextFollowUp?: string;
  aiSummary: string;
  reason: string;
  documents: string;
  timeline: string;
}

interface Notification {
  id: string;
  text: string;
  kind: string;
  at: string;
  read: boolean;
}

interface Store {
  user: SessionUser | null;
  hydrated: boolean;
  signIn: (u: SessionUser, token: string) => void;
  signOut: () => void;
  switchRole: (r: Role, memberId?: string) => void;
  leads: Lead[];
  assignLeads: (ids: string[], callerId: string) => void;
  setStage: (id: string, stage: Stage) => void;
  followUps: FollowUp[];
  addFollowUp: (f: Omit<FollowUp, "id">) => void;
  completeFollowUp: (id: string) => void;
  notifications: Notification[];
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  team: any[];
  fetchTeam: () => Promise<void>;
  campaigns: any[];
  setCampaigns: (c: any[]) => void;
  adsets: any[];
  setAdsets: (a: any[]) => void;
  ads: any[];
  setAds: (a: any[]) => void;
  aiCalls: any[];
  applications: any[];
  activity: any[];
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const StoreContext = createContext<Store | null>(null);
const KEY = "veridian.session";

const defaultMemberFor = (role: Role) => "MEM_DEFAULT";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [adsets, setAdsets] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [aiCalls, setAiCalls] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [sidebarCollapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SessionUser;
        const userWithOriginal = {
          ...parsed,
          originalRole: parsed.originalRole ?? parsed.role,
          originalMemberId: parsed.originalMemberId ?? parsed.memberId,
        };
        Promise.resolve().then(() => setUser(userWithOriginal));
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const token = localStorage.getItem("leados.token");
      const headers = { "Authorization": `Bearer ${token}` };

      try {
        const [leadsRes, followUpsRes, notificationsRes, teamRes, campaignsRes, adsetsRes, adsRes, aiCallsRes, appsRes, activityRes] = await Promise.all([
          fetch("/api/leads", { headers }),
          fetch("/api/follow-ups", { headers }),
          fetch("/api/notifications", { headers }),
          fetch("/api/team", { headers }),
          fetch("/api/campaigns", { headers }),
          fetch("/api/adsets", { headers }),
          fetch("/api/ads", { headers }),
          fetch("/api/ai-calls", { headers }),
          fetch("/api/applications", { headers }),
          fetch("/api/activity", { headers }),
        ]);

        if (leadsRes.ok) setLeads(await leadsRes.json());
        if (followUpsRes.ok) setFollowUps(await followUpsRes.json());
        if (notificationsRes.ok) setNotifications(await notificationsRes.json());
        if (teamRes.ok) setTeam(await teamRes.json());
        if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
        if (adsetsRes.ok) setAdsets(await adsetsRes.json());
        if (adsRes.ok) setAds(await adsRes.json());
        if (aiCallsRes.ok) setAiCalls(await aiCallsRes.json());
        if (appsRes.ok) setApplications(await appsRes.json());
        if (activityRes.ok) setActivity(await activityRes.json());
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [user]);

  const signIn = useCallback((u: SessionUser, token: string) => {
    const userWithOriginal = { ...u, originalRole: u.role, originalMemberId: u.memberId };
    setUser(userWithOriginal);
    try {
      localStorage.setItem(KEY, JSON.stringify(userWithOriginal));
      localStorage.setItem("leados.token", token);
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setLeads([]);
    setFollowUps([]);
    setNotifications([]);
    setTeam([]);
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem("leados.token");
    } catch {
      /* ignore */
    }
  }, []);

  const switchRole = useCallback(
    (role: Role, memberId?: string) => {
      setUser((prev) => {
        if (!prev) return prev;
        const nextMemberId = memberId ?? (role === prev.originalRole ? prev.originalMemberId : defaultMemberFor(role));
        const next = { ...prev, role, memberId: nextMemberId };
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const assignLeads = useCallback(async (ids: string[], callerId: string) => {
    const token = localStorage.getItem("leados.token");
    try {
      const res = await fetch("/api/leads/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ids, callerId }),
      });
      if (res.ok) {
        const updatedLeads = await fetch("/api/leads", {
          headers: { "Authorization": `Bearer ${token}` }
        }).then(r => r.json());
        setLeads(updatedLeads);
      }
    } catch (err) {
      console.error("Assign leads failed:", err);
    }
  }, []);

  const setStage = useCallback(async (id: string, stage: Stage) => {
    const token = localStorage.getItem("leados.token");
    try {
      const res = await fetch(`/api/leads/${id}/stage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ stage }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
      }
    } catch (err) {
      console.error("Set stage failed:", err);
    }
  }, []);

  const addFollowUp = useCallback(async (f: Omit<FollowUp, "id">) => {
    const token = localStorage.getItem("leados.token");
    try {
      const res = await fetch("/api/follow-ups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(f),
      });
      if (res.ok) {
        const newFU = await res.json();
        setFollowUps((prev) => [newFU, ...prev]);
      }
    } catch (err) {
      console.error("Add follow-up failed:", err);
    }
  }, []);

  const completeFollowUp = useCallback(async (id: string) => {
    const token = localStorage.getItem("leados.token");
    try {
      const res = await fetch(`/api/follow-ups/${id}/complete`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setFollowUps((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: "Completed" } : f)),
        );
      }
    } catch (err) {
      console.error("Complete follow-up failed:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const token = localStorage.getItem("leados.token");
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  }, []);

  const removeNotification = useCallback(async (id: string) => {
    const token = localStorage.getItem("leados.token");
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Remove notification failed:", err);
    }
  }, []);

  const fetchTeam = useCallback(async () => {
    const token = localStorage.getItem("leados.token");
    try {
      const res = await fetch("/api/team", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (err) {
      console.error("Fetch team failed:", err);
    }
  }, []);

  const value = useMemo<Store>(
    () => ({
      user,
      hydrated,
      signIn,
      signOut,
      switchRole,
      leads,
      assignLeads,
      setStage,
      followUps,
      addFollowUp,
      completeFollowUp,
      notifications,
      markAllRead,
      removeNotification,
      team,
      fetchTeam,
      campaigns,
      setCampaigns,
      adsets,
      setAdsets,
      ads,
      setAds,
      aiCalls,
      applications,
      activity,
      sidebarCollapsed,
      toggleSidebar: () => setCollapsed((c) => !c),
    }),
    [
      user,
      hydrated,
      signIn,
      signOut,
      switchRole,
      leads,
      assignLeads,
      setStage,
      followUps,
      addFollowUp,
      completeFollowUp,
      notifications,
      markAllRead,
      removeNotification,
      team,
      fetchTeam,
      campaigns,
      setCampaigns,
      adsets,
      setAdsets,
      ads,
      setAds,
      aiCalls,
      applications,
      activity,
      sidebarCollapsed,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

/** Leads visible to the signed-in role. */
export function useVisibleLeads() {
  const { leads, user } = useStore();
  return useMemo(() => {
    console.log("useVisibleLeads - user:", user);
    console.log("useVisibleLeads - leads count:", leads?.length);
    if (!user) return leads;
    if (user.role === "telecaller") return leads.filter((l) => l.assignedTo === user.memberId);
    if (user.role === "manager")
      return leads.filter((l) => !l.assignedTo || l.managerId === user.memberId);
    return leads;
  }, [leads, user]);
}
