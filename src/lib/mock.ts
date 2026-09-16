/**
 * Deterministic mock dataset for Lead.OS.
 * Frontend-only: no backend, no API. Everything is generated from fixed seeds
 * so server render and client render always agree.
 */

export type Role = "admin" | "manager" | "telecaller";

export type Quality = "hot" | "high" | "medium" | "low" | "junk";

export const STAGES = [
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
] as const;
export type Stage = (typeof STAGES)[number] | "Junk";

export type Source =
  | "Meta Lead Form"
  | "Meta WhatsApp"
  | "Google Lead Form"
  | "Google Search"
  | "Website";

export interface TeamMember {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  managerId?: string | undefined;
  active: boolean;
  initials: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: Source;
  campaignId: string;
  score: number;
  quality: Quality;
  stage: Stage;
  qualification: "Qualified" | "Junk" | "Pending";
  intent: "High" | "Medium" | "Low";
  program: string;
  destination: string;
  budget: string;
  intake: string;
  academic: string;
  assignedTo?: string | undefined;
  managerId?: string | undefined;
  createdAt: string;
  lastContact?: string | undefined;
  nextFollowUp?: string | undefined;
  aiSummary: string;
  reason: string;
  documents: string;
  timeline: "Immediate" | "1–3 months" | "3–6 months" | "Undecided";
}

export interface AiCall {
  id: string;
  leadId: string;
  at: string;
  durationSec: number;
  status: "Completed" | "Calling" | "No Answer" | "Busy" | "Failed";
  score?: number | undefined;
  qualification: "Qualified" | "Junk" | "Pending";
}

export interface FollowUp {
  id: string;
  leadId: string;
  ownerId: string;
  date: string;
  time: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
  status: "Overdue" | "Today" | "Upcoming" | "Completed";
  notes?: string | undefined;
}

export interface Application {
  id: string;
  leadId: string;
  stage: AppStage;
  value: number;
  ownerId: string;
  lastActivity: string;
}

export const APP_STAGES = [
  "Interested",
  "Application Started",
  "Documents Pending",
  "Documents Submitted",
  "Application Submitted",
  "Offer Received",
  "Deposit Paid",
  "Converted",
] as const;
export type AppStage = (typeof APP_STAGES)[number];

export interface Campaign {
  id: string;
  name: string;
  platform: "Meta" | "Google" | "Website";
  status: "Active" | "Paused" | "Ended";
  spend: number;
  leads: number;
  qualified: number;
  hot: number;
  applications: number;
  conversions: number;
}

export interface ActivityItem {
  id: string;
  at: string;
  kind: "lead" | "ai" | "assign" | "followup" | "application" | "conversion" | "alert";
  text: string;
  actor: string;
}

/* ---------------------------------- seed ---------------------------------- */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const pick = <T,>(r: () => number, arr: readonly T[]): T => arr[Math.floor(r() * arr.length)] as T;

export const TODAY = new Date("2026-06-15T09:00:00Z");
const dayOffset = (n: number) => {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString();
};
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ---------------------------------- team ---------------------------------- */

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const rawTeam: Array<[string, Role, string | undefined]> = [
  ["Ananya Rao", "admin", undefined],
  ["Kiran Menon", "manager", undefined],
  ["Devika Iyer", "manager", undefined],
  ["Rohit Bansal", "manager", undefined],
  ["Priya Nair", "telecaller", "u2"],
  ["Rahul Deshmukh", "telecaller", "u2"],
  ["Akhil Varma", "telecaller", "u2"],
  ["Sneha Kulkarni", "telecaller", "u3"],
  ["Meera Joshi", "telecaller", "u3"],
  ["Farhan Qureshi", "telecaller", "u3"],
  ["Nikhil Chauhan", "telecaller", "u4"],
  ["Tanvi Shah", "telecaller", "u4"],
  ["Aditya Pillai", "telecaller", "u4"],
  ["Ritika Sen", "telecaller", "u2"],
];

export const team: TeamMember[] = rawTeam.map(([name, role, managerId], i) => ({
  id: `u${i + 1}`,
  name,
  role,
  managerId,
  email: name.toLowerCase().replace(/\s+/g, ".") + "@veridian.in",
  phone: `+91 9${(80000000 + i * 1237891).toString().slice(0, 8)}`,
  active: i !== 12,
  initials: initials(name),
}));

export const telecallers = team.filter((t) => t.role === "telecaller");
export const managers = team.filter((t) => t.role === "manager");
export const admin = team[0]!;
export const memberById = (id?: string) => team.find((t) => t.id === id);

/* -------------------------------- campaigns -------------------------------- */

export const campaigns: Campaign[] = [
  ["c1", "MBBS Abroad 2026", "Meta", 486000, 1840, 1190, 402, 214, 68],
  ["c2", "Masters Abroad 2026", "Meta", 398000, 1520, 940, 318, 168, 51],
  ["c3", "UK Masters September Intake", "Google", 452000, 1310, 872, 296, 162, 54],
  ["c4", "Germany Masters 2026", "Google", 361000, 1042, 618, 203, 118, 34],
  ["c5", "Georgia MBBS Campaign", "Meta", 289000, 1188, 806, 284, 141, 47],
  ["c6", "USA Masters Campaign", "Google", 512000, 964, 512, 158, 96, 27],
  ["c7", "Canada PG Diploma", "Meta", 218000, 842, 470, 132, 74, 21],
  ["c8", "Ireland Masters 2026", "Google", 176000, 612, 358, 104, 58, 17],
  ["c9", "Website Organic Enquiries", "Website", 0, 1284, 894, 322, 152, 41],
  ["c10", "WhatsApp Retargeting", "Meta", 142000, 1884, 1182, 401, 101, 26],
].map(
  ([id, name, platform, spend, leads, qualified, hot, applications, conversions]) =>
    ({
      id,
      name,
      platform,
      status: id === "c8" ? "Paused" : id === "c6" ? "Ended" : "Active",
      spend,
      leads,
      qualified,
      hot,
      applications,
      conversions,
    }) as Campaign,
);

export const campaignById = (id: string) => campaigns.find((c) => c.id === id)!;

/* ---------------------------------- leads ---------------------------------- */

const first = [
  "Rahul","Ishita","Vikram","Arjun","Neha","Ananya","Karan","Divya","Aman","Sneha",
  "Rohan","Pooja","Siddharth","Meghna","Varun","Kavya","Nikhil","Riya","Manish","Tanya",
  "Aditya","Shreya","Harsh","Anjali","Yash","Nandini","Vivek","Sanjana","Rakesh","Preeti",
];
const last = [
  "Kumar","Sharma","Patel","Singh","Mehta","Reddy","Nair","Gupta","Joshi","Verma",
  "Chauhan","Iyer","Malhotra","Bose","Khanna","Pillai","Bhat","Desai","Sinha","Rao",
];
const sources: Source[] = [
  "Meta Lead Form",
  "Meta WhatsApp",
  "Google Lead Form",
  "Google Search",
  "Website",
];
const programs = [
  "MBBS",
  "MS Computer Science",
  "MBA",
  "MSc Data Science",
  "BDS",
  "MS Mechanical",
  "Nursing",
];
const destinations = ["Georgia", "Germany", "United Kingdom", "USA", "Canada", "Ireland", "Russia"];
const budgets = ["₹8–12 Lakhs", "₹12–18 Lakhs", "₹18–22 Lakhs", "₹20–25 Lakhs", "₹25–35 Lakhs"];
const academics = ["12th Passed", "NEET Qualified", "B.Tech Graduate", "B.Com Graduate", "Final Year"];

function qualityFor(score: number): Quality {
  if (score >= 85) return "hot";
  if (score >= 72) return "high";
  if (score >= 55) return "medium";
  if (score >= 35) return "low";
  return "junk";
}

function stageFor(r: () => number, q: Quality): Stage {
  if (q === "junk") return "Junk";
  const pool: Stage[] =
    q === "hot"
      ? ["Manager Review", "Assigned", "Contacted", "Interested", "Application", "Converted", "Follow-up"]
      : q === "high"
        ? ["AI Qualification", "Qualified", "Manager Review", "Assigned", "Contacted", "Follow-up", "Interested", "Application"]
        : q === "medium"
          ? ["AI Calling", "AI Call Pending", "Qualified", "Assigned", "Contacted", "Follow-up"]
          : ["New", "Validating", "Valid", "AI Call Pending", "AI Calling", "Contacted"];
  return pick(r, pool);
}

const summaries = [
  "High-intent student interested in {program} abroad. Budget confirmed and looking to start the admission process soon.",
  "Student is comparing {destination} with two other destinations. Family is supportive, budget discussion is still open.",
  "Parent answered the call on behalf of the student. Strong interest in {program}, documents partially ready.",
  "Lead is early in research. Wants information on scholarships and living costs before committing to {destination}.",
  "Caller confirmed eligibility and intake preference. Requested a counsellor callback within 48 hours.",
  "Number reached but the person is not the enquirer. No interest in overseas education at this time.",
];

export const leads: Lead[] = Array.from({ length: 64 }, (_, i) => {
  const r = rng(1000 + i * 37);
  const name = `${first[i % first.length]!} ${last[(i * 7) % last.length]!}`;
  const scoreBase = [92, 88, 86, 81, 78, 76, 74, 71, 68, 64, 61, 57, 52, 44, 31, 18];
  const score = Math.max(
    8,
    Math.min(98, scoreBase[i % scoreBase.length]! + Math.floor(r() * 9) - 4),
  );
  const quality = qualityFor(score);
  const stage = stageFor(r, quality);
  const campaign = campaigns[Math.floor(r() * campaigns.length)]!;
  const assigned =
    quality === "junk" || ["New", "Validating", "Valid", "AI Call Pending", "AI Calling", "AI Qualification"].includes(stage)
      ? undefined
      : telecallers[Math.floor(r() * telecallers.length)]!;
  const program = pick(r, programs);
  const destination = pick(r, destinations);
  const created = dayOffset(-Math.floor(r() * 26) - 1);
  const contacted = assigned ? dayOffset(-Math.floor(r() * 5)) : undefined;
  const next =
    assigned && r() > 0.35 ? dayOffset(Math.floor(r() * 6) - 2) : undefined;

  return {
    id: `LD-${(2400 + i).toString()}`,
    name,
    phone: `+91 9${(70000000 + i * 913457).toString().slice(0, 4)}•••${(1000 + i * 13).toString().slice(0, 4)}`,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
    source: sources[i % sources.length]!,
    campaignId: campaign.id,
    score,
    quality,
    stage,
    qualification: quality === "junk" ? "Junk" : score >= 55 ? "Qualified" : "Pending",
    intent: score >= 80 ? "High" : score >= 55 ? "Medium" : "Low",
    program,
    destination,
    budget: pick(r, budgets),
    intake: r() > 0.4 ? "2026" : "2027",
    academic: pick(r, academics),
    assignedTo: assigned?.id,
    managerId: assigned?.managerId,
    createdAt: created,
    lastContact: contacted,
    nextFollowUp: next,
    aiSummary: pick(r, summaries).replace("{program}", program).replace("{destination}", destination),
    reason:
      quality === "junk"
        ? "Call reached an unrelated person and no education intent was expressed. Number flagged as junk."
        : `Budget range matches ${program} programmes in ${destination}, intake is confirmed for ${r() > 0.4 ? "2026" : "2027"}, and the student asked about next steps — all strong buying signals.`,
    documents: pick(r, ["Ready", "Partially Ready", "Not Started"]),
    timeline: pick(r, ["Immediate", "1–3 months", "3–6 months", "Undecided"]),
  } satisfies Lead;
});

export const leadById = (id: string) => leads.find((l) => l.id === id);

export const TRANSCRIPT: Array<{ t: string; who: "AI" | "Lead"; text: string }> = [
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

/* --------------------------------- ai calls -------------------------------- */

const callStatuses: AiCall["status"][] = [
  "Completed","Completed","Completed","No Answer","Completed","Busy","Completed","Failed","Completed","Calling",
];

export const aiCalls: AiCall[] = leads.slice(0, 38).map((l, i) => {
  const r = rng(500 + i * 91);
  const status = callStatuses[i % callStatuses.length]!;
  return {
    id: `CL-${9100 + i}`,
    leadId: l.id,
    at: dayOffset(-Math.floor(r() * 4)),
    durationSec: status === "Completed" ? 90 + Math.floor(r() * 220) : Math.floor(r() * 20),
    status,
    score: status === "Completed" ? l.score : undefined,
    qualification: status === "Completed" ? (l.score >= 55 ? "Qualified" : "Junk") : "Pending",
  };
});

export const callsForLead = (leadId: string) => aiCalls.filter((c) => c.leadId === leadId);

/* -------------------------------- follow-ups ------------------------------- */

const reasons = [
  "Budget discussion with parents",
  "Send university shortlist",
  "Document collection",
  "Counselling session",
  "Offer letter walkthrough",
  "Confirm intake preference",
  "Fee structure clarification",
];

export const followUps: FollowUp[] = leads
  .filter((l) => l.assignedTo)
  .slice(0, 24)
  .map((l, i) => {
    const r = rng(77 + i * 53);
    const offset = i % 5 === 0 ? -(1 + Math.floor(r() * 3)) : i % 3 === 0 ? 0 : 1 + Math.floor(r() * 5);
    const done = i % 7 === 0;
    return {
      id: `FU-${300 + i}`,
      leadId: l.id,
      ownerId: l.assignedTo!,
      date: dayOffset(offset),
      time: ["10:00 AM", "11:30 AM", "01:00 PM", "03:15 PM", "05:45 PM"][i % 5]!,
      reason: reasons[i % reasons.length]!,
      priority: l.quality === "hot" ? "High" : l.quality === "high" ? "Medium" : "Low",
      status: done ? "Completed" : offset < 0 ? "Overdue" : offset === 0 ? "Today" : "Upcoming",
      notes: i % 4 === 0 ? "Student asked to be called after college hours." : undefined,
    } satisfies FollowUp;
  });

/* ------------------------------- applications -------------------------------- */

export const applications: Application[] = leads
  .filter((l) => ["Interested", "Application", "Converted"].includes(l.stage))
  .slice(0, 18)
  .map((l, i) => {
    const r = rng(9001 + i * 17);
    const stage: AppStage =
      l.stage === "Converted"
        ? "Converted"
        : APP_STAGES[Math.min(APP_STAGES.length - 2, 1 + Math.floor(r() * 6))]!;
    return {
      id: `AP-${700 + i}`,
      leadId: l.id,
      stage,
      value: [850000, 1250000, 1800000, 2200000, 2600000][i % 5]!,
      ownerId: l.assignedTo ?? telecallers[i % telecallers.length]!.id,
      lastActivity: dayOffset(-Math.floor(r() * 6)),
    } satisfies Application;
  });

/* --------------------------------- activity -------------------------------- */

const activityTemplates: Array<[ActivityItem["kind"], string]> = [
  ["lead", "New lead received from Meta Lead Form"],
  ["ai", "AI call completed · 4m 12s"],
  ["ai", "Lead qualified with score 91"],
  ["assign", "Lead assigned to Priya Nair"],
  ["followup", "Follow-up scheduled for tomorrow 11:30 AM"],
  ["application", "Application submitted for UK Masters"],
  ["conversion", "Lead converted · deposit paid"],
  ["alert", "3 AI calls failed on the Georgia MBBS campaign"],
  ["lead", "New lead received from Google Lead Form"],
  ["ai", "AI call marked no answer · retry queued"],
];

export const activity: ActivityItem[] = Array.from({ length: 28 }, (_, i) => {
  const r = rng(4400 + i * 13);
  const [kind, text] = activityTemplates[i % activityTemplates.length]!;
  const lead = leads[Math.floor(r() * leads.length)]!;
  return {
    id: `AC-${i}`,
    at: dayOffset(-Math.floor(i / 4)),
    kind,
    text: `${text} · ${lead.name}`,
    actor: pick(r, team).name,
  };
});

export const notificationsSeed = [
  { id: "n1", text: "12 new qualified leads are waiting for assignment.", kind: "assign" as const, at: "12m ago" },
  { id: "n2", text: "5 follow-ups are due today.", kind: "followup" as const, at: "38m ago" },
  { id: "n3", text: "3 AI calls failed and need a retry.", kind: "alert" as const, at: "1h ago" },
  { id: "n4", text: "Rahul Kumar has been marked as Hot.", kind: "lead" as const, at: "2h ago" },
  { id: "n5", text: "New application submitted for Germany Masters 2026.", kind: "application" as const, at: "4h ago" },
];

/* --------------------------------- derived --------------------------------- */

export const totals = {
  leads: 12486,
  newLeads: 1420,
  qualified: 7842,
  junk: 2913,
  aiCalls: 8920,
  aiSuccess: 6714,
  followUps: 946,
  applications: 1284,
  conversions: 386,
};

export const funnel = [
  { label: "Leads", value: 12486 },
  { label: "Validated", value: 10738 },
  { label: "AI Qualified", value: 7842 },
  { label: "Manager Approved", value: 6410 },
  { label: "Assigned", value: 5240 },
  { label: "Contacted", value: 4370 },
  { label: "Interested", value: 2520 },
  { label: "Application", value: 1284 },
  { label: "Converted", value: 386 },
];

export const sourceSplit = [
  { label: "Meta Lead Forms", value: 4246, color: "var(--color-primary)" },
  { label: "Meta WhatsApp", value: 2748, color: "var(--color-med)" },
  { label: "Google Lead Forms", value: 1873, color: "var(--color-high)" },
  { label: "Google Search", value: 2185, color: "var(--color-ok)" },
  { label: "Website", value: 1434, color: "var(--color-low)" },
];

export const qualitySplit = [
  { label: "Hot", value: 2622, color: "var(--color-hot)" },
  { label: "High", value: 3639, color: "var(--color-high)" },
  { label: "Medium", value: 3265, color: "var(--color-med)" },
  { label: "Low", value: 1997, color: "var(--color-low)" },
  { label: "Junk", value: 963, color: "var(--color-junk)" },
];

export interface SourcePerf {
  source: string;
  leads: number;
  valid: number;
  qualified: number;
  aiRate: number;
  hot: number;
  applications: number;
  conversions: number;
}

export const sourcePerformance: Record<"daily" | "weekly" | "monthly", SourcePerf[]> = {
  daily: [
    { source: "Meta", leads: 214, valid: 186, qualified: 121, aiRate: 65, hot: 41, applications: 22, conversions: 6 },
    { source: "Google", leads: 168, valid: 149, qualified: 104, aiRate: 70, hot: 36, applications: 19, conversions: 6 },
    { source: "Website", leads: 62, valid: 57, qualified: 41, aiRate: 72, hot: 15, applications: 8, conversions: 3 },
    { source: "WhatsApp", leads: 121, valid: 96, qualified: 58, aiRate: 60, hot: 18, applications: 7, conversions: 2 },
  ],
  weekly: [
    { source: "Meta", leads: 1490, valid: 1288, qualified: 842, aiRate: 65, hot: 286, applications: 152, conversions: 44 },
    { source: "Google", leads: 1174, valid: 1042, qualified: 728, aiRate: 70, hot: 251, applications: 131, conversions: 40 },
    { source: "Website", leads: 438, valid: 402, qualified: 289, aiRate: 72, hot: 104, applications: 56, conversions: 18 },
    { source: "WhatsApp", leads: 851, valid: 672, qualified: 405, aiRate: 60, hot: 126, applications: 48, conversions: 13 },
  ],
  monthly: [
    { source: "Meta", leads: 5432, valid: 4712, qualified: 3084, aiRate: 65, hot: 1042, applications: 556, conversions: 162 },
    { source: "Google", leads: 4286, valid: 3801, qualified: 2658, aiRate: 70, hot: 914, applications: 478, conversions: 145 },
    { source: "Website", leads: 1602, valid: 1468, qualified: 1054, aiRate: 72, hot: 378, applications: 204, conversions: 49 },
    { source: "WhatsApp", leads: 1166, valid: 921, qualified: 555, aiRate: 60, hot: 172, applications: 66, conversions: 30 },
  ],
};

export interface CallerPerf {
  id: string;
  assigned: number;
  contacted: number;
  interested: number;
  followUps: number;
  applications: number;
  conversions: number;
}

export const callerPerformance: CallerPerf[] = telecallers.map((t, i) => {
  const r = rng(220 + i * 31);
  const assigned = 58 + Math.floor(r() * 46);
  const contacted = Math.floor(assigned * (0.72 + r() * 0.2));
  const interested = Math.floor(contacted * (0.38 + r() * 0.2));
  const applications = Math.floor(interested * (0.4 + r() * 0.18));
  const conversions = Math.floor(applications * (0.35 + r() * 0.25));
  return {
    id: t.id,
    assigned,
    contacted,
    interested,
    followUps: Math.floor(interested * (0.6 + r() * 0.4)),
    applications,
    conversions,
  };
});

export const perfFor = (id: string) => callerPerformance.find((c) => c.id === id);
