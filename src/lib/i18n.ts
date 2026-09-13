import type { Lang } from "./store";

// Bilingual strings — used for both EN and AR (RTL demo).
// Per §6: launch languages include English, Spanish, Arabic (Gulf/MSA), French, Vietnamese, Mandarin.
// This demo implements EN + AR to demonstrate RTL parity gate behavior.
type Dict = Record<string, { en: string; ar: string }>;

export const T: Dict = {
  appName: { en: "Serenity", ar: "سيرينيتي" },
  tagline: {
    en: "Stepped-care mental health, 24/7",
    ar: "رعاية صحية نفسية متدرجة، على مدار الساعة",
  },
  navHome: { en: "Home", ar: "الرئيسية" },
  navCompanion: { en: "AI Companion", ar: "المرافق الذكي" },
  navWellness: { en: "Wellness", ar: "الصحة" },
  navPeer: { en: "Peer Space", ar: "مساحة الأقران" },
  navTelehealth: { en: "Telehealth", ar: "الرعاية عن بُعد" },
  navCopilot: { en: "Clinician Co-Pilot", ar: "مساعد الطبيب" },
  navSupervisor: { en: "Supervisor Console", ar: "وحدة الإشراف" },
  navSafety: { en: "Safety Engineering", ar: "هندسة السلامة" },
  navAdmin: { en: "Enterprise Admin", ar: "إدارة المؤسسات" },
  navFhir: { en: "FHIR / EHR", ar: "FHIR / السجل الصحي" },
  navResearch: { en: "Research Pilot", ar: "الدراسة البحثية" },
  navTdd: { en: "Technical Design", ar: "التصميم التقني" },
  navSettings: { en: "Settings", ar: "الإعدادات" },

  crisisBar: {
    en: "If you are in crisis, help is one tap away. Reachable without an account.",
    ar: "إذا كنت في أزمة، المساعدة على بُعد نقرة واحدة. متاحة دون حساب.",
  },
  crisisCall911: { en: "Call 911", ar: "اتصل بالطوارئ" },
  crisisCall988: { en: "Call 988", ar: "اتصل بـ 988" },
  crisisTextLine: { en: "Crisis Text Line", ar: "خط نص الأزمات" },

  aiIdentity: {
    en: "I'm an automated wellness tool — not a therapist or a person. You can always ask for a human.",
    ar: "أنا أداة عافية آلية — لست معالجًا أو شخصًا. يمكنك دائمًا طلب مساعدة بشرية.",
  },
  aiScopeNote: {
    en: "Bound to CBT / DBT / ACT / MBSR frameworks. Cannot diagnose or prescribe.",
    ar: "مقيّد بأطر CBT / DBT / ACT / MBSR. لا يمكنه التشخيص أو وصف الأدوية.",
  },
  switchToHuman: { en: "Switch to a human", ar: "التحويل إلى مختص" },
  switchToText: { en: "Switch to text", ar: "التبديل إلى النص" },
  voiceMode: { en: "Voice Mode", ar: "الوضع الصوتي" },

  moodQuestion: {
    en: "How are you feeling right now?",
    ar: "كيف تشعر الآن؟",
  },
  moodSubmit: { en: "Log mood", ar: "تسجيل المزاج" },

  phq9Title: { en: "PHQ-9 Depression Screen", ar: "فحص الاكتئاب PHQ-9" },
  gad7Title: { en: "GAD-7 Anxiety Screen", ar: "فحص القلق GAD-7" },
  startAssessment: { en: "Start", ar: "ابدأ" },
};

export function tr(key: keyof typeof T, lang: Lang): string {
  const entry = T[key];
  if (!entry) return key as string;
  return entry[lang] ?? entry.en;
}
