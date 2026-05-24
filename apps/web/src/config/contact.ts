// Centralized contact + AEVUM mail-alias config.
// All UI components & legal pages MUST import from here.
// Wave G8 (2026-05-24): Mail-Aliases pro Use-Case.

export const AEVUM_EMAILS = {
  /** Allgemeine Kontakt-Anfragen (Footer, Hero-Contact, Default) */
  general: 'info@aevum-system.de',
  /** Rechtliches / Datenschutz / DSGVO / Widerruf */
  dsgvo: 'dsgvo@aevum-system.de',
  /** Shop / Stripe-Receipts / Blueprint-Downloads */
  shop: 'shop@aevum-system.de',
  /** Audit / Auto-Plan-PDFs / Call-Booking */
  audit: 'audit@aevum-system.de',
  /** SaaS-Signup / Credits / Run-Notifications */
  saas: 'saas@aevum-system.de',
  /** System / Magic-Links / Portal-Notifications */
  noreply: 'noreply@aevum-system.de',
  /** Founder direct (sparsam einsetzen) */
  founder: 'founder@aevum-system.de',
} as const;

export const CONTACT = {
  name: 'Carlos Wrusch',
  /** Default-Display in Footer / generic "Kontakt" CTAs. */
  email: AEVUM_EMAILS.general,
  /** Carlos's persoenliches Postfach — nur intern / legacy. */
  privateEmail: 'cwconsulting369@gmail.com',
  phone: '+49 177 228 83 72',
  company: 'AEVUM',
  whatsapp: 'https://wa.me/+491772288372?text=Hi%20Carlos%2C%20ich%20bin%20an%20einem%20AI%20System%20interessiert.',
  calendly: 'https://calendly.com/cwconsulting369/sales-at-lennoxos',
} as const;

export default CONTACT;
