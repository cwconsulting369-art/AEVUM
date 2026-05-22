import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ChevronLeft, ChevronRight, Upload, FileText,
  Shield, ArrowLeft, Calendar, Building2, X, AlertCircle,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

/* ------------------------------------------------------------------ */
/*  ZOD SCHEMA                                                        */
/* ------------------------------------------------------------------ */

const industryEnum = [
  'real-estate', 'e-commerce', 'b2b-saas', 'consulting', 'agency',
  'finance', 'healthcare', 'manufacturing', 'education',
  'hospitality', 'energy-consulting', 'other',
] as const;

const teamSizeEnum = ['solo', '2-5', '6-15', '16-50', '50+'] as const;
const revenueBandEnum = ['<100k', '100k-500k', '500k-1m', '1m-5m', '5m+', 'tbd'] as const;
const monthlyRangeEnum = ['<500', '500-2k', '2k-5k', '5k-15k', '15k+', 'tbd'] as const;
const setupWillingnessEnum = ['<1k', '1-5k', '5-15k', '15-50k', '50k+', 'tbd'] as const;

const auditFormSchema = z.object({
  unternehmen_name: z.string().min(1, 'Name ist erforderlich'),
  unternehmen_company: z.string().min(1, 'Firmenname ist erforderlich'),
  unternehmen_industry: z.enum(industryEnum),
  unternehmen_team_size: z.enum(teamSizeEnum),
  unternehmen_location: z.string().optional(),
  unternehmen_revenue_band: z.enum(revenueBandEnum).optional(),

  kontakt_email: z.string().email('Gueltige E-Mail erforderlich'),
  kontakt_phone: z.string().optional(),
  kontakt_preferred: z.enum(['email', 'phone', 'telegram', 'whatsapp']).default('email'),

  stack_tools: z.string().optional(),
  stack_crm: z.string().optional(),
  stack_automation: z.string().optional(),
  stack_data_storage: z.string().optional(),

  daten_sources: z.string().optional(),
  daten_quality_score: z.string().optional(),
  daten_silos: z.enum(['ja', 'nein', 'unsicher']).optional(),

  pain_biggest: z.string().min(1, 'Pflichtfeld'),
  pain_manual_hours: z.string().optional(),
  pain_bottleneck: z.string().optional(),

  ziele_90_days: z.string().min(1, 'Pflichtfeld'),
  ziele_12_months: z.string().optional(),
  ziele_success_metric: z.string().optional(),

  team_decision_makers: z.string().optional(),
  team_roles: z.string().optional(),

  budget_monthly: z.enum(monthlyRangeEnum).optional(),
  budget_setup: z.enum(setupWillingnessEnum).optional(),
  budget_revshare_open: z.boolean().default(false),

  consent_dsgvo: z.boolean().refine(v => v === true, {
    message: 'DSGVO-Zustimmung erforderlich',
  }),
});

type AuditFormData = z.infer<typeof auditFormSchema>;

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                         */
/* ------------------------------------------------------------------ */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.lennoxos.com';
const STORAGE_KEY = 'audit-form-draft';
const HELPBOT_PREFILL_KEY = 'aevum_audit_prefill'; // written by Helpbot.tsx on hand-off

interface HelpbotPrefill {
  helpbot_session_id?: string | null;
  saved_at?: string;
}

function loadHelpbotPrefill(): HelpbotPrefill | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HELPBOT_PREFILL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HelpbotPrefill;
    if (!parsed.helpbot_session_id) return null;
    // Expire after 24h — old prefills are stale
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

const STEPS = [
  { id: 1, label: 'Unternehmen', fields: ['unternehmen_name', 'unternehmen_company', 'unternehmen_industry', 'unternehmen_team_size', 'unternehmen_location', 'unternehmen_revenue_band'] },
  { id: 2, label: 'Kontakt', fields: ['kontakt_email', 'kontakt_phone', 'kontakt_preferred'] },
  { id: 3, label: 'Aktueller Stack', fields: ['stack_tools', 'stack_crm', 'stack_automation', 'stack_data_storage'] },
  { id: 4, label: 'Daten-Landschaft', fields: ['daten_sources', 'daten_quality_score', 'daten_silos'] },
  { id: 5, label: 'Pain-Points', fields: ['pain_biggest', 'pain_manual_hours', 'pain_bottleneck'] },
  { id: 6, label: 'Ziele', fields: ['ziele_90_days', 'ziele_12_months', 'ziele_success_metric'] },
  { id: 7, label: 'Team', fields: ['team_decision_makers', 'team_roles'] },
  { id: 8, label: 'Budget', fields: ['budget_monthly', 'budget_setup', 'budget_revshare_open'] },
  { id: 9, label: 'Review & Absenden', fields: ['consent_dsgvo'] },
] as const;

const INDUSTRY_LABELS: Record<(typeof industryEnum)[number], string> = {
  'real-estate': 'Immobilien', 'e-commerce': 'E-Commerce', 'b2b-saas': 'B2B SaaS',
  'consulting': 'Beratung', 'agency': 'Agentur', 'finance': 'Finanzen',
  'healthcare': 'Gesundheit', 'manufacturing': 'Produktion', 'education': 'Bildung',
  'hospitality': 'Hotellerie & Gastronomie', 'energy-consulting': 'Energieberatung', 'other': 'Sonstiges',
};

const TEAM_SIZE_LABELS: Record<(typeof teamSizeEnum)[number], string> = {
  'solo': 'Solo / Einzelperson', '2-5': '2-5 Mitarbeiter', '6-15': '6-15 Mitarbeiter',
  '16-50': '16-50 Mitarbeiter', '50+': '50+ Mitarbeiter',
};

const REVENUE_LABELS: Record<(typeof revenueBandEnum)[number], string> = {
  '<100k': '< 100k EUR', '100k-500k': '100k - 500k EUR', '500k-1m': '500k - 1 Mio EUR',
  '1m-5m': '1 - 5 Mio EUR', '5m+': '> 5 Mio EUR', 'tbd': 'Noch nicht festgelegt',
};

const MONTHLY_RANGE_LABELS: Record<(typeof monthlyRangeEnum)[number], string> = {
  '<500': '< 500 EUR', '500-2k': '500 - 2.000 EUR', '2k-5k': '2.000 - 5.000 EUR',
  '5k-15k': '5.000 - 15.000 EUR', '15k+': '> 15.000 EUR', 'tbd': 'Noch nicht festgelegt',
};

const SETUP_LABELS: Record<(typeof setupWillingnessEnum)[number], string> = {
  '<1k': '< 1.000 EUR', '1-5k': '1.000 - 5.000 EUR', '5-15k': '5.000 - 15.000 EUR',
  '15-50k': '15.000 - 50.000 EUR', '50k+': '> 50.000 EUR', 'tbd': 'Noch nicht festgelegt',
};

const PREFERRED_CONTACT_LABELS: Record<string, string> = {
  email: 'E-Mail', phone: 'Telefon', telegram: 'Telegram', whatsapp: 'WhatsApp',
};

const DATEN_SILOS_LABELS: Record<string, string> = {
  ja: 'Ja', nein: 'Nein', unsicher: 'Unsicher',
};

/* ------------------------------------------------------------------ */
/*  ANIMATIONS                                                        */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 120 : -120, opacity: 0 }),
};

function getStepFields(stepIndex: number): string[] {
  return STEPS[stepIndex]?.fields ?? [];
}

/* ================================================================== */
/*  MAIN                                                              */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  FILE UPLOAD CONSTANTS                                             */
/* ------------------------------------------------------------------ */

const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'text/csv',
  'image/png',
  'image/jpeg',
];
const ALLOWED_EXT_RE = /\.(pdf|docx?|xlsx?|csv|png|jpe?g)$/i;

interface UploadedFileMeta {
  filename: string;
  url: string;
  type?: string;
  size_bytes?: number;
}

function isAllowedFile(file: File): boolean {
  if (file.size > MAX_FILE_BYTES) return false;
  if (ALLOWED_FILE_TYPES.includes(file.type)) return true;
  // Fallback to extension check (some browsers/OS report empty MIME)
  return ALLOWED_EXT_RE.test(file.name);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Audit() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Helpbot hand-off: session id is forwarded so the backend can merge the
  // bot's pre-qualification extraction into this audit row.
  const [helpbotSessionId, setHelpbotSessionId] = useState<string | null>(null);
  const [showHelpbotBanner, setShowHelpbotBanner] = useState(false);

  const form = useForm<AuditFormData>({
    resolver: zodResolver(auditFormSchema),
    mode: 'onChange',
    defaultValues: {
      unternehmen_name: '', unternehmen_company: '', unternehmen_industry: undefined,
      unternehmen_team_size: undefined, unternehmen_location: '',
      unternehmen_revenue_band: undefined, kontakt_email: '', kontakt_phone: '',
      kontakt_preferred: 'email', stack_tools: '', stack_crm: '',
      stack_automation: '', stack_data_storage: '', daten_sources: '',
      daten_quality_score: undefined, daten_silos: undefined,
      pain_biggest: '', pain_manual_hours: '', pain_bottleneck: '',
      ziele_90_days: '', ziele_12_months: '', ziele_success_metric: '',
      team_decision_makers: '', team_roles: '',
      budget_monthly: undefined, budget_setup: undefined,
      budget_revshare_open: false, consent_dsgvo: false,
    },
  });

  /* -- Local-Storage Resume -- */
  useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        form.reset({ ...form.getValues(), ...parsed });
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -- Helpbot Hand-off Prefill -- */
  useEffect(() => {
    const prefill = loadHelpbotPrefill();
    if (prefill?.helpbot_session_id) {
      setHelpbotSessionId(prefill.helpbot_session_id);
      setShowHelpbotBanner(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (submitted) return;
    const sub = form.watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => sub.unsubscribe();
  }, [form, submitted]);

  /* -- Navigation -- */
  const goNext = useCallback(async () => {
    setSubmitError(null);
    const fields = getStepFields(step);
    const valid = await form.trigger(fields as (keyof AuditFormData)[]);
    if (valid) {
      setDirection(1);
      setStep(s => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step, form]);

  const goBack = useCallback(() => {
    setSubmitError(null);
    setDirection(-1);
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* -- File Upload Helpers -- */
  const addFiles = useCallback((incoming: FileList | File[]) => {
    setFileError(null);
    const list = Array.from(incoming);
    setFiles(prev => {
      const next: File[] = [...prev];
      for (const f of list) {
        if (next.length >= MAX_FILES) {
          setFileError(`Maximal ${MAX_FILES} Dateien erlaubt.`);
          break;
        }
        if (!isAllowedFile(f)) {
          setFileError(`"${f.name}" abgelehnt (Typ/Groesse). Erlaubt: PDF/DOCX/XLSX/CSV/PNG/JPG bis 10 MB.`);
          continue;
        }
        // De-dupe by name+size
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

  // Upload a single file → returns metadata or null on failure (silent skip per spec)
  const uploadOneFile = async (file: File): Promise<UploadedFileMeta | null> => {
    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      const res = await fetch(`${API_BASE}/api/audit/upload-file`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json?.ok || !json.url) return null;
      return {
        filename: file.name,
        url: json.url,
        type: file.type || undefined,
        size_bytes: typeof json.size_bytes === 'number' ? json.size_bytes : file.size,
      };
    } catch {
      return null;
    }
  };

  /* -- Submit -- */
  const onSubmit = async (data: AuditFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      // Step A: upload files first (failures silently skipped per spec)
      let uploadedFiles: UploadedFileMeta[] = [];
      if (files.length > 0) {
        const results = await Promise.all(files.map(f => uploadOneFile(f)));
        uploadedFiles = results.filter((r): r is UploadedFileMeta => r !== null);
      }

      // Step B: submit audit with uploaded-file metadata
      const payload: Record<string, unknown> = {
        form_version: 'v2',
        email: data.kontakt_email,
        name: data.unternehmen_name,
        company: data.unternehmen_company,
        phone: data.kontakt_phone || '',
        consent: data.consent_dsgvo,
        answers: data,
        uploaded_files: uploadedFiles,
        submitted_email: data.kontakt_email,
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
        const err = await res.text();
        setSubmitError(err || 'Ein Fehler ist aufgetreten.');
      }
    } catch {
      setSubmitError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = ((step + 1) / STEPS.length) * 100;
  const formValues = form.watch();

  /* -- Drag & Drop -- */
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const openFilePicker = () => fileInputRef.current?.click();

  /* ================================================================= */
  /*  SUBMITTED STATE                                                  */
  /* ================================================================= */

  if (submitted) {
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
              Vielen Dank!
            </h1>
            <p className="text-lg sm:text-xl mb-10 max-w-lg mx-auto"
              style={{ color: '#A1A1AA', lineHeight: 1.7 }}>
              Wir analysieren deine Antworten und senden dir innerhalb von 48 Stunden den Pitch-Report.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => { window.location.hash = '/'; }}
                className="h-12 px-8 text-base font-semibold rounded-lg"
                style={{ background: '#e0a458', color: '#0B0C10' }}>
                <ArrowLeft className="w-4 h-4 mr-2" />Zur Startseite
              </Button>
              <Button variant="outline"
                onClick={() => window.open('https://cal.com/lennox', '_blank')}
                className="h-12 px-8 text-base font-semibold rounded-lg"
                style={{ borderColor: 'rgba(224, 164, 88,0.4)', color: '#e0a458', background: 'transparent' }}>
                <Calendar className="w-4 h-4 mr-2" />Call buchen
              </Button>
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

      {/* --- Progress Header --- */}
      <div className="sticky top-0 z-30"
        style={{ background: 'rgba(11,12,16,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: '#A1A1AA' }}>
              Schritt {step + 1} von {STEPS.length}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#e0a458', fontFamily: "'Space Grotesk', sans-serif" }}>
              {STEPS[step].label}
            </span>
          </div>
          <Progress value={progressValue} className="h-1.5 w-full" />
          <div className="flex items-center justify-between mt-3">
            {STEPS.map((s, i) => (
              <button key={s.id} title={s.label}
                onClick={() => { if (i < step) { setDirection(-1); setStep(i); } }}
                disabled={i >= step}
                className="cursor-pointer disabled:cursor-default">
                <div className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: i <= step ? '#e0a458' : '#52525B',
                    transform: i === step ? 'scale(1.4)' : 'scale(1)',
                    boxShadow: i === step ? '0 0 10px rgba(224, 164, 88,0.4)' : 'none',
                  }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Form --- */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-24">
        {showHelpbotBanner && helpbotSessionId && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 rounded-xl border p-4 flex items-start justify-between gap-4"
            style={{ background: 'rgba(224, 164, 88, 0.08)', borderColor: 'rgba(224, 164, 88, 0.35)' }}
          >
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-[0.16em] font-medium mb-1" style={{ color: '#e0a458' }}>
                Daten aus AI-Beratung übernommen
              </div>
              <div className="text-sm leading-relaxed" style={{ color: '#E4E4E7' }}>
                Wir haben dich aus dem Chat erkannt und verknüpfen den Audit mit deiner Beratung.
                Bitte ergänze die Felder unten — unsere Analyse läuft sonst auf Lückenwerten.
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setShowHelpbotBanner(false); }}
              aria-label="Hinweis schließen"
              className="p-1 rounded text-[#a4a4ad] hover:text-[#F9FAFB] hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </motion.div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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

                    {/* Title */}
                    <div className="mb-8">
                      <Badge variant="outline" className="mb-3 text-xs"
                        style={{ borderColor: 'rgba(224, 164, 88,0.3)', color: '#e0a458', background: 'rgba(224, 164, 88,0.08)' }}>
                        Schritt {step + 1}
                      </Badge>
                      <h2 className="text-2xl sm:text-3xl font-bold"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F9FAFB' }}>
                        {STEPS[step].label}
                      </h2>
                      {step === 8 && (
                        <p className="mt-2 text-sm" style={{ color: '#A1A1AA' }}>
                          Überprüfe deine Angaben und sende das Formular ab.
                        </p>
                      )}
                    </div>

                    <Separator className="mb-8" style={{ background: 'rgba(255,255,255,0.06)' }} />

                    {/* ====== STEP 1: UNTERNEHMEN ====== */}
                    {step === 0 && (
                      <div className="space-y-6">
                        <MotionFormField delay={0}>
                          <RHFTextField control={form.control} name="unternehmen_name"
                            label="Name" required placeholder="Max Mustermann" />
                        </MotionFormField>
                        <MotionFormField delay={1}>
                          <RHFTextField control={form.control} name="unternehmen_company"
                            label="Firmenname" required placeholder="Muster GmbH" />
                        </MotionFormField>
                        <MotionFormField delay={2}>
                          <RHFSelectField control={form.control} name="unternehmen_industry"
                            label="Branche" required placeholder="Branche waehlen">
                            {industryEnum.map(ind => (
                              <SelectItem key={ind} value={ind}>{INDUSTRY_LABELS[ind]}</SelectItem>
                            ))}
                          </RHFSelectField>
                        </MotionFormField>
                        <MotionFormField delay={3}>
                          <RHFSelectField control={form.control} name="unternehmen_team_size"
                            label="Team-Groesse" required placeholder="Team-Groesse waehlen">
                            {teamSizeEnum.map(s => (
                              <SelectItem key={s} value={s}>{TEAM_SIZE_LABELS[s]}</SelectItem>
                            ))}
                          </RHFSelectField>
                        </MotionFormField>
                        <MotionFormField delay={4}>
                          <RHFTextField control={form.control} name="unternehmen_location"
                            label="Standort" optional placeholder="z.B. Berlin, Deutschland" />
                        </MotionFormField>
                        <MotionFormField delay={5}>
                          <RHFSelectField control={form.control} name="unternehmen_revenue_band"
                            label="Umsatz-Band" optional placeholder="Umsatz-Band waehlen">
                            {revenueBandEnum.map(r => (
                              <SelectItem key={r} value={r}>{REVENUE_LABELS[r]}</SelectItem>
                            ))}
                          </RHFSelectField>
                        </MotionFormField>
                      </div>
                    )}

                    {/* ====== STEP 2: KONTAKT ====== */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <MotionFormField delay={0}>
                          <RHFTextField control={form.control} name="kontakt_email"
                            label="E-Mail" required type="email" placeholder="max@beispiel.de" />
                        </MotionFormField>
                        <MotionFormField delay={1}>
                          <RHFTextField control={form.control} name="kontakt_phone"
                            label="Telefon" optional type="tel" placeholder="+49 123 456789" />
                        </MotionFormField>
                        <MotionFormField delay={2}>
                          <RHFSelectField control={form.control} name="kontakt_preferred"
                            label="Bevorzugter Kontakt" placeholder="Kontakt waehlen">
                            {(['email', 'phone', 'telegram', 'whatsapp'] as const).map(p => (
                              <SelectItem key={p} value={p}>{PREFERRED_CONTACT_LABELS[p]}</SelectItem>
                            ))}
                          </RHFSelectField>
                        </MotionFormField>
                      </div>
                    )}

                    {/* ====== STEP 3: STACK ====== */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <MotionFormField delay={0}>
                          <RHFTextArea control={form.control} name="stack_tools"
                            label="Tools in Nutzung" placeholder="z.B. HubSpot, Notion, Slack, Google Workspace..." />
                        </MotionFormField>
                        <MotionFormField delay={1}>
                          <RHFTextField control={form.control} name="stack_crm"
                            label="CRM-System" placeholder="z.B. HubSpot, Salesforce, Pipedrive..." />
                        </MotionFormField>
                        <MotionFormField delay={2}>
                          <RHFTextArea control={form.control} name="stack_automation"
                            label="Automation-Tools" placeholder="z.B. Make, Zapier, n8n, Activepieces..." />
                        </MotionFormField>
                        <MotionFormField delay={3}>
                          <RHFTextArea control={form.control} name="stack_data_storage"
                            label="Data-Storage" placeholder="z.B. PostgreSQL, MongoDB, Airtable, Google Sheets..." />
                        </MotionFormField>
                      </div>
                    )}

                    {/* ====== STEP 4: DATEN ====== */}
                    {step === 3 && (
                      <div className="space-y-6">
                        <MotionFormField delay={0}>
                          <RHFTextArea control={form.control} name="daten_sources"
                            label="Data Sources" placeholder="Welche Datenquellen nutzt du aktuell?" />
                        </MotionFormField>
                        <MotionFormField delay={1}>
                          <RHFSelectField control={form.control} name="daten_quality_score"
                            label="Daten-Qualitaet Self-Score (1-10)" placeholder="Bewerte deine Datenqualitaet">
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                          </RHFSelectField>
                        </MotionFormField>
                        <MotionFormField delay={2}>
                          <RHFSelectField control={form.control} name="daten_silos"
                            label="Data-Silos-Problem?" placeholder="Waehle eine Option">
                            {(['ja', 'nein', 'unsicher'] as const).map(o => (
                              <SelectItem key={o} value={o}>{DATEN_SILOS_LABELS[o]}</SelectItem>
                            ))}
                          </RHFSelectField>
                        </MotionFormField>
                      </div>
                    )}

                    {/* ====== STEP 5: PAIN-POINTS ====== */}
                    {step === 4 && (
                      <div className="space-y-6">
                        <MotionFormField delay={0}>
                          <RHFTextArea control={form.control} name="pain_biggest"
                            label="Groesster Zeitfresser" required placeholder="Was frisst aktuell die meiste Zeit?" />
                        </MotionFormField>
                        <MotionFormField delay={1}>
                          <RHFSelectField control={form.control} name="pain_manual_hours"
                            label="Manuelle Tasks pro Woche (Stunden)" placeholder="Schaetzung waehlen">
                            <SelectItem value="<5">&lt; 5 Stunden</SelectItem>
                            <SelectItem value="5-10">5 - 10 Stunden</SelectItem>
                            <SelectItem value="10-20">10 - 20 Stunden</SelectItem>
                            <SelectItem value="20+">20+ Stunden</SelectItem>
                            <SelectItem value="weiss-nicht">Weiss ich nicht</SelectItem>
                          </RHFSelectField>
                        </MotionFormField>
                        <MotionFormField delay={2}>
                          <RHFTextArea control={form.control} name="pain_bottleneck"
                            label="Aktueller Bottleneck" placeholder="Wo hakt es aktuell am meisten?" />
                        </MotionFormField>
                      </div>
                    )}

                    {/* ====== STEP 6: ZIELE ====== */}
                    {step === 5 && (
                      <div className="space-y-6">
                        <MotionFormField delay={0}>
                          <RHFTextArea control={form.control} name="ziele_90_days"
                            label="90-Tage-Ziel" required placeholder="Was moechtest du in den naechsten 90 Tagen erreichen?" />
                        </MotionFormField>
                        <MotionFormField delay={1}>
                          <RHFTextArea control={form.control} name="ziele_12_months"
                            label="12-Monate-Ziel" placeholder="Was sind deine Ziele fuer das kommende Jahr?" />
                        </MotionFormField>
                        <MotionFormField delay={2}>
                          <RHFTextField control={form.control} name="ziele_success_metric"
                            label="Success Metric" placeholder="z.B. 30% mehr Leads, 50% weniger manuelle Arbeit..." />
                        </MotionFormField>
                      </div>
                    )}

                    {/* ====== STEP 7: TEAM ====== */}
                    {step === 6 && (
                      <div className="space-y-6">
                        <MotionFormField delay={0}>
                          <RHFTextArea control={form.control} name="team_decision_makers"
                            label="Decision Makers" placeholder="Wer traegt die Entscheidungen bei neuen Tools/Prozessen?" />
                        </MotionFormField>
                        <MotionFormField delay={1}>
                          <RHFTextArea control={form.control} name="team_roles"
                            label="Team Roles" placeholder="Welche Rollen gibt es im Team?" />
                        </MotionFormField>
                      </div>
                    )}

                    {/* ====== STEP 8: BUDGET ====== */}
                    {step === 7 && (
                      <div className="space-y-6">
                        <MotionFormField delay={0}>
                          <RHFSelectField control={form.control} name="budget_monthly"
                            label="Monatliches Budget fuer Automatisierung & Tools" placeholder="Monatliches Budget waehlen">
                            {monthlyRangeEnum.map(r => (
                              <SelectItem key={r} value={r}>{MONTHLY_RANGE_LABELS[r]}</SelectItem>
                            ))}
                          </RHFSelectField>
                        </MotionFormField>
                        <MotionFormField delay={1}>
                          <RHFSelectField control={form.control} name="budget_setup"
                            label="Bereitschaft fuer einmaliges Setup-Budget" placeholder="Setup-Budget waehlen">
                            {setupWillingnessEnum.map(r => (
                              <SelectItem key={r} value={r}>{SETUP_LABELS[r]}</SelectItem>
                            ))}
                          </RHFSelectField>
                        </MotionFormField>
                        <MotionFormField delay={2}>
                          <FormField control={form.control} name="budget_revshare_open" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg p-4"
                              style={{ background: 'rgba(224, 164, 88,0.04)', border: '1px solid rgba(224, 164, 88,0.1)' }}>
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel style={{ color: '#F9FAFB' }}>Revenue-Share Model offen?</FormLabel>
                                <p className="text-xs" style={{ color: '#A1A1AA' }}>
                                  Ich bin offen fuer ein Erfolgs-basiertes Preismodell.
                                </p>
                              </div>
                            </FormItem>
                          )} />
                        </MotionFormField>
                      </div>
                    )}

                    {/* ====== STEP 9: REVIEW + SUBMIT ====== */}
                    {step === 8 && (
                      <div className="space-y-6">
                        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                          <ReviewSection values={formValues} />
                        </motion.div>

                        <Separator style={{ background: 'rgba(255,255,255,0.06)' }} />

                        {/* Drag & Drop Upload */}
                        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                          <Label className="text-sm font-medium mb-3 block" style={{ color: '#F9FAFB' }}>
                            <FileText className="w-4 h-4 inline mr-2" style={{ color: '#e0a458' }} />
                            Dateien anhaengen (optional)
                          </Label>
                          <div
                            role="button"
                            tabIndex={0}
                            aria-label="Dateien auswaehlen oder per Drag and Drop hochladen"
                            onClick={openFilePicker}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openFilePicker();
                              }
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className="rounded-lg border-2 border-dashed p-8 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                              background: dragOver ? 'rgba(224, 164, 88,0.06)' : 'rgba(255,255,255,0.02)',
                              borderColor: dragOver ? 'rgba(224, 164, 88,0.4)' : 'rgba(255,255,255,0.1)',
                            }}>
                            <Upload className="w-8 h-8 mx-auto mb-3"
                              style={{ color: dragOver ? '#e0a458' : '#52525B' }} />
                            <p className="text-sm font-medium" style={{ color: '#A1A1AA' }}>
                              {dragOver ? 'Dateien hier ablegen' : 'Klicken oder Dateien per Drag & Drop ziehen'}
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#52525B' }}>
                              PDF, DOCX, XLSX, CSV, PNG, JPG &mdash; max. 5 Dateien &agrave; 10 MB
                            </p>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,image/png,image/jpeg"
                            onChange={handleFileInputChange}
                            className="hidden"
                            aria-hidden="true"
                          />

                          {fileError && (
                            <p
                              className="text-xs mt-2 flex items-center gap-1.5"
                              style={{ color: '#e0a458' }}
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              {fileError}
                            </p>
                          )}

                          {files.length > 0 && (
                            <ul className="mt-4 space-y-2" aria-label="Hochgeladene Dateien">
                              {files.map((f, idx) => (
                                <li
                                  key={`${f.name}-${f.size}-${idx}`}
                                  className="flex items-center justify-between gap-3 rounded-lg p-3"
                                  style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                  }}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <FileText
                                      className="w-4 h-4 flex-shrink-0"
                                      style={{ color: '#e0a458' }}
                                    />
                                    <div className="min-w-0">
                                      <p
                                        className="text-sm font-medium truncate"
                                        style={{ color: '#F9FAFB' }}
                                        title={f.name}
                                      >
                                        {f.name}
                                      </p>
                                      <p className="text-xs" style={{ color: '#52525B' }}>
                                        {formatBytes(f.size)}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(idx)}
                                    aria-label={`Datei ${f.name} entfernen`}
                                    className="flex-shrink-0 p-1.5 rounded-md transition-colors"
                                    style={{ color: '#A1A1AA' }}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </motion.div>

                        <Separator style={{ background: 'rgba(255,255,255,0.06)' }} />

                        {/* DSGVO Consent */}
                        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                          <FormField control={form.control} name="consent_dsgvo" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg p-4"
                              style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel style={{ color: '#F9FAFB' }}>
                                  <Shield className="w-4 h-4 inline mr-1" style={{ color: '#10B981' }} />
                                  DSGVO-Einwilligung <span style={{ color: '#EF4444' }}>*</span>
                                </FormLabel>
                                <p className="text-xs" style={{ color: '#A1A1AA' }}>
                                  Ich willige ein, dass meine angegebenen Daten (Name, Firma, E-Mail,
                                  optional Telefon sowie meine Antworten zum Workflow-Audit) durch AEVUM
                                  zur Bearbeitung meiner Anfrage und Erstellung der Audit-Auswertung
                                  verarbeitet werden. Die Verarbeitung erfolgt gemäß unserer{' '}
                                  <a href="#/datenschutz" target="_blank" rel="noopener noreferrer"
                                     style={{ color: '#e0a458', textDecoration: 'underline' }}>
                                    Datenschutzerklärung
                                  </a>. Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft
                                  per E-Mail an cwconsulting369@gmail.com widerrufen.
                                </p>
                              </div>
                            </FormItem>
                          )} />
                          {form.formState.errors.consent_dsgvo && (
                            <p className="text-sm mt-2" style={{ color: '#EF4444' }}>
                              {form.formState.errors.consent_dsgvo.message}
                            </p>
                          )}
                        </motion.div>

                        {submitError && (
                          <Alert variant="destructive" className="rounded-lg"
                            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
                            <AlertDescription>{submitError}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* --- Navigation --- */}
            <div className="mt-8 flex items-center justify-between">
              <Button type="button" variant="outline" onClick={goBack} disabled={step === 0}
                className="h-12 px-6 rounded-lg font-medium disabled:opacity-30"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#F9FAFB', background: 'rgba(255,255,255,0.04)' }}>
                <ChevronLeft className="w-4 h-4 mr-2" />Zurueck
              </Button>

              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={goNext}
                  className="h-12 px-8 rounded-lg font-semibold"
                  style={{ background: '#e0a458', color: '#0B0C10' }}>
                  Weiter<ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}
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
                Deine Daten sind verschluesselt und werden gemaess DSGVO verarbeitet.
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  HELPER COMPONENTS                                                 */
/* ================================================================== */

function MotionFormField({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div custom={delay} variants={fadeUp} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

function RHFTextField({
  control, name, label, placeholder, required, optional, type = 'text',
}: {
  control: any; name: keyof AuditFormData; label: string; placeholder?: string;
  required?: boolean; optional?: boolean; type?: string;
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel style={{ color: '#F9FAFB' }}>
          {label}{' '}
          {required && <span style={{ color: '#EF4444' }}>*</span>}
          {optional && <span className="text-xs" style={{ color: '#52525B' }}>(optional)</span>}
        </FormLabel>
        <FormControl>
          <Input type={type} placeholder={placeholder} {...field}
            value={field.value ?? ''}
            className="h-12 rounded-lg w-full"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#F9FAFB' }} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

function RHFTextArea({
  control, name, label, placeholder, required, optional,
}: {
  control: any; name: keyof AuditFormData; label: string; placeholder?: string;
  required?: boolean; optional?: boolean;
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel style={{ color: '#F9FAFB' }}>
          {label}{' '}
          {required && <span style={{ color: '#EF4444' }}>*</span>}
          {optional && <span className="text-xs" style={{ color: '#52525B' }}>(optional)</span>}
        </FormLabel>
        <FormControl>
          <Textarea placeholder={placeholder} {...field}
            value={field.value ?? ''}
            className="min-h-[100px] rounded-lg w-full"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#F9FAFB' }} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

function RHFSelectField({
  control, name, label, placeholder, required, optional, children,
}: {
  control: any; name: keyof AuditFormData; label: string; placeholder?: string;
  required?: boolean; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel style={{ color: '#F9FAFB' }}>
          {label}{' '}
          {required && <span style={{ color: '#EF4444' }}>*</span>}
          {optional && <span className="text-xs" style={{ color: '#52525B' }}>(optional)</span>}
        </FormLabel>
        <Select onValueChange={field.onChange} value={field.value ?? ''}>
          <FormControl>
            <SelectTrigger className="h-12 rounded-lg w-full"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: field.value ? '#F9FAFB' : '#52525B' }}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>{children}</SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />
  );
}

/* ================================================================== */
/*  REVIEW SECTION                                                    */
/* ================================================================== */

function ReviewSection({ values }: { values: Partial<AuditFormData> }) {
  const sections = [
    {
      title: 'Unternehmen', icon: <Building2 className="w-4 h-4" style={{ color: '#e0a458' }} />,
      items: [
        { label: 'Name', value: values.unternehmen_name },
        { label: 'Firma', value: values.unternehmen_company },
        { label: 'Branche', value: values.unternehmen_industry ? INDUSTRY_LABELS[values.unternehmen_industry as keyof typeof INDUSTRY_LABELS] : undefined },
        { label: 'Team-Groesse', value: values.unternehmen_team_size ? TEAM_SIZE_LABELS[values.unternehmen_team_size as keyof typeof TEAM_SIZE_LABELS] : undefined },
        { label: 'Standort', value: values.unternehmen_location },
        { label: 'Umsatz-Band', value: values.unternehmen_revenue_band ? REVENUE_LABELS[values.unternehmen_revenue_band as keyof typeof REVENUE_LABELS] : undefined },
      ],
    },
    {
      title: 'Kontakt', icon: <Check className="w-4 h-4" style={{ color: '#e0a458' }} />,
      items: [
        { label: 'E-Mail', value: values.kontakt_email },
        { label: 'Telefon', value: values.kontakt_phone },
        { label: 'Bevorzugter Kontakt', value: values.kontakt_preferred ? PREFERRED_CONTACT_LABELS[values.kontakt_preferred] : undefined },
      ],
    },
    {
      title: 'Aktueller Stack', icon: <Check className="w-4 h-4" style={{ color: '#e0a458' }} />,
      items: [
        { label: 'Tools', value: values.stack_tools },
        { label: 'CRM', value: values.stack_crm },
        { label: 'Automation', value: values.stack_automation },
        { label: 'Data-Storage', value: values.stack_data_storage },
      ],
    },
    {
      title: 'Daten-Landschaft', icon: <Check className="w-4 h-4" style={{ color: '#e0a458' }} />,
      items: [
        { label: 'Data Sources', value: values.daten_sources },
        { label: 'Daten-Qualitaet', value: values.daten_quality_score ? `${values.daten_quality_score}/10` : undefined },
        { label: 'Data-Silos', value: values.daten_silos ? DATEN_SILOS_LABELS[values.daten_silos] : undefined },
      ],
    },
    {
      title: 'Pain-Points', icon: <Check className="w-4 h-4" style={{ color: '#e0a458' }} />,
      items: [
        { label: 'Groesster Zeitfresser', value: values.pain_biggest },
        { label: 'Manuelle Tasks/Woche', value: values.pain_manual_hours },
        { label: 'Bottleneck', value: values.pain_bottleneck },
      ],
    },
    {
      title: 'Ziele', icon: <Check className="w-4 h-4" style={{ color: '#e0a458' }} />,
      items: [
        { label: '90-Tage-Ziel', value: values.ziele_90_days },
        { label: '12-Monate-Ziel', value: values.ziele_12_months },
        { label: 'Success Metric', value: values.ziele_success_metric },
      ],
    },
    {
      title: 'Team', icon: <Check className="w-4 h-4" style={{ color: '#e0a458' }} />,
      items: [
        { label: 'Decision Makers', value: values.team_decision_makers },
        { label: 'Team Roles', value: values.team_roles },
      ],
    },
    {
      title: 'Budget', icon: <Check className="w-4 h-4" style={{ color: '#e0a458' }} />,
      items: [
        { label: 'Monatliches Budget', value: values.budget_monthly ? MONTHLY_RANGE_LABELS[values.budget_monthly as keyof typeof MONTHLY_RANGE_LABELS] : undefined },
        { label: 'Setup-Budget', value: values.budget_setup ? SETUP_LABELS[values.budget_setup as keyof typeof SETUP_LABELS] : undefined },
        { label: 'Revenue-Share offen', value: values.budget_revshare_open ? 'Ja' : values.budget_revshare_open === false ? 'Nein' : undefined },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F9FAFB' }}>
        Zusammenfassung
      </h3>
      {sections.map(section => {
        const hasValues = section.items.some(item => item.value !== undefined && item.value !== '' && item.value !== null);
        if (!hasValues) return null;
        return (
          <div key={section.title} className="rounded-lg p-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              {section.icon}
              <h4 className="text-sm font-semibold" style={{ color: '#e0a458' }}>{section.title}</h4>
            </div>
            <div className="space-y-2">
              {section.items.map(item => {
                if (!item.value) return null;
                return (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span style={{ color: '#52525B' }}>{item.label}</span>
                    <span className="text-right max-w-[60%]" style={{ color: '#F9FAFB' }}>{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
