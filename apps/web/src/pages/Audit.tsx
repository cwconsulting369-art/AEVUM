import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronLeft, ChevronRight, Upload, FileText,
  Shield, ArrowLeft, Calendar, X, AlertCircle,
  Building2, Users, Star, Briefcase,
} from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import CONTACT from '@/config/contact';
import { track } from '@/lib/shop-track';
import { usePageSeo } from '@/hooks/use-page-seo';

/* ------------------------------------------------------------------ */
/*  TYPES                                                             */
/* ------------------------------------------------------------------ */

type Segment = 'AG' | 'PB' | 'FI' | null;
type Urgency = 'sofort' | '1-4-wochen' | 'nur-infos';
type SetupBudget = '500-2k' | '2-8k' | '8-20k' | '20k+' | '';
type RetainerBudget = '0-500' | '500-2k' | '2-5k' | '5k+' | '';

// Shared contact data
interface ContactData {
  name: string;
  email: string;
  phone: string;
  urgency: Urgency | '';
}

// Budget step (V2-Master §10 — Step 6)
interface BudgetData {
  setup: SetupBudget;
  retainer: RetainerBudget;
}

// AG — Agentur / Freelancer-Team
interface AGData {
  kundenanzahl: string;
  zeitfresser: string;
  monthly_revenue: string;
}

// PB — Personal Brand / Creator / Coach
interface PBData {
  hauptkanal: string;
  skalierung: string;
  monthly_revenue: string;
}

// FI — Mittelstand / Unternehmen
interface FIData {
  branche: string;
  mitarbeiterzahl: string;
  pain: string;
}

interface FormState {
  segment: Segment;
  ag: AGData;
  pb: PBData;
  fi: FIData;
  budget: BudgetData;
  contact: ContactData;
  consent_dsgvo: boolean;
}

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                         */
/* ------------------------------------------------------------------ */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.aevum-system.de';
const STORAGE_KEY = 'audit-form-v3-draft';
const HELPBOT_PREFILL_KEY = 'aevum_audit_prefill';

const MONTHLY_REVENUE_OPTIONS = [
  { value: '<5k', label: 'Unter 5.000 €/Mo' },
  { value: '5-15k', label: '5.000 – 15.000 €/Mo' },
  { value: '15-50k', label: '15.000 – 50.000 €/Mo' },
  { value: '>50k', label: 'Über 50.000 €/Mo' },
] as const;

const AG_ZEITFRESSER_OPTIONS = [
  { value: 'content', label: 'Content-Produktion' },
  { value: 'reporting', label: 'Reporting' },
  { value: 'onboarding', label: 'Kunden-Onboarding' },
  { value: 'pitches', label: 'Pitches & Angebote' },
] as const;

const PB_KANAL_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'newsletter', label: 'Newsletter' },
] as const;

const PB_SKALIERUNG_OPTIONS = [
  { value: 'content', label: 'Content-Produktion' },
  { value: 'monetarisierung', label: 'Monetarisierung' },
  { value: 'community', label: 'Community' },
  { value: 'launches', label: 'Launch-Prozesse' },
] as const;

const FI_BRANCHE_OPTIONS = [
  { value: 'handel', label: 'Handel' },
  { value: 'dienstleistung', label: 'Dienstleistung' },
  { value: 'produktion', label: 'Produktion' },
  { value: 'immobilien', label: 'Immobilien' },
  { value: 'sonstiges', label: 'Sonstiges' },
] as const;

const FI_MITARBEITER_OPTIONS = [
  { value: '1-10', label: '1 – 10 Mitarbeiter' },
  { value: '11-50', label: '11 – 50 Mitarbeiter' },
  { value: '50+', label: '50+ Mitarbeiter' },
] as const;

const FI_PAIN_OPTIONS = [
  { value: 'reporting', label: 'Reporting' },
  { value: 'leadgenerierung', label: 'Leadgenerierung' },
  { value: 'kundenservice', label: 'Kundenservice' },
  { value: 'interne-prozesse', label: 'Interne Prozesse' },
] as const;

const URGENCY_OPTIONS = [
  { value: 'sofort' as const, label: 'Sofort — ich will loslegen' },
  { value: '1-4-wochen' as const, label: 'In 1 – 4 Wochen' },
  { value: 'nur-infos' as const, label: 'Ich sammle erst Infos' },
];

// Budget — mig009 tier-Ranges (Setup-Bereitschaft)
const BUDGET_SETUP_OPTIONS = [
  { value: '500-2k' as const, label: '€ 500 – 2.000', desc: 'Audit / sehr schlankes Setup' },
  { value: '2-8k' as const,   label: '€ 2.000 – 8.000', desc: 'Tier S — 1 Use Case + Basics' },
  { value: '8-20k' as const,  label: '€ 8.000 – 20.000', desc: 'Tier M — 2-3 Use Cases + Custom' },
  { value: '20k+' as const,   label: '€ 20.000+', desc: 'Tier L — Multi-Project / Enterprise' },
];

// Budget — Retainer-Bereitschaft / Mo
const BUDGET_RETAINER_OPTIONS = [
  { value: '0-500' as const,  label: '€ 0 – 500 / Mo',     desc: 'Audit-Only / kein Retainer' },
  { value: '500-2k' as const, label: '€ 500 – 2.000 / Mo', desc: 'Basics / kleinere Skalierung' },
  { value: '2-5k' as const,   label: '€ 2.000 – 5.000 / Mo', desc: 'Growth / aktives Optimieren' },
  { value: '5k+' as const,    label: '€ 5.000+ / Mo',      desc: 'Skalierung / Enterprise' },
];

// Map UI ranges → numeric min/max for backend (matches mig009)
const SETUP_BUDGET_RANGE: Record<SetupBudget, { min: number; max: number }> = {
  '500-2k':  { min: 500,   max: 2000 },
  '2-8k':    { min: 2000,  max: 8000 },
  '8-20k':   { min: 8000,  max: 20000 },
  '20k+':    { min: 20000, max: 75000 },
  '':        { min: 0,     max: 0 },
};
const RETAINER_BUDGET_RANGE: Record<RetainerBudget, { min: number; max: number }> = {
  '0-500':   { min: 0,    max: 500 },
  '500-2k':  { min: 500,  max: 2000 },
  '2-5k':    { min: 2000, max: 5000 },
  '5k+':     { min: 5000, max: 10000 },
  '':        { min: 0,    max: 0 },
};

/* ------------------------------------------------------------------ */
/*  STEPS (segment-aware)                                             */
/* ------------------------------------------------------------------ */
// Step 0: Segment
// Step 1: Segment-Fragen
// Step 2: Budget + Timeline
// Step 3: Kontakt
// Step 4: Review + Submit

const STEP_LABELS = ['Wer bist du?', 'Deine Situation', 'Investment', 'Kontakt', 'Bestätigung'];
const TOTAL_STEPS = 5;

/* ------------------------------------------------------------------ */
/*  HELPBOT                                                           */
/* ------------------------------------------------------------------ */

interface HelpbotPrefill { helpbot_session_id?: string | null; saved_at?: string; }

function loadHelpbotPrefill(): HelpbotPrefill | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HELPBOT_PREFILL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HelpbotPrefill;
    if (!parsed.helpbot_session_id) return null;
    if (parsed.saved_at) {
      const age = Date.now() - new Date(parsed.saved_at).getTime();
      if (age > 24 * 60 * 60 * 1000) return null;
    }
    return parsed;
  } catch { return null; }
}
function clearHelpbotPrefill() {
  try { localStorage.removeItem(HELPBOT_PREFILL_KEY); } catch { /* noop */ }
}

/* ------------------------------------------------------------------ */
/*  FILE UPLOAD                                                       */
/* ------------------------------------------------------------------ */

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'image/png',
  'image/jpeg',
];
const ALLOWED_EXT_RE = /\.(pdf|docx?|xlsx?|csv|png|jpe?g)$/i;

interface UploadedFileMeta { filename: string; url: string; type?: string; size_bytes?: number; }

function isAllowedFile(file: File): boolean {
  if (file.size > MAX_FILE_BYTES) return false;
  if (ALLOWED_FILE_TYPES.includes(file.type)) return true;
  return ALLOWED_EXT_RE.test(file.name);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/*  ANIMATIONS                                                        */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d < 0 ? 100 : -100, opacity: 0 }),
};

/* ------------------------------------------------------------------ */
/*  DEFAULT STATE                                                     */
/* ------------------------------------------------------------------ */

const DEFAULT_STATE: FormState = {
  segment: null,
  ag: { kundenanzahl: '', zeitfresser: '', monthly_revenue: '' },
  pb: { hauptkanal: '', skalierung: '', monthly_revenue: '' },
  fi: { branche: '', mitarbeiterzahl: '', pain: '' },
  budget: { setup: '', retainer: '' },
  contact: { name: '', email: '', phone: '', urgency: '' },
  consent_dsgvo: false,
};

/* ================================================================== */
/*  MAIN                                                              */
/* ================================================================== */

export default function Audit() {
  usePageSeo({
    title: 'Workflow-Audit kostenlos starten — AEVUM',
    description: 'Kostenfreies Workflow-Audit für Unternehmen in DACH. In 4 Schritten zu Automation-Potenzialen, Kosten-Ersparnis und Pipeline-Wachstum.',
    path: '/audit',
  });
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<FormState>(DEFAULT_STATE);

  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [helpbotSessionId, setHelpbotSessionId] = useState<string | null>(null);
  const [showHelpbotBanner, setShowHelpbotBanner] = useState(false);

  /* -- Draft persistence + audit_start funnel event -- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FormState>;
        setFormState(prev => ({ ...prev, ...parsed }));
      }
    } catch { /* ignore */ }
    const prefill = loadHelpbotPrefill();
    if (prefill?.helpbot_session_id) {
      setHelpbotSessionId(prefill.helpbot_session_id);
      setShowHelpbotBanner(true);
    }
    track('audit_start');
  }, []);

  useEffect(() => {
    if (submitted) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(formState)); } catch { /* ignore */ }
  }, [formState, submitted]);

  /* -- Helpers -- */
  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSub = useCallback(<K extends 'ag' | 'pb' | 'fi' | 'contact' | 'budget'>(
    key: K, field: keyof FormState[K], value: string
  ) => {
    setFormState(prev => ({
      ...prev,
      [key]: { ...(prev[key] as Record<string, unknown>), [field]: value },
    }));
  }, []);

  /* -- Navigation -- */
  const canAdvance = useCallback((): boolean => {
    const s = formState;
    if (step === 0) return s.segment !== null;
    if (step === 1) {
      if (s.segment === 'AG') return !!(s.ag.kundenanzahl && s.ag.zeitfresser && s.ag.monthly_revenue);
      if (s.segment === 'PB') return !!(s.pb.hauptkanal && s.pb.skalierung && s.pb.monthly_revenue);
      if (s.segment === 'FI') return !!(s.fi.branche && s.fi.mitarbeiterzahl && s.fi.pain);
      return false;
    }
    if (step === 2) return !!(s.budget.setup && s.budget.retainer);
    if (step === 3) return !!(s.contact.name && s.contact.email && s.contact.urgency);
    return true;
  }, [step, formState]);

  const goNext = useCallback(() => {
    if (!canAdvance()) return;
    setDirection(1);
    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [canAdvance]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* -- File helpers -- */
  const addFiles = useCallback((incoming: FileList | File[]) => {
    setFileError(null);
    const list = Array.from(incoming);
    setFiles(prev => {
      const next = [...prev];
      for (const f of list) {
        if (next.length >= MAX_FILES) { setFileError(`Max. ${MAX_FILES} Dateien.`); break; }
        if (!isAllowedFile(f)) { setFileError(`"${f.name}" abgelehnt (Typ/Groesse).`); continue; }
        if (next.some(x => x.name === f.name && x.size === f.size)) continue;
        next.push(f);
      }
      return next;
    });
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFileError(null);
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const uploadOneFile = async (file: File): Promise<UploadedFileMeta | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const res = await fetch(`${API_BASE}/api/audit/upload-file`, { method: 'POST', body: fd });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json?.ok || !json.url) return null;
      return { filename: file.name, url: json.url, type: file.type || undefined, size_bytes: json.size_bytes ?? file.size };
    } catch { return null; }
  };

  /* -- Submit -- */
  const onSubmit = async () => {
    if (!formState.consent_dsgvo) return;
    setSubmitError(null);
    setIsSubmitting(true);
    track('audit_submit', { meta: { segment: formState.segment, urgency: formState.contact.urgency } });
    try {
      let uploadedFiles: UploadedFileMeta[] = [];
      if (files.length > 0) {
        const results = await Promise.all(files.map(f => uploadOneFile(f)));
        uploadedFiles = results.filter((r): r is UploadedFileMeta => r !== null);
      }

      const segmentAnswers =
        formState.segment === 'AG' ? formState.ag :
        formState.segment === 'PB' ? formState.pb :
        formState.segment === 'FI' ? formState.fi : {};

      const setupRange = SETUP_BUDGET_RANGE[formState.budget.setup];
      const retainerRange = RETAINER_BUDGET_RANGE[formState.budget.retainer];

      const payload: Record<string, unknown> = {
        form_version: 'v3-branching',
        segment: formState.segment,
        email: formState.contact.email,
        name: formState.contact.name,
        phone: formState.contact.phone || '',
        consent: true,
        urgency: formState.contact.urgency,
        budget_setup_min: setupRange.min,
        budget_setup_max: setupRange.max,
        budget_retainer_min: retainerRange.min,
        budget_retainer_max: retainerRange.max,
        answers: {
          segment: formState.segment,
          ...segmentAnswers,
          contact: formState.contact,
          urgency: formState.contact.urgency,
          budget: {
            setup_label: formState.budget.setup,
            retainer_label: formState.budget.retainer,
            setup_min: setupRange.min,
            setup_max: setupRange.max,
            retainer_min: retainerRange.min,
            retainer_max: retainerRange.max,
          },
        },
        uploaded_files: uploadedFiles,
        submitted_email: formState.contact.email,
      };
      if (helpbotSessionId) payload.helpbot_session_id = helpbotSessionId;

      const res = await fetch(`${API_BASE}/api/audit/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        localStorage.removeItem(STORAGE_KEY);
        clearHelpbotPrefill();
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError((await res.text()) || 'Ein Fehler ist aufgetreten.');
      }
    } catch {
      setSubmitError('Netzwerkfehler. Bitte erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -- Drag & Drop -- */
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const progressValue = ((step + 1) / TOTAL_STEPS) * 100;

  /* ================================================================= */
  /*  SUBMITTED                                                        */
  /* ================================================================= */

  if (submitted) {
    const contactLink = formState.contact.urgency === 'sofort' ? CONTACT.calendly : undefined;
    return (
      <div className="min-h-screen" style={{ background: '#0B0C10' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
              style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Check className="w-10 h-10" style={{ color: '#10B981' }} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F9FAFB' }}>
              Audit eingegangen!
            </h1>
            <p className="text-lg sm:text-xl mb-4 max-w-lg mx-auto"
              style={{ color: '#A1A1AA', lineHeight: 1.7 }}>
              Wir analysieren dein Profil und schicken dir das individuelle Auto-Plan-PDF (Tier-Empfehlung, Tool-Stack, Roadmap, Cashflow-/Revenue-Share-Alternativen) per Mail.
            </p>
            {formState.contact.urgency === 'sofort' && (
              <p className="text-sm mb-10 max-w-md mx-auto"
                style={{ color: '#e0a458' }}>
                Du hast "Sofort" gewahlt — buch direkt einen Termin, damit wir keine Zeit verlieren.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => { window.location.hash = '/'; }}
                className="h-12 px-8 text-base font-semibold rounded-lg"
                style={{ background: '#e0a458', color: '#0B0C10' }}>
                <ArrowLeft className="w-4 h-4 mr-2" />Zur Startseite
              </Button>
              {contactLink && (
                <Button variant="outline"
                  onClick={() => window.open(contactLink, '_blank')}
                  className="h-12 px-8 text-base font-semibold rounded-lg"
                  style={{ borderColor: 'rgba(224, 164, 88,0.4)', color: '#e0a458', background: 'transparent' }}>
                  <Calendar className="w-4 h-4 mr-2" />Termin buchen
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ================================================================= */
  /*  WIZARD                                                           */
  /* ================================================================= */

  return (
    <div className="min-h-screen" style={{ background: '#0B0C10' }}>

      {/* Progress Header */}
      <div className="sticky top-0 z-30"
        style={{ background: 'rgba(11,12,16,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: '#A1A1AA' }}>
              Schritt {step + 1} von {TOTAL_STEPS}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#e0a458', fontFamily: "'Space Grotesk', sans-serif" }}>
              {STEP_LABELS[step]}
            </span>
          </div>
          <Progress value={progressValue} className="h-1.5 w-full" />
          <div className="flex items-center justify-between mt-3">
            {STEP_LABELS.map((label, i) => (
              <button key={label} title={label}
                onClick={() => { if (i < step) { setDirection(-1); setStep(i); } }}
                disabled={i >= step}
                className="cursor-pointer disabled:cursor-default">
                <div className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: i <= step ? '#e0a458' : '#52525B',
                    transform: i === step ? 'scale(1.4)' : 'scale(1)',
                    boxShadow: i === step ? '0 0 10px rgba(224,164,88,0.4)' : 'none',
                  }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-24">

        {/* Helpbot banner */}
        {showHelpbotBanner && helpbotSessionId && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="mb-6 rounded-xl border p-4 flex items-start justify-between gap-4"
            style={{ background: 'rgba(224,164,88,0.08)', borderColor: 'rgba(224,164,88,0.35)' }}>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.16em] font-medium mb-1" style={{ color: '#e0a458' }}>
                Daten aus AI-Beratung ubernommen
              </div>
              <div className="text-sm leading-relaxed" style={{ color: '#E4E4E7' }}>
                Wir haben dich aus dem Chat erkannt und verknupfen den Audit mit deiner Beratung.
              </div>
            </div>
            <button type="button" onClick={() => setShowHelpbotBanner(false)}
              aria-label="Hinweis schliessen"
              className="p-1 rounded text-[#a4a4ad] hover:text-[#F9FAFB] hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <Card className="border-0 shadow-2xl"
              style={{ background: '#15161A', border: '1px solid rgba(255,255,255,0.06)' }}>
              <CardContent className="p-6 sm:p-10">

                {/* Step badge + title */}
                <div className="mb-8">
                  <Badge variant="outline" className="mb-3 text-xs"
                    style={{ borderColor: 'rgba(224,164,88,0.3)', color: '#e0a458', background: 'rgba(224,164,88,0.08)' }}>
                    Schritt {step + 1}
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F9FAFB' }}>
                    {STEP_LABELS[step]}
                  </h2>
                  {step === 0 && (
                    <p className="mt-2 text-sm" style={{ color: '#A1A1AA' }}>
                      Damit wir die richtigen Fragen stellen — was beschreibt dich am besten?
                    </p>
                  )}
                </div>

                <Separator className="mb-8" style={{ background: 'rgba(255,255,255,0.06)' }} />

                {/* ====== STEP 1: SEGMENT ====== */}
                {step === 0 && (
                  <StepSegment
                    value={formState.segment}
                    onChange={seg => update('segment', seg)}
                  />
                )}

                {/* ====== STEP 2: SEGMENT-FRAGEN ====== */}
                {step === 1 && formState.segment === 'AG' && (
                  <StepAG data={formState.ag} onChange={(f, v) => updateSub('ag', f, v)} />
                )}
                {step === 1 && formState.segment === 'PB' && (
                  <StepPB data={formState.pb} onChange={(f, v) => updateSub('pb', f, v)} />
                )}
                {step === 1 && formState.segment === 'FI' && (
                  <StepFI data={formState.fi} onChange={(f, v) => updateSub('fi', f, v)} />
                )}

                {/* ====== STEP 3: BUDGET + TIMELINE ====== */}
                {step === 2 && (
                  <StepBudget
                    data={formState.budget}
                    onChange={(f, v) => updateSub('budget', f, v as string)}
                  />
                )}

                {/* ====== STEP 4: KONTAKT ====== */}
                {step === 3 && (
                  <StepContact
                    data={formState.contact}
                    onChange={(f, v) => updateSub('contact', f, v)}
                    files={files}
                    fileError={fileError}
                    dragOver={dragOver}
                    fileInputRef={fileInputRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onFileInputChange={handleFileInputChange}
                    onRemoveFile={removeFile}
                    onOpenFilePicker={() => fileInputRef.current?.click()}
                  />
                )}

                {/* ====== STEP 5: REVIEW + SUBMIT ====== */}
                {step === 4 && (
                  <StepReview
                    formState={formState}
                    consent={formState.consent_dsgvo}
                    onConsentChange={v => update('consent_dsgvo', v)}
                    submitError={submitError}
                  />
                )}

              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}
            className="h-12 px-6 rounded-lg font-medium disabled:opacity-30"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#F9FAFB', background: 'rgba(255,255,255,0.04)' }}>
            <ChevronLeft className="w-4 h-4 mr-2" />Zuruck
          </Button>

          {step < TOTAL_STEPS - 1 ? (
            <Button type="button" onClick={goNext} disabled={!canAdvance()}
              className="h-12 px-8 rounded-lg font-semibold disabled:opacity-40"
              style={{ background: '#e0a458', color: '#0B0C10' }}>
              Weiter<ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={onSubmit}
              disabled={isSubmitting || !formState.consent_dsgvo}
              className="h-12 px-8 rounded-lg font-semibold disabled:opacity-50"
              style={{ background: '#10B981', color: '#FFFFFF' }}>
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Wird gesendet...</>
              ) : (
                <><Check className="w-4 h-4 mr-2" />Audit absenden</>
              )}
            </Button>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: '#52525B' }}>
            <Shield className="w-3 h-3 inline mr-1" />
            Deine Daten sind verschlusselt und werden gemaess DSGVO verarbeitet.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  STEP COMPONENTS                                                   */
/* ================================================================== */

/* ---- Segment Picker ---- */

const SEGMENT_OPTIONS = [
  {
    id: 'AG' as const,
    icon: <Users className="w-7 h-7" />,
    title: 'Agentur / Freelancer-Team',
    desc: 'Du betreust Kunden, erstellst Inhalte oder deliverst Projekte — als Team oder Solo.',
  },
  {
    id: 'PB' as const,
    icon: <Star className="w-7 h-7" />,
    title: 'Personal Brand / Creator / Coach',
    desc: 'Deine Marke bist du. Du baust eine Audience, monetarisierst Wissen oder launchst Kurse.',
  },
  {
    id: 'FI' as const,
    icon: <Building2 className="w-7 h-7" />,
    title: 'Unternehmen / Mittelstand',
    desc: 'Klassisches Unternehmen mit Team, internen Prozessen und B2B- oder B2C-Struktur.',
  },
];

function StepSegment({ value, onChange }: { value: Segment; onChange: (s: Segment) => void }) {
  return (
    <div className="space-y-4">
      {SEGMENT_OPTIONS.map((opt, i) => (
        <motion.div
          key={opt.id}
          custom={i}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <button
            type="button"
            onClick={() => onChange(opt.id)}
            className="w-full text-left rounded-xl p-5 transition-all duration-200 focus:outline-none"
            style={{
              background: value === opt.id ? 'rgba(224,164,88,0.1)' : 'rgba(255,255,255,0.02)',
              border: `1.5px solid ${value === opt.id ? 'rgba(224,164,88,0.6)' : 'rgba(255,255,255,0.08)'}`,
              boxShadow: value === opt.id ? '0 0 18px rgba(224,164,88,0.12)' : 'none',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5" style={{ color: value === opt.id ? '#e0a458' : '#52525B' }}>
                {opt.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base mb-1"
                  style={{ color: value === opt.id ? '#F9FAFB' : '#A1A1AA', fontFamily: "'Space Grotesk', sans-serif" }}>
                  {opt.title}
                </div>
                <div className="text-sm leading-relaxed" style={{ color: '#71717A' }}>
                  {opt.desc}
                </div>
              </div>
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center"
                style={{
                  borderColor: value === opt.id ? '#e0a458' : '#52525B',
                  background: value === opt.id ? '#e0a458' : 'transparent',
                }}>
                {value === opt.id && <Check className="w-3 h-3" style={{ color: '#0B0C10' }} />}
              </div>
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
}

/* ---- AG Questions ---- */

function StepAG({ data, onChange }: { data: AGData; onChange: (f: keyof AGData, v: string) => void }) {
  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Wie viele Kunden betreust du aktuell?</FieldLabel>
        <SelectInput
          value={data.kundenanzahl}
          onChange={v => onChange('kundenanzahl', v)}
          placeholder="Anzahl wahlen"
          options={[
            { value: '1-3', label: '1 – 3 Kunden' },
            { value: '4-10', label: '4 – 10 Kunden' },
            { value: '11-25', label: '11 – 25 Kunden' },
            { value: '25+', label: '25+ Kunden' },
          ]}
        />
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Was kostet dich am meisten Zeit?</FieldLabel>
        <CardOptions
          value={data.zeitfresser}
          onChange={v => onChange('zeitfresser', v)}
          options={AG_ZEITFRESSER_OPTIONS}
        />
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Monatlicher Umsatz</FieldLabel>
        <CardOptions
          value={data.monthly_revenue}
          onChange={v => onChange('monthly_revenue', v)}
          options={MONTHLY_REVENUE_OPTIONS}
        />
      </motion.div>
    </div>
  );
}

/* ---- PB Questions ---- */

function StepPB({ data, onChange }: { data: PBData; onChange: (f: keyof PBData, v: string) => void }) {
  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Dein Hauptkanal?</FieldLabel>
        <CardOptions
          value={data.hauptkanal}
          onChange={v => onChange('hauptkanal', v)}
          options={PB_KANAL_OPTIONS}
        />
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Was fallt dir schwer zu skalieren?</FieldLabel>
        <CardOptions
          value={data.skalierung}
          onChange={v => onChange('skalierung', v)}
          options={PB_SKALIERUNG_OPTIONS}
        />
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Monatlicher Umsatz</FieldLabel>
        <CardOptions
          value={data.monthly_revenue}
          onChange={v => onChange('monthly_revenue', v)}
          options={MONTHLY_REVENUE_OPTIONS}
        />
      </motion.div>
    </div>
  );
}

/* ---- FI Questions ---- */

function StepFI({ data, onChange }: { data: FIData; onChange: (f: keyof FIData, v: string) => void }) {
  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Branche</FieldLabel>
        <SelectInput
          value={data.branche}
          onChange={v => onChange('branche', v)}
          placeholder="Branche wahlen"
          options={FI_BRANCHE_OPTIONS}
        />
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Mitarbeiterzahl</FieldLabel>
        <CardOptions
          value={data.mitarbeiterzahl}
          onChange={v => onChange('mitarbeiterzahl', v)}
          options={FI_MITARBEITER_OPTIONS}
        />
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Groesster Pain?</FieldLabel>
        <CardOptions
          value={data.pain}
          onChange={v => onChange('pain', v)}
          options={FI_PAIN_OPTIONS}
        />
      </motion.div>
    </div>
  );
}

/* ---- Budget Step ---- */

function StepBudget({ data, onChange }: { data: BudgetData; onChange: (f: keyof BudgetData, v: string) => void }) {
  return (
    <div className="space-y-8">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Setup-Budget (einmalig)</FieldLabel>
        <p className="text-xs mb-4" style={{ color: '#71717A' }}>
          Wie viel kannst du einmalig in den Aufbau investieren? Hilft uns, das passende Paket vorzuschlagen.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUDGET_SETUP_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('setup', opt.value)}
              className="rounded-lg px-4 py-4 text-sm text-left transition-all duration-150"
              style={{
                background: data.setup === opt.value ? 'rgba(224,164,88,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${data.setup === opt.value ? 'rgba(224,164,88,0.6)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <div className="font-semibold mb-1" style={{ color: data.setup === opt.value ? '#F9FAFB' : '#A1A1AA' }}>
                {opt.label}
              </div>
              <div className="text-xs" style={{ color: '#71717A' }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Monatlicher Retainer (laufende Betreuung)</FieldLabel>
        <p className="text-xs mb-4" style={{ color: '#71717A' }}>
          Wie viel ist dir laufende Optimierung + Support pro Monat wert?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUDGET_RETAINER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('retainer', opt.value)}
              className="rounded-lg px-4 py-4 text-sm text-left transition-all duration-150"
              style={{
                background: data.retainer === opt.value ? 'rgba(224,164,88,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${data.retainer === opt.value ? 'rgba(224,164,88,0.6)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <div className="font-semibold mb-1" style={{ color: data.retainer === opt.value ? '#F9FAFB' : '#A1A1AA' }}>
                {opt.label}
              </div>
              <div className="text-xs" style={{ color: '#71717A' }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <div className="rounded-lg p-4" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <p className="text-xs" style={{ color: '#A1A1AA', lineHeight: 1.6 }}>
            <Shield className="w-3.5 h-3.5 inline mr-1.5" style={{ color: '#10B981' }} />
            Kein Cash für Setup, aber Wachstums-Case? Wir haben <span style={{ color: '#e0a458' }}>Cashflow- und Revenue-Share-Modelle</span>.
            Im Auto-Plan-PDF werden dir passende Alternativen automatisch vorgeschlagen.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ---- Contact Step ---- */

interface StepContactProps {
  data: ContactData;
  onChange: (f: keyof ContactData, v: string) => void;
  files: File[];
  fileError: string | null;
  dragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (idx: number) => void;
  onOpenFilePicker: () => void;
}

function StepContact({ data, onChange, files, fileError, dragOver, fileInputRef, onDragOver, onDragLeave, onDrop, onFileInputChange, onRemoveFile, onOpenFilePicker }: StepContactProps) {
  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Name</FieldLabel>
        <TextInput
          value={data.name}
          onChange={v => onChange('name', v)}
          placeholder="Max Mustermann"
        />
      </motion.div>

      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>E-Mail</FieldLabel>
        <TextInput
          type="email"
          value={data.email}
          onChange={v => onChange('email', v)}
          placeholder="max@beispiel.de"
        />
      </motion.div>

      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel optional>Telefon</FieldLabel>
        <TextInput
          type="tel"
          value={data.phone}
          onChange={v => onChange('phone', v)}
          placeholder="+49 123 456789"
        />
      </motion.div>

      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
        <FieldLabel required>Wie dringend ist es fur dich?</FieldLabel>
        <div className="space-y-3">
          {URGENCY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('urgency', opt.value)}
              className="w-full text-left rounded-lg px-4 py-3 text-sm transition-all duration-150"
              style={{
                background: data.urgency === opt.value ? 'rgba(224,164,88,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1.5px solid ${data.urgency === opt.value ? 'rgba(224,164,88,0.6)' : 'rgba(255,255,255,0.08)'}`,
                color: data.urgency === opt.value ? '#F9FAFB' : '#A1A1AA',
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* File upload */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
        <Label className="text-sm font-medium mb-3 block" style={{ color: '#F9FAFB' }}>
          <FileText className="w-4 h-4 inline mr-2" style={{ color: '#e0a458' }} />
          Dateien anhaengen <span className="text-xs" style={{ color: '#52525B' }}>(optional)</span>
        </Label>
        <div
          role="button" tabIndex={0}
          aria-label="Dateien auswaehlen oder per Drag and Drop hochladen"
          onClick={onOpenFilePicker}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenFilePicker(); } }}
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          className="rounded-lg border-2 border-dashed p-8 text-center transition-all cursor-pointer focus:outline-none"
          style={{
            background: dragOver ? 'rgba(224,164,88,0.06)' : 'rgba(255,255,255,0.02)',
            borderColor: dragOver ? 'rgba(224,164,88,0.4)' : 'rgba(255,255,255,0.1)',
          }}>
          <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: dragOver ? '#e0a458' : '#52525B' }} />
          <p className="text-sm font-medium" style={{ color: '#A1A1AA' }}>
            {dragOver ? 'Dateien hier ablegen' : 'Klicken oder per Drag & Drop'}
          </p>
          <p className="text-xs mt-1" style={{ color: '#52525B' }}>
            PDF, DOCX, XLSX, CSV, PNG, JPG — max. 5 Dateien a 10 MB
          </p>
        </div>

        <input
          ref={fileInputRef} type="file" multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
          onChange={onFileInputChange}
          className="hidden" aria-hidden="true"
        />

        {fileError && (
          <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#e0a458' }}>
            <AlertCircle className="w-3.5 h-3.5" />{fileError}
          </p>
        )}

        {files.length > 0 && (
          <ul className="mt-4 space-y-2" aria-label="Hochgeladene Dateien">
            {files.map((f, idx) => (
              <li key={`${f.name}-${f.size}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-lg p-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: '#e0a458' }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#F9FAFB' }} title={f.name}>{f.name}</p>
                    <p className="text-xs" style={{ color: '#52525B' }}>{formatBytes(f.size)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => onRemoveFile(idx)}
                  aria-label={`Datei ${f.name} entfernen`}
                  className="flex-shrink-0 p-1.5 rounded-md transition-colors" style={{ color: '#A1A1AA' }}>
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}

/* ---- Review Step ---- */

function StepReview({ formState, consent, onConsentChange, submitError }: {
  formState: FormState;
  consent: boolean;
  onConsentChange: (v: boolean) => void;
  submitError: string | null;
}) {
  const segmentLabel =
    formState.segment === 'AG' ? 'Agentur / Freelancer-Team' :
    formState.segment === 'PB' ? 'Personal Brand / Creator / Coach' :
    formState.segment === 'FI' ? 'Unternehmen / Mittelstand' : '—';

  const segmentRows: { label: string; value: string }[] =
    formState.segment === 'AG' ? [
      { label: 'Kunden aktuell', value: formState.ag.kundenanzahl },
      { label: 'Groesster Zeitfresser', value: AG_ZEITFRESSER_OPTIONS.find(o => o.value === formState.ag.zeitfresser)?.label || formState.ag.zeitfresser },
      { label: 'Monatlicher Umsatz', value: MONTHLY_REVENUE_OPTIONS.find(o => o.value === formState.ag.monthly_revenue)?.label || formState.ag.monthly_revenue },
    ] :
    formState.segment === 'PB' ? [
      { label: 'Hauptkanal', value: PB_KANAL_OPTIONS.find(o => o.value === formState.pb.hauptkanal)?.label || formState.pb.hauptkanal },
      { label: 'Skalierungs-Challenge', value: PB_SKALIERUNG_OPTIONS.find(o => o.value === formState.pb.skalierung)?.label || formState.pb.skalierung },
      { label: 'Monatlicher Umsatz', value: MONTHLY_REVENUE_OPTIONS.find(o => o.value === formState.pb.monthly_revenue)?.label || formState.pb.monthly_revenue },
    ] :
    formState.segment === 'FI' ? [
      { label: 'Branche', value: FI_BRANCHE_OPTIONS.find(o => o.value === formState.fi.branche)?.label || formState.fi.branche },
      { label: 'Mitarbeiterzahl', value: FI_MITARBEITER_OPTIONS.find(o => o.value === formState.fi.mitarbeiterzahl)?.label || formState.fi.mitarbeiterzahl },
      { label: 'Groesster Pain', value: FI_PAIN_OPTIONS.find(o => o.value === formState.fi.pain)?.label || formState.fi.pain },
    ] : [];

  const urgencyLabel = URGENCY_OPTIONS.find(o => o.value === formState.contact.urgency)?.label || formState.contact.urgency;
  const setupBudgetLabel = BUDGET_SETUP_OPTIONS.find(o => o.value === formState.budget.setup)?.label || '—';
  const retainerBudgetLabel = BUDGET_RETAINER_OPTIONS.find(o => o.value === formState.budget.retainer)?.label || '—';

  return (
    <div className="space-y-6">
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2"
          style={{ color: '#e0a458', fontFamily: "'Space Grotesk', sans-serif" }}>
          <Briefcase className="w-4 h-4" />Dein Profil
        </h3>

        {/* Segment block */}
        <ReviewBlock title="Typ">
          <ReviewRow label="Kategorie" value={segmentLabel} />
          {segmentRows.map(r => (
            <ReviewRow key={r.label} label={r.label} value={r.value} />
          ))}
        </ReviewBlock>

        {/* Budget block */}
        <ReviewBlock title="Investment">
          <ReviewRow label="Setup-Budget" value={setupBudgetLabel} />
          <ReviewRow label="Retainer / Mo" value={retainerBudgetLabel} />
        </ReviewBlock>

        {/* Contact block */}
        <ReviewBlock title="Kontakt">
          <ReviewRow label="Name" value={formState.contact.name} />
          <ReviewRow label="E-Mail" value={formState.contact.email} />
          {formState.contact.phone && <ReviewRow label="Telefon" value={formState.contact.phone} />}
          <ReviewRow label="Dringlichkeit" value={urgencyLabel} />
        </ReviewBlock>
      </motion.div>

      <Separator style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* DSGVO */}
      <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-row items-start space-x-3 rounded-lg p-4"
          style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <Checkbox
            id="consent_dsgvo"
            checked={consent}
            onCheckedChange={v => onConsentChange(v === true)}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="consent_dsgvo" style={{ color: '#F9FAFB' }}>
              <Shield className="w-4 h-4 inline mr-1" style={{ color: '#10B981' }} />
              DSGVO-Einwilligung <span style={{ color: '#EF4444' }}>*</span>
            </Label>
            <p className="text-xs" style={{ color: '#A1A1AA' }}>
              Ich willige ein, dass meine angegebenen Daten durch AEVUM zur Bearbeitung
              meiner Anfrage und Erstellung der Audit-Auswertung verarbeitet werden. Gemass{' '}
              <a href="#/datenschutz" target="_blank" rel="noopener noreferrer"
                style={{ color: '#e0a458', textDecoration: 'underline' }}>
                Datenschutzerklarung
              </a>
              . Widerruf per E-Mail an cwconsulting369@gmail.com.
            </p>
          </div>
        </div>
      </motion.div>

      {submitError && (
        <Alert variant="destructive" className="rounded-lg"
          style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/* ================================================================== */
/*  SHARED UI PRIMITIVES                                              */
/* ================================================================== */

function FieldLabel({ children, required, optional }: {
  children: React.ReactNode; required?: boolean; optional?: boolean;
}) {
  return (
    <label className="block text-sm font-medium mb-2" style={{ color: '#F9FAFB' }}>
      {children}
      {required && <span className="ml-1" style={{ color: '#EF4444' }}>*</span>}
      {optional && <span className="ml-1 text-xs" style={{ color: '#52525B' }}>(optional)</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-12 rounded-lg w-full px-4 text-sm focus:outline-none transition-colors"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#F9FAFB',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(224,164,88,0.5)'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
    />
  );
}

function SelectInput({ value, onChange, placeholder, options }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-12 rounded-lg w-full px-4 text-sm focus:outline-none transition-colors appearance-none cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: value ? '#F9FAFB' : '#52525B',
      }}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value} style={{ background: '#15161A', color: '#F9FAFB' }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function CardOptions({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="rounded-lg px-4 py-3 text-sm text-left transition-all duration-150 font-medium"
          style={{
            background: value === opt.value ? 'rgba(224,164,88,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${value === opt.value ? 'rgba(224,164,88,0.6)' : 'rgba(255,255,255,0.08)'}`,
            color: value === opt.value ? '#F9FAFB' : '#A1A1AA',
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4 mb-4"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <h4 className="text-xs uppercase tracking-[0.12em] font-semibold mb-3" style={{ color: '#e0a458' }}>
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: '#52525B' }}>{label}</span>
      <span className="text-right max-w-[60%]" style={{ color: '#F9FAFB' }}>{value}</span>
    </div>
  );
}
