// Mock data for personas, peer posts, clinicians, KPIs.
// In production, peer posts come from the moderated forum; clinicians from
// the credentialing system; KPIs from production telemetry + monthly dashboards.

export interface PeerPost {
  id: string;
  author: string;
  avatar: string;
  ts: string; // relative
  content: string;
  tags: string[];
  aiFlag: "clean" | "review" | "escalate";
  moderatorAction?: string;
  replies: number;
  hearts: number;
}

export const PEER_POSTS: PeerPost[] = [
  {
    id: "p1",
    author: "Jordan",
    avatar: "J",
    ts: "12m ago",
    content:
      "Day 14 of my DBT diary card. The TIPP skill got me through a rough meeting today — temperature shift actually worked when I splashed cold water. Anyone else surprised by how fast it works?",
    tags: ["dbt", "skills", "win"],
    aiFlag: "clean",
    replies: 4,
    hearts: 12,
  },
  {
    id: "p2",
    author: "Anonymous",
    avatar: "A",
    ts: "37m ago",
    content:
      "Struggling tonight. Family stuff came up and I can't sleep. Not in danger — just tired of the same loop. Anyone willing to listen?",
    tags: ["support", "family", "insomnia"],
    aiFlag: "review",
    moderatorAction: "Supportive response sent by moderator",
    replies: 9,
    hearts: 28,
  },
  {
    id: "p3",
    author: "Sam",
    avatar: "S",
    ts: "1h ago",
    content:
      "Therapy session went well. We mapped out my avoidance patterns — turns out I've been ducking not the task itself but the feelings about the task. Anyone else notice that?",
    tags: ["therapy", "insight"],
    aiFlag: "clean",
    replies: 2,
    hearts: 18,
  },
  {
    id: "p4",
    author: "Robin",
    avatar: "R",
    ts: "2h ago",
    content:
      "Question for the community — how do you handle the gap between sessions? I've been journaling but it's starting to feel like a chore.",
    tags: ["question", "between-sessions"],
    aiFlag: "clean",
    replies: 11,
    hearts: 24,
  },
];

export interface Clinician {
  id: string;
  name: string;
  credentials: string;
  specialties: string[];
  modality: "video" | "video+psychiatry";
  nextAvailable: string;
  rating: number;
  sessionsCompleted: number;
  inNetwork: boolean;
}

export const CLINICIANS: Clinician[] = [
  {
    id: "c1",
    name: "Dr. Elena Rostova",
    credentials: "PsyD, Licensed Clinical Psychologist",
    specialties: ["CBT", "Anxiety", "Trauma"],
    modality: "video",
    nextAvailable: "Tue 2:00 PM",
    rating: 4.9,
    sessionsCompleted: 842,
    inNetwork: true,
  },
  {
    id: "c2",
    name: "Dr. Marcus Chen",
    credentials: "MD, Board-certified Psychiatrist",
    specialties: ["Medication management", "ADHD", "Depression"],
    modality: "video+psychiatry",
    nextAvailable: "Thu 10:30 AM",
    rating: 4.8,
    sessionsCompleted: 1103,
    inNetwork: true,
  },
  {
    id: "c3",
    name: "Dr. Priya Anand",
    credentials: "LCSW, DBT-Linehan trained",
    specialties: ["DBT", "Borderline Personality", "Self-harm recovery"],
    modality: "video",
    nextAvailable: "Mon 4:00 PM",
    rating: 4.9,
    sessionsCompleted: 624,
    inNetwork: true,
  },
  {
    id: "c4",
    name: "Dr. James Okonkwo",
    credentials: "MD, Psychiatrist, Addiction medicine",
    specialties: ["Co-occurring", "Substance use", "Mood disorders"],
    modality: "video+psychiatry",
    nextAvailable: "Waitlist — 9 days",
    rating: 4.7,
    sessionsCompleted: 532,
    inNetwork: true,
  },
];

// Smart Insights mock — §7.2. Every claim has a source anchor (chat session / assessment).
export interface SmartInsight {
  id: string;
  kind: "theme" | "goal" | "risk" | "score-trend";
  text: string;
  source: string; // anchor
  editable: boolean;
}

export const SMART_INSIGHTS: SmartInsight[] = [
  {
    id: "si1",
    kind: "theme",
    text: 'Member has referenced "Sunday night dread" in 3 of last 5 sessions. Theme: anticipatory work anxiety.',
    source: "Sessions #142, #145, #149 — chat transcripts",
    editable: true,
  },
  {
    id: "si2",
    kind: "score-trend",
    text: "PHQ-9 score dropped from 14 → 11 over 14 days. GAD-7 stable at 9 (mild range).",
    source: "Assessments 2026-08-14, 2026-08-30, 2026-09-06",
    editable: false,
  },
  {
    id: "si3",
    kind: "goal",
    text: 'Stated goal: "Reduce anxiety before quarterly reviews." Box-breathing practice logged 8× in last 14 days.',
    source: "Memory entry — goal tracker + breathing tool telemetry",
    editable: true,
  },
  {
    id: "si4",
    kind: "risk",
    text: "No high-acuity flags in last 30 days. One false-positive dismissal on 2026-08-22 — reviewed and logged to evaluation set.",
    source: "Safety classifier audit log",
    editable: false,
  },
];

// Smart Notes mock — §7.1. SOAP/DAP format with transcript anchors per claim.
export interface NoteStatement {
  id: string;
  text: string;
  anchor?: string; // transcript reference, e.g. "L12-L18"
  anchored: boolean;
  section: "S" | "O" | "A" | "P";
}

export const SMART_NOTES_TEMPLATE: NoteStatement[] = [
  {
    id: "ns1",
    text: "45-minute video session. Member reports increased work-related anxiety in lead-up to quarterly review next Tuesday.",
    anchor: "L1-L8",
    anchored: true,
    section: "S",
  },
  {
    id: "ns2",
    text: 'Member stated: "I haven\'t been sleeping well, maybe 4-5 hours, mind won\'t shut off."',
    anchor: "L12-L18",
    anchored: true,
    section: "S",
  },
  {
    id: "ns3",
    text: "PHQ-9 administered at session start: score 11 (moderate). GAD-7: score 9 (mild). Both improved from 14 days ago.",
    anchor: "Assessment logs 2026-09-13",
    anchored: true,
    section: "O",
  },
  {
    id: "ns4",
    text: "Member presents with generalized anxiety, situational trigger (work review), and mild depressive symptoms consistent with adjustment difficulty.",
    anchor: undefined,
    anchored: false, // unanchored — renders as bracketed prompt per §7.1
    section: "A",
  },
  {
    id: "ns5",
    text: "Plan: Continue CBT framework. Practiced cognitive restructuring of 'I will fail' thought. Assigned box-breathing 2× daily. Next session: Tuesday 2:00 PM.",
    anchor: "L34-L42",
    anchored: true,
    section: "P",
  },
];

// Supervisor console — crisis queue. §5.4 escalation SLA: ≤5 min for imminent risk.
export interface CrisisEvent {
  id: string;
  ts: string; // relative
  user: string; // de-identified
  reason: string;
  language: string;
  channel: "text" | "voice";
  status: "pending" | "reviewing" | "outreached" | "closed";
  slaRemainingSec: number; // countdown to SLA breach
  disposition?: string;
}

export const CRISIS_QUEUE: CrisisEvent[] = [
  {
    id: "ce1",
    ts: "38s ago",
    user: "User-7F3A (de-identified)",
    reason: "Suicidal ideation — high confidence (0.97)",
    language: "English",
    channel: "text",
    status: "pending",
    slaRemainingSec: 262, // 5 min - 38s
  },
  {
    id: "ce2",
    ts: "2m ago",
    user: "User-9B21 (de-identified)",
    reason: "Self-harm language",
    language: "English",
    channel: "voice",
    status: "reviewing",
    slaRemainingSec: 180,
    disposition: "Outreach in progress — voice session kept open",
  },
  {
    id: "ce3",
    ts: "14m ago",
    user: "User-4C8F (de-identified)",
    reason: "Domestic violence disclosure",
    language: "English",
    channel: "text",
    status: "outreached",
    slaRemainingSec: 0,
    disposition: "Care navigator contacted user — resources shared",
  },
  {
    id: "ce4",
    ts: "1h ago",
    user: "User-2D7E (de-identified)",
    reason: "False positive — dismissed by user",
    language: "English",
    channel: "text",
    status: "closed",
    slaRemainingSec: 0,
    disposition: "Logged to evaluation set; no user-level restrictions applied per §5.3",
  },
];

// KPI dashboard — §12 table
export interface KPIRow {
  id: string;
  metric: string;
  definition: string;
  target: string;
  current: string;
  status: "on-track" | "watch" | "breach" | "pre-launch";
  sparkline: number[];
}

export const KPIS: KPIRow[] = [
  {
    id: "k1",
    metric: "Crisis recall",
    definition: "Classifier recall on high-acuity, per language",
    target: "≥ 0.95",
    current: "0.96 (EN)",
    status: "on-track",
    sparkline: [0.92, 0.94, 0.95, 0.95, 0.96, 0.96],
  },
  {
    id: "k2",
    metric: "False-alarm rate",
    definition: "Crisis workflows per 1,000 messages",
    target: "≤ 2",
    current: "1.4",
    status: "on-track",
    sparkline: [2.1, 1.9, 1.8, 1.6, 1.5, 1.4],
  },
  {
    id: "k3",
    metric: "Time-to-human-review (p95)",
    definition: "Classifier alarm → supervisor review start",
    target: "≤ 5 min",
    current: "3m 12s",
    status: "on-track",
    sparkline: [6.2, 5.5, 4.8, 4.1, 3.6, 3.2],
  },
  {
    id: "k4",
    metric: "Crisis-resource reachability",
    definition: "Unauthenticated user → crisis link tap",
    target: "≤ 2 taps, always available",
    current: "1 tap, all screens",
    status: "on-track",
    sparkline: [1, 1, 1, 1, 1, 1],
  },
  {
    id: "k5",
    metric: "Clinical efficacy (Tier 4)",
    definition: "PHQ-9/GAD-7 ≥50% reduction at 6 weeks",
    target: "≥ 50% response",
    current: "Pre-launch",
    status: "pre-launch",
    sparkline: [0, 0, 0, 0, 0, 0],
  },
  {
    id: "k6",
    metric: "Tier 2 moderator response (p95)",
    definition: "Report/flag → moderator action",
    target: "≤ 15 min",
    current: "11m 40s",
    status: "on-track",
    sparkline: [18, 16, 15, 14, 13, 11.6],
  },
  {
    id: "k7",
    metric: "Clinician efficiency",
    definition: "Documentation minutes per session",
    target: "≥ 45% reduction",
    current: "48% reduction",
    status: "on-track",
    sparkline: [50, 47, 45, 46, 47, 48],
  },
  {
    id: "k8",
    metric: "Smart Notes edit burden",
    definition: "Median char edit distance, signed notes",
    target: "≤ 30%",
    current: "24%",
    status: "on-track",
    sparkline: [35, 32, 30, 28, 26, 24],
  },
  {
    id: "k9",
    metric: "Voice response latency (p95)",
    definition: "User stops speaking → agent starts",
    target: "≤ 2.0 s (v1)",
    current: "2.4 s (prototype)",
    status: "watch",
    sparkline: [3.1, 2.9, 2.7, 2.6, 2.5, 2.4],
  },
  {
    id: "k10",
    metric: "Voice crisis recall",
    definition: "Recall on voice-specific test set, per language",
    target: "≥ 0.95",
    current: "0.91 (EN, prototype)",
    status: "breach",
    sparkline: [0.82, 0.85, 0.87, 0.89, 0.90, 0.91],
  },
  {
    id: "k11",
    metric: "Voice safety-gap incidents",
    definition: "Substantive replies to uncleared crisis content",
    target: "0",
    current: "0 (audit sampling)",
    status: "on-track",
    sparkline: [0, 0, 0, 0, 0, 0],
  },
  {
    id: "k12",
    metric: "Platform reliability",
    definition: "Uptime (excl. planned maintenance)",
    target: "≥ 99.9%",
    current: "99.94%",
    status: "on-track",
    sparkline: [99.91, 99.93, 99.92, 99.95, 99.93, 99.94],
  },
];

// Cost-to-serve mock — §10.3 Phase 0 deliverable
export const COST_TO_SERVE = {
  tier1: { monthly: 0.42, drivers: ["AI inference", "Crisis resources hosting"] },
  tier2: { monthly: 4.18, drivers: ["AI inference", "Moderation staffing", "Voice compute"] },
  tier3: { monthly: 0, drivers: ["Per-session platform fee billed via payer"] },
  tier4: { monthly: 28.50, drivers: ["Per-clinician license", "Smart Notes compute"] },
};
